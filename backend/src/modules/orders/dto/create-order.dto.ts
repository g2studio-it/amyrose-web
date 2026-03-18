import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsString, MaxLength } from 'class-validator';

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
}
