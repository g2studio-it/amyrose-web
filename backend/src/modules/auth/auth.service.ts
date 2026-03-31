import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto, TokensResponseDto } from './dto/auth-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validate credentials — used internally by LocalStrategy.
   * Returns the user if valid, null otherwise (never throws for wrong creds).
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user?.password) return null;

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;

    if (!user.isActive) {
      throw new UnauthorizedException('Cuenta desactivada. Contacta con soporte.');
    }

    return user;
  }

  /**
   * Register a new user and return a token pair.
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(`New registration: ${dto.email}`);

    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Ya existe una cuenta con este email');
    }

    const user = await this.usersService.create(dto);
    const tokens = await this.issueTokens(user);
    await this.usersService.setRefreshToken(user.id, tokens.refreshToken);

    return {
      user: plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }),
      ...tokens,
    };
  }

  /**
   * Login and return a token pair.
   */
  async login(user: User): Promise<AuthResponseDto> {
    this.logger.log(`Login: ${user.email}`);
    const tokens = await this.issueTokens(user);
    await this.usersService.setRefreshToken(user.id, tokens.refreshToken);

    return {
      user: plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }),
      ...tokens,
    };
  }

  /**
   * Rotate refresh token — invalidates old one and issues a new pair.
   */
  async refreshTokens(userId: string, token: string): Promise<TokensResponseDto> {
    const user = await this.usersService.validateRefreshToken(userId, token);
    if (!user) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const tokens = await this.issueTokens(user);
    await this.usersService.setRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  /**
   * Logout — clears the stored refresh token hash.
   */
  async logout(userId: string): Promise<void> {
    this.logger.log(`Logout: ${userId}`);
    await this.usersService.setRefreshToken(userId, null);
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private async issueTokens(user: User): Promise<TokensResponseDto> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiration', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiration', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
