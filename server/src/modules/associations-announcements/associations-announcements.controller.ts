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
import { AssociationsAnnouncementsService } from './associations-announcements.service';
import { CreateAssociationAnnouncementDto } from './dto/create-association-announcement.dto';
import { UpdateAssociationAnnouncementDto } from './dto/update-association-announcement.dto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { FindOptionsDto } from '../../common/dto/find-all-query.dto';
import {
  AssociationPermissions,
  AssociationPermissionsGuard,
} from '../associations/guards/association-permissions.guard';
import { Permissions } from '../../common/enums/permissions';

@Controller('associations-announcements')
export class AssociationsAnnouncementsController {
  constructor(
    private readonly associationsAnnouncementsService: AssociationsAnnouncementsService,
  ) {}

  @Post()
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.ANNOUNCEMENTS_CREATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  create(
    @Body()
    createAssociationAnnouncementDto: CreateAssociationAnnouncementDto,
  ) {
    return this.associationsAnnouncementsService.create(
      createAssociationAnnouncementDto,
    );
  }

  @Get()
  findAll(@Query() options?: FindOptionsDto) {
    return this.associationsAnnouncementsService.findAll(options);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() options?: FindOptionsDto) {
    return this.associationsAnnouncementsService.findOne(id, options);
  }

  @Patch(':id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.ANNOUNCEMENTS_UPDATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  update(
    @Param('id') id: string,
    @Body()
    updateAssociationAnnouncementDto: UpdateAssociationAnnouncementDto,
  ) {
    return this.associationsAnnouncementsService.update(
      id,
      updateAssociationAnnouncementDto,
    );
  }

  @Delete(':id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.ANNOUNCEMENTS_DELETE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(@Param('id') id: string) {
    return this.associationsAnnouncementsService.remove(id);
  }
}
