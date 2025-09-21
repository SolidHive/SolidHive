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
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { FindAllQueryDto } from 'src/common/dto/find-all-query.dto';

@Controller('associations-announcements')
export class AssociationsAnnouncementsController {
  constructor(
    private readonly associationsAnnouncementsService: AssociationsAnnouncementsService,
  ) {}

  @Post()
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('user') // In future update, change Roles to AssociationsRoles
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
  findAll(@Query() options?: FindAllQueryDto) {
    return this.associationsAnnouncementsService.findAll(options);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() options?: FindAllQueryDto) {
    return this.associationsAnnouncementsService.findOne(id, options);
  }

  @Patch(':id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('user', 'admin')
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
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(@Param('id') id: string) {
    return this.associationsAnnouncementsService.remove(id);
  }
}
