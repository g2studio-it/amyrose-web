import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { PaginationQueryDto } from '../users/dto/pagination-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear pedido desde el carrito actual' })
  createFromCart(@CurrentUser() me: JwtPayload, @Body() dto: CreateOrderDto) {
    return this.ordersService.createFromCart(me.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pedidos (propios o todos si ADMIN)' })
  findAll(@CurrentUser() me: JwtPayload, @Query() query: PaginationQueryDto) {
    return this.ordersService.findAll(query, me.sub, me.role);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'UUID del pedido' })
  @ApiOperation({ summary: 'Obtener detalle de un pedido' })
  findOne(
    @CurrentUser() me: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.ordersService.findById(id, me.sub, me.role);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiParam({ name: 'id', description: 'UUID del pedido' })
  @ApiOperation({ summary: 'Actualizar estado del pedido — solo ADMIN' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }

  @Patch(':id/cancel')
  @ApiParam({ name: 'id', description: 'UUID del pedido' })
  @ApiOperation({ summary: 'Cancelar un pedido' })
  cancel(
    @CurrentUser() me: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.ordersService.cancelOrder(id, me.sub, me.role);
  }
}
