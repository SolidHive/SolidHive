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
import { RateLimitGuard } from '../../../../../../common/guards/rate-limit.guard';
import { AuthenticatedGuard } from '../../../../../auth/guards/authenticated.guard';
import { ApiCookieAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindOptionsDto } from '../../../../../../common/dto/find-all-query.dto';
import { Permissions } from '../../../../../../common/enums/permissions';
import {
  AssociationPermissions,
  AssociationPermissionsGuard,
} from '../../../../guards/association-permissions.guard';

@ApiTags('Association - Event - Pricings')
@Controller('association/:associationId/event/:eventId')
export class EventsPricingsController {
  constructor(private readonly eventsPricingsService: EventsPricingsService) {}

  @Post('pricing')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.EVENTS_CREATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiParam({ name: 'associationId', type: 'string' })
  create(@Body() createEventPricingDto: CreateEventPricingDto, @Param('eventId') eventId: string) {
    return this.eventsPricingsService.create(createEventPricingDto, eventId);
  }

  @Get('pricings')
  @ApiParam({ name: 'associationId', type: 'string' })
  findAll(@Param('eventId') eventId: string, @Query() options?: FindOptionsDto) {
    return this.eventsPricingsService.findAll(eventId, options);
  }

  @Get('pricing/:id')
  @ApiParam({ name: 'associationId', type: 'string' })
  findOne(
    @Param('id') id: string,
    @Param('eventId') eventId: string,
    @Query() options?: FindOptionsDto
  ) {
    return this.eventsPricingsService.findOne(id, eventId, options);
  }

  @Patch('pricing/:id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.EVENTS_UPDATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiParam({ name: 'associationId', type: 'string' })
  update(
    @Param('id') id: string,
    @Param('eventId') eventId: string,
    @Body() updateEventPricingDto: UpdateEventPricingDto
  ) {
    return this.eventsPricingsService.update(id, eventId, updateEventPricingDto);
  }

  @Delete('pricing/:id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.EVENTS_DELETE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiParam({ name: 'associationId', type: 'string' })
  remove(@Param('id') id: string, @Param('eventId') eventId: string) {
    return this.eventsPricingsService.remove(id, eventId);
  }
}
