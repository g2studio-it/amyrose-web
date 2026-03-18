import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/users/entities/user.entity';

export const ROLES_KEY = 'roles';

/** Restrict a route to specific roles (requires RolesGuard) */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
