import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthResponseDto {
  @ApiProperty({ type: () => UserResponseDto })
  user!: UserResponseDto;

  @ApiProperty({ description: 'JWT access token (válido 15 minutos)' })
  accessToken!: string;

  @ApiProperty({ description: 'JWT refresh token (válido 7 días)' })
  refreshToken!: string;
}

export class TokensResponseDto {
  @ApiProperty({ description: 'Nuevo access token' })
  accessToken!: string;

  @ApiProperty({ description: 'Nuevo refresh token (rotado)' })
  refreshToken!: string;
}
