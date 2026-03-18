import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'maria@example.com' })
  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @ApiProperty({
    example: 'SecurePass1',
    minLength: 8,
    description: 'Mínimo 8 caracteres, al menos una mayúscula y un número',
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(128)
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una mayúscula y un número',
  })
  password!: string;

  @ApiProperty({ example: 'María García', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
