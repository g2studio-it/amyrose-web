import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'maria@example.com' })
  @IsEmail({}, { message: 'El email no es válido' })
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: 'mipass123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(72, { message: 'La contraseña no puede exceder 72 caracteres' })
  password!: string;

  @ApiProperty({ example: 'María García', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: '+54 11 1234-5678', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^\+?[\d\s\-().]{7,30}$/, { message: 'Formato de teléfono inválido' })
  phone?: string;
}
