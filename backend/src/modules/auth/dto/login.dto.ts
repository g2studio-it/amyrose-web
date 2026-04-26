import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'maria@example.com' })
  @IsEmail({}, { message: 'El email no es válido' })
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: 'SecurePass1' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MaxLength(72, { message: 'La contraseña no puede exceder 72 caracteres' })
  password!: string;
}
