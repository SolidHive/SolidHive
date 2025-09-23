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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RateLimitGuard } from '../../../../common/guards/rate-limit.guard';
import { AuthenticatedGuard } from '../../../auth/guards/authenticated.guard';
import { ApiCookieAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import {
  AssociationPermissions,
  AssociationPermissionsGuard,
} from '../../guards/association-permissions.guard';
import { Permissions } from '../../../../common/enums/permissions';
import { UserAssociation } from '../users/entities/user-association.entity';
import { UserAssociationDecorator } from '../../../../common/decorators/user-association.decorator';

@ApiTags('Association - Events')
@Controller('association/:associationId')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('event')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.EVENTS_CREATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiParam({ name: 'associationId', type: 'string' })
  create(
    @Body() createEventDto: CreateEventDto,
    @UserAssociationDecorator() userAssociation: UserAssociation,
  ) {
    return this.eventsService.create(createEventDto, userAssociation);
  }

  @Get('events')
  findAll(
    @Param('associationId') associationId: string,
    @Query() options?: FindOptionsDto,
  ) {
    return this.eventsService.findAll(associationId, options);
  }

  @Get('event/:id')
  findOne(
    @Param('id') id: string,
    @Param('associationId') associationId: string,
    @Query() options?: FindOptionsDto,
  ) {
    return this.eventsService.findOne(id, associationId, options);
  }

  @Patch('event/:id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.EVENTS_UPDATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  update(
    @Param('id') id: string,
    @Param('associationId') associationId: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, associationId, updateEventDto);
  }

  @Delete('event/:id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.EVENTS_DELETE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(
    @Param('id') id: string,
    @Param('associationId') associationId: string,
  ) {
    return this.eventsService.remove(id, associationId);
  }
}
