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
import { EventsPricingsService } from './events-pricings.service';
import { CreateEventPricingDto } from './dto/create-event-pricing.dto';
import { UpdateEventPricingDto } from './dto/update-event-pricing.dto';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { FindOptionsDto } from '../../common/dto/find-all-query.dto';
import { Permissions } from '../../common/enums/permissions';
import {
  AssociationPermissions,
  AssociationPermissionsGuard,
} from '../associations/guards/association-permissions.guard';

@Controller('events-pricings')
export class EventsPricingsController {
  constructor(private readonly eventsPricingsService: EventsPricingsService) {}

  @Post()
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.EVENTS_CREATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  create(@Body() createEventPricingDto: CreateEventPricingDto) {
    return this.eventsPricingsService.create(createEventPricingDto);
  }

  @Get()
  findAll(@Query() options?: FindOptionsDto) {
    return this.eventsPricingsService.findAll(options);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() options?: FindOptionsDto) {
    return this.eventsPricingsService.findOne(id, options);
  }

  @Patch(':id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.EVENTS_UPDATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  update(
    @Param('id') id: string,
    @Body() updateEventPricingDto: UpdateEventPricingDto,
  ) {
    return this.eventsPricingsService.update(id, updateEventPricingDto);
  }

  @Delete(':id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.EVENTS_DELETE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(@Param('id') id: string) {
    return this.eventsPricingsService.remove(id);
  }
}
