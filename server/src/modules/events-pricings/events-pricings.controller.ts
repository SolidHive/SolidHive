import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EventsPricingsService } from './events-pricings.service';
import { CreateEventPricingDto } from './dto/create-event-pricing.dto';
import { UpdateEventPricingDto } from './dto/update-event-pricing.dto';

@Controller('events-pricings')
export class EventsPricingsController {
  constructor(private readonly eventsPricingsService: EventsPricingsService) {}

  @Post()
  create(@Body() createEventPricingDto: CreateEventPricingDto) {
    return this.eventsPricingsService.create(createEventPricingDto);
  }

  @Get()
  findAll() {
    return this.eventsPricingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsPricingsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventPricingDto: UpdateEventPricingDto,
  ) {
    return this.eventsPricingsService.update(+id, updateEventPricingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsPricingsService.remove(+id);
  }
}
