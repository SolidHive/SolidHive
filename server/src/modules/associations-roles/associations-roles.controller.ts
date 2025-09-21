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
import { AssociationsRolesService } from './associations-roles.service';
import { CreateAssociationRoleDto } from './dto/create-association-role.dto';
import { UpdateAssociationRoleDto } from './dto/update-association-role.dto';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { FindAllQueryDto } from 'src/common/dto/find-all-query.dto';

@Controller('associations-roles')
export class AssociationsRolesController {
  constructor(
    private readonly associationsRolesService: AssociationsRolesService,
  ) {}

  @Post()
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('user') // In future update, change Roles to AssociationsRoles
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  create(
    @Body()
    createAssociationRoleDto: CreateAssociationRoleDto,
  ) {
    return this.associationsRolesService.create(createAssociationRoleDto);
  }

  @Get()
  findAll(@Query() options?: FindAllQueryDto) {
    return this.associationsRolesService.findAll(options);
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string, @Query() options?: FindAllQueryDto) {
    return this.associationsRolesService.findOne(id, options);
  }

  @Patch(':id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  update(
    @Param('id') id: string,
    @Body() updateAssociationsRoleDto: UpdateAssociationRoleDto,
  ) {
    return this.associationsRolesService.update(id, updateAssociationsRoleDto);
  }

  @Delete(':id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(@Param('id') id: string) {
    return this.associationsRolesService.remove(id);
  }
}
