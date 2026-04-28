import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CartService } from '../cart/cart.service';
import { CatalogService } from '../catalog/catalog.service';
import { UserRole } from '../users/entities/user.entity';
import { PaginationQueryDto, PaginatedResult } from '../users/dto/pagination-query.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    private readonly cartService: CartService,
    private readonly catalogService: CatalogService,
  ) {}

  /**
   * Create a new order from the user's current cart contents.
   * Validates all variants are active and clears the cart on success.
   */
  async createFromCart(userId: string, dto: CreateOrderDto): Promise<Order> {
    this.logger.log(`Creating order for user ${userId}`);

    // Use items from the request body if provided; otherwise fall back to the backend cart
    let rawItems: Array<{ productId: string; variantId: string; quantity: number }>;

    if (dto.items?.length) {
      rawItems = dto.items;
    } else {
      const cart = await this.cartService.getCart(userId);
      if (!cart.items?.length) {
        throw new BadRequestException('El carrito está vacío');
      }
      rawItems = cart.items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      }));
    }

    // Build order items and calculate totals
    const orderItems: Partial<OrderItem>[] = [];
    let subtotal = 0;

    for (const item of rawItems) {
      const product = await this.catalogService.findProductById(item.productId);
      const variant = product.variants.find((v) => v.id === item.variantId);

      if (!variant?.isActive) {
        throw new BadRequestException(
          `La variante "${variant?.name ?? item.variantId}" ya no está disponible`,
        );
      }

      const itemSubtotal = variant.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId,
        productName: product.name,
        variantName: variant.name,
        quantity: item.quantity,
        unitPrice: variant.price,
        subtotal: itemSubtotal,
      });
    }

    const deliveryFee = 0; // Extend with delivery logic as needed
    const total = subtotal + deliveryFee;

    const order = await this.orderRepo.save(
      this.orderRepo.create({
        userId,
        addressId: dto.addressId,
        notes: dto.notes,
        subtotal,
        deliveryFee,
        total,
      }),
    );

    const items = orderItems.map((i) =>
      this.orderItemRepo.create({ ...i, orderId: order.id }),
    );
    await this.orderItemRepo.save(items);

    // Clear cart after successful order creation
    await this.cartService.clearCart(userId);

    return this.findById(order.id, userId, UserRole.ADMIN);
  }

  /**
   * List orders with pagination.
   * Admins see all orders; customers see only their own.
   */
  async findAll(
    query: PaginationQueryDto,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<PaginatedResult<Order>> {
    const { page = 1, limit = 10 } = query;

    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .orderBy('order.createdAt', 'DESC');

    if (requesterRole !== UserRole.ADMIN) {
      qb.where('order.userId = :userId', { userId: requesterId });
    }

    qb.skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  /**
   * Find a single order by ID.
   * Customers can only access their own orders.
   */
  async findById(
    id: string,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<Order> {
    const order = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.id = :id', { id })
      .getOne();

    if (!order) throw new NotFoundException(`Pedido '${id}' no encontrado`);

    if (requesterRole !== UserRole.ADMIN && order.userId !== requesterId) {
      throw new ForbiddenException('No tienes acceso a este pedido');
    }

    return order;
  }

  /**
   * Update order or payment status (admin only).
   */
  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    this.logger.log(`Updating order ${id} status`);

    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Pedido '${id}' no encontrado`);

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('No se puede modificar un pedido cancelado');
    }

    await this.orderRepo.update(id, dto);
    return this.orderRepo.findOneOrFail({ where: { id }, relations: ['items'] });
  }

  /**
   * Cancel an order.
   * Customers can only cancel PENDING orders; admins can cancel any non-cancelled order.
   */
  async cancelOrder(
    id: string,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<Order> {
    const order = await this.findById(id, requesterId, requesterRole);

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('El pedido ya está cancelado');
    }

    if (requesterRole !== UserRole.ADMIN && order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Solo puedes cancelar pedidos en estado PENDING');
    }

    await this.orderRepo.update(id, { status: OrderStatus.CANCELLED });
    return this.orderRepo.findOneOrFail({ where: { id }, relations: ['items'] });
  }
}
