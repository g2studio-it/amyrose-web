import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../users/dto/pagination-query.dto';

export class ProductFiltersDto extends PaginationQueryDto {
  @ApiProperty({ required: false, description: 'Filtrar por ID de categoría' })
  @IsOptional()
  @IsString()
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
