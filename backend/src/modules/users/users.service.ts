import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto, PaginatedResult } from './dto/pagination-query.dto';

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepo: UsersRepository) {}

  /**
   * Create a new user after validating email uniqueness and hashing the password.
   */
  async create(dto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user: ${dto.email}`);

    const existing = await this.usersRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Ya existe una cuenta registrada con este email');
    }

    const hashed = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    return this.usersRepo.create({ ...dto, password: hashed });
  }

  /**
   * Return all users with pagination and optional search (admin only).
   */
  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<User>> {
    return this.usersRepo.findAll(query);
  }

  /**
   * Find a user by ID — throws 404 if not found.
   */
  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findById(id);
    if (!user) throw new NotFoundException(`Usuario '${id}' no encontrado`);
    return user;
  }

  /**
   * Find a user by email (internal — does not throw if missing).
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findByEmail(email);
  }

  /**
   * Find user including password hash — for authentication only.
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepo.findByEmailWithPassword(email);
  }

  /**
   * Update user fields. Customers can only modify their own profile.
   */
  async update(
    id: string,
    dto: UpdateUserDto,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<User> {
    this.logger.log(`Updating user ${id} by ${requesterId}`);

    if (requesterRole !== UserRole.ADMIN && id !== requesterId) {
      throw new ForbiddenException('Solo puedes modificar tu propio perfil');
    }

    await this.findById(id);
    const updated = await this.usersRepo.update(id, dto);
    if (!updated) throw new NotFoundException(`Usuario '${id}' no encontrado`);
    return updated;
  }

  /**
   * Soft-delete a user (admin only — enforced at controller level via @Roles).
   */
  async softDelete(id: string): Promise<void> {
    this.logger.log(`Soft-deleting user ${id}`);
    await this.findById(id);
    await this.usersRepo.softDelete(id);
  }

  /**
   * Store a bcrypt-hashed refresh token for a user (null to clear on logout).
   */
  async setRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    if (refreshToken === null) {
      await this.usersRepo.setRefreshToken(userId, null);
      return;
    }
    const hashed = await bcrypt.hash(refreshToken, BCRYPT_SALT_ROUNDS);
    await this.usersRepo.setRefreshToken(userId, hashed);
  }

  /**
   * Compare a plain refresh token against the stored hash.
   * Returns the user if valid, null otherwise.
   */
  async validateRefreshToken(userId: string, token: string): Promise<User | null> {
    const user = await this.usersRepo.findByIdWithRefreshToken(userId);
    if (!user?.refreshToken) return null;
    const matches = await bcrypt.compare(token, user.refreshToken);
    return matches ? user : null;
  }
}
