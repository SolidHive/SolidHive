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
import { AssociationsService } from './associations.service';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { User } from '../../common/decorators/user.decorator';
import { FindOptionsDto } from '../../common/dto/find-all-query.dto';
import {
  AssociationPermissions,
  AssociationPermissionsGuard,
} from './guards/association-permissions.guard';
import { Permissions } from 'src/common/enums/permissions';

@Controller()
export class AssociationsController {
  constructor(private readonly associationsService: AssociationsService) {}

  @Post('association')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('user')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  create(@Body() createAssociationDto: CreateAssociationDto, @User('id') userId: string) {
    return this.associationsService.create(createAssociationDto, userId);
  }

  @Get('associations')
  findAll(@Query() options?: FindOptionsDto) {
    return this.associationsService.findAll(options);
  }

  @Get('association/:associationId')
  findOne(@Param('associationId') id: string, @Query() options?: FindOptionsDto) {
    return this.associationsService.findOne(id, options);
  }

  @Patch('association/:associationId')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.ASSOCIATION_UPDATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  update(@Param('associationId') id: string, @Body() updateAssociationDto: UpdateAssociationDto) {
    return this.associationsService.update(id, updateAssociationDto);
  }

  @Delete('association/:associationId')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.ASSOCIATION_REMOVE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(@Param('associationId') id: string) {
    return this.associationsService.remove(id);
  }
}
