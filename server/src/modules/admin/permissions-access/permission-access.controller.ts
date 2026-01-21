import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PermissionAccessService } from './permission-access.service';
import { CreatePermissionAccessDto } from './dto/create-permission-access.dto';
import { UpdatePermissionAccessDto } from './dto/update-permission-access.dto';
import { Roles, RolesGuard } from '../../auth/guards/roles.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { FindOptionsDto } from 'src/common/dto/find-all-query.dto';

@Controller('permission-access')
export class PermissionAccessController {
  constructor(private readonly permissionAccessService: PermissionAccessService) {}

  @Post()
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  create(@Body() createPermissionAccessDto: CreatePermissionAccessDto) {
    return this.permissionAccessService.create(createPermissionAccessDto);
  }

  @Get()
  findAll(@Query() options?: FindOptionsDto) {
    return this.permissionAccessService.findAll(options);
  }

  @Get(':permission')
  findOne(@Param('permission') permission: string, @Query() options?: FindOptionsDto) {
    return this.permissionAccessService.findOne(permission, options);
  }

  @Patch(':id')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  update(@Param('id') id: string, @Body() updatePermissionAccessDto: UpdatePermissionAccessDto) {
    return this.permissionAccessService.update(id, updatePermissionAccessDto);
  }

  @Delete(':id')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(@Param('id') id: string) {
    return this.permissionAccessService.remove(id);
  }
}
