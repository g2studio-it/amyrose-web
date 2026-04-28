import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsUUID,
  IsString,
  MaxLength,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsString()
  productId!: string;

  @ApiProperty({ description: 'ID de la variante' })
  @IsString()
  variantId!: string;

  @ApiProperty({ description: 'Cantidad', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ required: false, description: 'UUID de la dirección de entrega' })
  @IsOptional()
  @IsUUID()
  addressId?: string;

  @ApiProperty({ required: false, example: 'Sin TACC por favor', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiProperty({
    required: false,
    description: 'Items del carrito (si se omite, se leen del carrito del backend)',
    type: [CreateOrderItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items?: CreateOrderItemDto[];
}
