import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ description: 'UUID del producto' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ description: 'UUID de la variante' })
  @IsUUID()
  variantId!: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;
}
