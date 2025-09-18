import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EventsRegistersService } from './events-registers.service';
import { CreateEventRegisterDto } from './dto/create-event-register.dto';
import { UpdateEventRegisterDto } from './dto/update-events-register.dto';

@Controller('events-registers')
export class EventsRegistersController {
  constructor(
    private readonly eventsRegistersService: EventsRegistersService,
  ) {}

  @Post()
  create(@Body() createEventRegisterDto: CreateEventRegisterDto) {
    return this.eventsRegistersService.create(createEventRegisterDto);
  }

  @Get()
  findAll() {
    return this.eventsRegistersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsRegistersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventRegisterDto: UpdateEventRegisterDto,
  ) {
    return this.eventsRegistersService.update(+id, updateEventRegisterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsRegistersService.remove(+id);
  }
}
