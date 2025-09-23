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
import { ApiCookieAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import {
  AssociationPermissions,
  AssociationPermissionsGuard,
} from '../../guards/association-permissions.guard';
import { Permissions } from '../../../../common/enums/permissions';
import { UserAssociationDecorator } from '../../../../common/decorators/user-association.decorator';
import { UserAssociation } from '../users/entities/user-association.entity';

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
  @ApiParam({ name: 'associationId', type: 'string' })
  create(
    @Body()
    createAssociationRoleDto: CreateAssociationRoleDto,
    @UserAssociationDecorator() userAssociation: UserAssociation,
  ) {
    return this.associationsRolesService.create(
      createAssociationRoleDto,
      userAssociation,
    );
  }

  @Get('roles')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.ROLES_VIEW)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  findAll(
    @Param('associationId') associationId: string,
    @Query() options?: FindOptionsDto,
  ) {
    return this.associationsRolesService.findAll(associationId, options);
  }

  @Get('role/:id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.ROLES_VIEW)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  findOne(
    @Param('id') id: string,
    @Param('associationId') associationId: string,
    @Query() options?: FindOptionsDto,
  ) {
    return this.associationsRolesService.findOne(id, associationId, options);
  }

  @Patch('role/:id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.ROLES_UPDATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  update(
    @Param('id') id: string,
    @Param('associationId') associationId: string,
    @Body() updateAssociationsRoleDto: UpdateAssociationRoleDto,
  ) {
    return this.associationsRolesService.update(
      id,
      associationId,
      updateAssociationsRoleDto,
    );
  }

  @Delete('role/:id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.ROLES_DELETE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(
    @Param('id') id: string,
    @Param('associationId') associationId: string,
  ) {
    return this.associationsRolesService.remove(id, associationId);
  }
}
