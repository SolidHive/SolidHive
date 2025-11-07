import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { EventsRegistersService } from './events-registers.service';
import { CreateEventRegisterDto } from './dto/create-event-register.dto';
import { Roles, RolesGuard } from '../../../../../auth/guards/roles.guard';
import { ApiCookieAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../../../../../../modules/auth/guards/authenticated.guard';
import { User } from '../../../../../../common/decorators/user.decorator';
import { FindOptionsDto } from '../../../../../../common/dto/find-all-query.dto';

@ApiTags('Association - Event - Registers')
@Controller('association/:associationId/event/:eventId')
export class EventsRegistersController {
  constructor(private readonly eventsRegistersService: EventsRegistersService) {}

  @Post('register')
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiParam({ name: 'associationId', type: 'string' })
  @ApiParam({ name: 'eventId', type: 'string' })
  create(@Body() createEventRegisterDto: CreateEventRegisterDto, @User('id') userId?: string) {
    return this.eventsRegistersService.create(createEventRegisterDto, userId);
  }

  @Get('registers')
  @ApiParam({ name: 'associationId', type: 'string' })
  findAll(@Param('eventId') eventId: string, @Query() options?: FindOptionsDto) {
    return this.eventsRegistersService.findAll(eventId, options);
  }

  @Get('register/:id')
  @ApiParam({ name: 'associationId', type: 'string' })
  findOne(
    @Param('id') id: string,
    @Param('eventId') eventId: string,
    @Query() options?: FindOptionsDto
  ) {
    return this.eventsRegistersService.findOne(id, eventId, options);
  }

  @Delete('register/:id')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiParam({ name: 'associationId', type: 'string' })
  remove(@Param('id') id: string, @Param('eventId') eventId: string) {
    return this.eventsRegistersService.remove(id, eventId);
  }
}
