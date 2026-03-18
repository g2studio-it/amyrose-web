import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
  ) {}

  /**
   * Get (or lazily create) the cart for a user.
   */
  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepo.findOne({
      where: { userId },
      relations: ['items'],
    });
    if (!cart) {
      cart = await this.cartRepo.save(this.cartRepo.create({ userId }));
    }
    return cart;
  }

  /**
   * Add a product variant to the cart.
   * If the variant is already in the cart its quantity is incremented.
   */
  async addItem(userId: string, dto: AddToCartDto): Promise<Cart> {
    const cart = await this.getCart(userId);

    const existing = await this.cartItemRepo.findOne({
      where: { cartId: cart.id, variantId: dto.variantId },
    });

    if (existing) {
      await this.cartItemRepo.update(existing.id, {
        quantity: existing.quantity + dto.quantity,
      });
    } else {
      await this.cartItemRepo.save(
        this.cartItemRepo.create({ ...dto, cartId: cart.id }),
      );
    }

    return this.getCart(userId);
  }

  /**
   * Update the quantity of a specific cart item.
   */
  async updateItem(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cart = await this.getCart(userId);

    const item = await this.cartItemRepo.findOne({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundException('Ítem no encontrado en el carrito');

    await this.cartItemRepo.update(itemId, { quantity: dto.quantity });
    return this.getCart(userId);
  }

  /**
   * Remove a single item from the cart.
   */
  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getCart(userId);

    const item = await this.cartItemRepo.findOne({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundException('Ítem no encontrado en el carrito');

    await this.cartItemRepo.delete(itemId);
    return this.getCart(userId);
  }

  /**
   * Remove all items from the user's cart.
   */
  async clearCart(userId: string): Promise<void> {
    const cart = await this.getCart(userId);
    await this.cartItemRepo.delete({ cartId: cart.id });
    this.logger.log(`Cart cleared for user ${userId}`);
  }
}
