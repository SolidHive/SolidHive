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
  ParseUUIDPipe,
} from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { User } from '../../common/decorators/user.decorator';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { FindOptionsDto } from '../../common/dto/find-all-query.dto';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  create(@Body() createAnnouncementDto: CreateAnnouncementDto, @User('id') userId: string) {
    return this.announcementsService.create(createAnnouncementDto, userId);
  }

  @Get()
  findAll(@Query() options?: FindOptionsDto) {
    return this.announcementsService.findAll(options);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string, @Query() options?: FindOptionsDto) {
    return this.announcementsService.findOne(id, options);
  }

  @Patch(':id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  update(@Param('id') id: string, @Body() updateAnnouncementDto: UpdateAnnouncementDto) {
    return this.announcementsService.update(id, updateAnnouncementDto);
  }

  @Delete(':id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(@Param('id') id: string) {
    return this.announcementsService.remove(id);
  }
}
