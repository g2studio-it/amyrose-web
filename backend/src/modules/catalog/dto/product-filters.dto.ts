import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../users/dto/pagination-query.dto';

export class ProductFiltersDto extends PaginationQueryDto {
  @ApiProperty({ required: false, description: 'Filtrar por UUID de categoría' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ required: false, description: 'Filtrar por slug de categoría' })
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiProperty({ required: false, description: 'Solo productos destacados' })
  @IsOptional()
  @Transform(({ value }: { value: string }) => value === 'true')
  @IsBoolean()
  featured?: boolean;
}
