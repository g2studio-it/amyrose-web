import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { UserRole } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos los usuarios — solo ADMIN' })
  @ApiResponse({ status: 200, description: 'Lista paginada', type: [UserResponseDto] })
  findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() me: JwtPayload,
  ) {
    if (me.role !== UserRole.ADMIN && me.sub !== id) {
      throw new ForbiddenException('No puedes ver el perfil de otro usuario');
    }
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() me: JwtPayload,
  ) {
    return this.usersService.update(id, dto, me.sub, me.role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar usuario (soft delete) — solo ADMIN' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({ status: 204, description: 'Usuario eliminado' })
  remove(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }
}
