import {
  Controller,
  Get,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserManagementService } from './user-management.service';
import { AuthenticatedGuard } from '../../../modules/auth/guards/authenticated.guard';
import { Roles, RolesGuard } from '../../../modules/auth/guards/roles.guard';
import { UpdateUserDto, UpdateUserRoleDto } from './dto/update-user.dto';
import { FindOptionsDto } from '../../../common/dto/find-all-query.dto';

@ApiTags('Admin - Gestion des utilisateurs')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(AuthenticatedGuard, RolesGuard)
@Roles('admin')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs' })
  async findAll(@Query() options: FindOptionsDto) {
    return this.userManagementService.findAll(options);
  }

  @Get('roles')
  @ApiOperation({ summary: 'Récupérer tous les rôles disponibles' })
  @ApiResponse({ status: 200, description: 'Liste des rôles' })
  async getAllRoles() {
    return this.userManagementService.getAllRoles();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un utilisateur par son ID' })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userManagementService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userManagementService.update(id, updateUserDto);
  }

  @Put(':id/roles')
  @ApiOperation({ summary: "Mettre à jour les rôles d'un utilisateur" })
  @ApiResponse({ status: 200, description: 'Rôles mis à jour' })
  @ApiResponse({ status: 404, description: 'Utilisateur ou rôle non trouvé' })
  async updateRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto
  ) {
    return this.userManagementService.updateRoles(id, updateUserRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Bannir un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur banni avec succès' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async banUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.userManagementService.banUser(id);
  }
}
