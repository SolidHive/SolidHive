import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { EventsRegistersService } from './events-registers.service';
import { CreateEventRegisterDto } from './dto/create-event-register.dto';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { User } from '../../common/decorators/user.decorator';
import { FindOptionsDto } from '../../common/dto/find-all-query.dto';

@Controller('events-registers')
export class EventsRegistersController {
  constructor(
    private readonly eventsRegistersService: EventsRegistersService,
  ) {}

  @Post()
  @UseGuards(RateLimitGuard)
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  create(
    @Body() createEventRegisterDto: CreateEventRegisterDto,
    @User('id') userId?: string,
  ) {
    return this.eventsRegistersService.create(createEventRegisterDto, userId);
  }

  @Get()
  findAll(@Query() options?: FindOptionsDto) {
    return this.eventsRegistersService.findAll(options);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() options?: FindOptionsDto) {
    return this.eventsRegistersService.findOne(id, options);
  }

  @Delete(':id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(@Param('id') id: string) {
    return this.eventsRegistersService.remove(id);
  }
}
