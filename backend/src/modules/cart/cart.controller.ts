import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Cart')
@ApiBearerAuth('access-token')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener el carrito del usuario autenticado' })
  getCart(@CurrentUser() me: JwtPayload) {
    return this.cartService.getCart(me.sub);
  }

  @Post('items')
  @ApiOperation({ summary: 'Agregar producto al carrito' })
  addItem(@CurrentUser() me: JwtPayload, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(me.sub, dto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Actualizar cantidad de un ítem' })
  @ApiParam({ name: 'id', description: 'UUID del ítem del carrito' })
  updateItem(
    @CurrentUser() me: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(me.sub, id, dto);
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un ítem del carrito' })
  @ApiParam({ name: 'id', description: 'UUID del ítem del carrito' })
  removeItem(
    @CurrentUser() me: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.cartService.removeItem(me.sub, id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Vaciar el carrito' })
  clearCart(@CurrentUser() me: JwtPayload) {
    return this.cartService.clearCart(me.sub);
  }
}
