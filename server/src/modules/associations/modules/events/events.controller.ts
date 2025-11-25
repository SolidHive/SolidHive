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
import { AuthenticatedGuard } from '../../../auth/guards/authenticated.guard';
import { ApiCookieAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import {
  AssociationPermissions,
  AssociationPermissionsGuard,
} from '../../guards/association-permissions.guard';
import { Permissions } from '../../../../common/enums/permissions';
import { UserAssociationDecorator } from 'src/common/decorators/user-association.decorator';
import { UserAssociation } from '../users/entities/user-association.entity';

@ApiTags('Association - Events')
@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('events')
  findAllGlobal(@Query() options?: FindOptionsDto & { association?: string; date?: string }) {
    return this.eventsService.findAllGlobal(options);
  }

  @Post('association/:associationId/event')
  @UseGuards(AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.EVENTS_CREATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiParam({ name: 'associationId', type: 'string' })
  create(
    @Body() createEventDto: CreateEventDto,
    @UserAssociationDecorator() userAssociation: UserAssociation
  ) {
    return this.eventsService.create(createEventDto, userAssociation);
  }

  @Get('association/:associationId/events')
  findAll(@Param('associationId') associationId: string, @Query() options?: FindOptionsDto) {
    return this.eventsService.findAll(associationId, options);
  }

  @Get('association/:associationId/event/:id')
  findOne(
    @Param('id') id: string,
    @Param('associationId') associationId: string,
    @Query() options?: FindOptionsDto
  ) {
    return this.eventsService.findOne(id, associationId, options);
  }

  @Patch('association/:associationId/event/:id')
  @UseGuards(AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.EVENTS_UPDATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  update(
    @Param('id') id: string,
    @Param('associationId') associationId: string,
    @Body() updateEventDto: UpdateEventDto
  ) {
    return this.eventsService.update(id, associationId, updateEventDto);
  }

  @Delete('association/:associationId/event/:id')
  @UseGuards(AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.EVENTS_DELETE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(@Param('id') id: string, @Param('associationId') associationId: string) {
    return this.eventsService.remove(id, associationId);
  }
}
