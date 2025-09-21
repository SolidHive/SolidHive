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
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { User } from 'src/common/decorators/user.decorator';
import { FindAllQueryDto } from 'src/common/dto/find-all-query.dto';

@Controller('users-associations')
export class UsersAssociationsController {
  constructor(
    private readonly usersAssociationsService: UsersAssociationsService,
  ) {}

  @Post()
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('user')
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

  @Get()
  findAll(@Query() options?: FindAllQueryDto) {
    return this.usersAssociationsService.findAll(options);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() options?: FindAllQueryDto) {
    return this.usersAssociationsService.findOne(id, options);
  }

  // You can update the role of an user in an association (ex: from member to admin)
  // Only a specific role created by the association can do it (ex: super admin of the association)
  @Patch(':id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('user') // In future update, change Roles to AssociationsRoles
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  update(
    @Param('id') id: string,
    @Body() updateUsersAssociationDto: UpdateUsersAssociationDto,
  ) {
    return this.usersAssociationsService.update(id, updateUsersAssociationDto);
  }

  // To remove an user from an association, the user himself can do it and an admin from the association too
  @Delete(':id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('user') // In future update, change Roles to AssociationsRoles
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(@Param('id') id: string) {
    return this.usersAssociationsService.remove(id);
  }
}
