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
import { RateLimitGuard } from '../../../../common/guards/rate-limit.guard';
import { AuthenticatedGuard } from '../../../auth/guards/authenticated.guard';
import { ApiCookieAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import {
  AssociationPermissions,
  AssociationPermissionsGuard,
} from '../../guards/association-permissions.guard';
import { Permissions } from '../../../../common/enums/permissions';

@ApiTags('Association - Roles')
@Controller('association/:associationId')
export class AssociationsRolesController {
  constructor(
    private readonly associationsRolesService: AssociationsRolesService,
  ) {}

  @Post('role')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.ROLES_CREATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  create(
    @Body()
    createAssociationRoleDto: CreateAssociationRoleDto,
  ) {
    return this.associationsRolesService.create(createAssociationRoleDto);
  }

  @Get('roles')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.ROLES_VIEW)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  findAll(@Query() options?: FindOptionsDto) {
    return this.associationsRolesService.findAll(options);
  }

  @Get('role/:id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.ROLES_VIEW)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  findOne(@Param('id') id: string, @Query() options?: FindOptionsDto) {
    return this.associationsRolesService.findOne(id, options);
  }

  @Patch('role/:id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.ROLES_UPDATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  update(
    @Param('id') id: string,
    @Body() updateAssociationsRoleDto: UpdateAssociationRoleDto,
  ) {
    return this.associationsRolesService.update(id, updateAssociationsRoleDto);
  }

  @Delete('role/:id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.ROLES_DELETE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(@Param('id') id: string) {
    return this.associationsRolesService.remove(id);
  }
}
