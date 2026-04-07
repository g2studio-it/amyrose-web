import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  Matches,
  IsNumber,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateProductVariantDto {
  @ApiProperty({ example: "Pequeña (6 porciones)" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: "TORTA-CHOC-S", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string;

  @ApiProperty({ example: 2500.0, description: "Precio en ARS" })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiProperty({ example: 10, required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}

export class CreateProductDto {
  @ApiProperty({ example: "uuid-de-categoria" })
  @IsString()
  categoryId!: string;

  @ApiProperty({ example: "Torta de Chocolate" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: "torta-de-chocolate" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  @Matches(/^[a-z0-9-]+$/, {
    message: "El slug solo puede contener minúsculas, números y guiones",
  })
  slug!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({
    type: [CreateProductVariantDto],
    description: "Al menos una variante",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants!: CreateProductVariantDto[];
}
