import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'maria@example.com' })
  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @ApiProperty({ example: 'SecurePass1' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password!: string;
}
