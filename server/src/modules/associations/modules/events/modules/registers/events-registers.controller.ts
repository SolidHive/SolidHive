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
import { Roles, RolesGuard } from '../../../../../auth/guards/roles.guard';
import { ApiCookieAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';
import { AuthenticatedGuard } from '../../../../../../modules/auth/guards/authenticated.guard';
import { User } from '../../../../../../common/decorators/user.decorator';
import { FindOptionsDto } from '../../../../../../common/dto/find-all-query.dto';

@ApiTags('Association - Event - Registers')
@Controller('association/:associationId/event/:eventId')
export class EventsRegistersController {
  constructor(
    private readonly eventsRegistersService: EventsRegistersService,
  ) {}

  @Post('register')
  @UseGuards(RateLimitGuard)
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  create(
    @Body() createEventRegisterDto: CreateEventRegisterDto,
    @User('id') userId?: string,
  ) {
    return this.eventsRegistersService.create(createEventRegisterDto, userId);
  }

  @Get('registers')
  findAll(@Query() options?: FindOptionsDto) {
    return this.eventsRegistersService.findAll(options);
  }

  @Get('register/:id')
  findOne(@Param('id') id: string, @Query() options?: FindOptionsDto) {
    return this.eventsRegistersService.findOne(id, options);
  }

  @Delete('register/:id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(@Param('id') id: string) {
    return this.eventsRegistersService.remove(id);
  }
}
