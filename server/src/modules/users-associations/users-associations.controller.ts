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
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { User } from '../../common/decorators/user.decorator';
import { FindOptionsDto } from '../../common/dto/find-all-query.dto';
import {
  AssociationPermissions,
  AssociationPermissionsGuard,
} from '../associations/guards/association-permissions.guard';
import { Permissions } from '../../common/enums/permissions';

@Controller('users-associations')
export class UsersAssociationsController {
  constructor(
    private readonly usersAssociationsService: UsersAssociationsService,
  ) {}

  @Post()
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.REGISTERS_CREATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  create(
    @Body() createUsersAssociationDto: CreateUsersAssociationDto,
    @User('id') userId: string,
  ) {
    return this.usersAssociationsService.create(
      createUsersAssociationDto,
      userId,
    );
  }

  @Get(':userAssociationId')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.REGISTERS_VIEW)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  findAll(
    @Param('userAssociationId') userAssociationId: string,
    @Query() options?: FindOptionsDto,
  ) {
    return this.usersAssociationsService.findAll(userAssociationId, options);
  }

  @Get(':userAssociationId/:id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.REGISTERS_VIEW)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  findOne(
    @Param('userAssociationId') userAssociationId: string,
    @Param('id') id: string,
    @Query() options?: FindOptionsDto,
  ) {
    return this.usersAssociationsService.findOne(
      userAssociationId,
      id,
      options,
    );
  }

  // You can update the role of an user in an association (ex: from member to admin)
  // Only a specific role created by the association can do it (ex: super admin of the association)
  @Patch(':id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.REGISTERS_UPDATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  update(
    @Param('userAssociationId') userAssociationId: string,
    @Param('id') id: string,
    @Body() updateUsersAssociationDto: UpdateUsersAssociationDto,
  ) {
    return this.usersAssociationsService.update(
      userAssociationId,
      id,
      updateUsersAssociationDto,
    );
  }

  // To remove an user from an association, the user himself can do it and an admin from the association too
  @Delete(':id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.REGISTERS_DELETE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(
    @Param('userAssociationId') userAssociationId: string,
    @Param('id') id: string,
  ) {
    return this.usersAssociationsService.remove(userAssociationId, id);
  }
}
