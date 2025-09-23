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
import { UsersAssociationsService } from './users-associations.service';
import { CreateUsersAssociationDto } from './dto/create-users-association.dto';
import { UpdateUsersAssociationDto } from './dto/update-users-association.dto';
import { RateLimitGuard } from '../../../../common/guards/rate-limit.guard';
import { AuthenticatedGuard } from '../../../auth/guards/authenticated.guard';
import { ApiCookieAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '../../../../common/decorators/user.decorator';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import {
  AssociationPermissions,
  AssociationPermissionsGuard,
} from '../../guards/association-permissions.guard';
import { Permissions } from '../../../../common/enums/permissions';

@ApiTags('Association - Users')
@Controller('association/:associationId')
export class UsersAssociationsController {
  constructor(
    private readonly usersAssociationsService: UsersAssociationsService,
  ) {}

  @Post('user')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.REGISTERS_CREATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  create(
    @Body() createUsersAssociationDto: CreateUsersAssociationDto,
    @User('id') userId: string,
    @Param('associationId') associationId: string,
  ) {
    return this.usersAssociationsService.create(
      createUsersAssociationDto,
      userId,
      associationId,
    );
  }

  @Get('users')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.REGISTERS_VIEW)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  findAll(
    @Param('associationId') associationId: string,
    @Query() options?: FindOptionsDto,
  ) {
    return this.usersAssociationsService.findAll(associationId, options);
  }

  @Get('user/:id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.REGISTERS_VIEW)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  findOne(
    @Param('id') id: string,
    @Param('associationId') associationId: string,
    @Query() options?: FindOptionsDto,
  ) {
    return this.usersAssociationsService.findOne(id, associationId, options);
  }

  // You can update the role of an user in an association (ex: from member to admin)
  // Only a specific role created by the association can do it (ex: super admin of the association)
  @Patch('user/:id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.REGISTERS_UPDATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  update(
    @Param('id') id: string,
    @Param('associationId') associationId: string,
    @Body() updateUsersAssociationDto: UpdateUsersAssociationDto,
  ) {
    return this.usersAssociationsService.update(
      id,
      associationId,
      updateUsersAssociationDto,
    );
  }

  // To remove an user from an association, the user himself can do it and an admin from the association too
  @Delete('user/:id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.REGISTERS_DELETE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(
    @Param('id') id: string,
    @Param('associationId') associationId: string,
  ) {
    return this.usersAssociationsService.remove(id, associationId);
  }
}
