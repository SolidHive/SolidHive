import { PartialType } from '@nestjs/swagger';
import { CreateEventPricingDto } from './create-event-pricing.dto';

export class UpdateEventPricingDto extends PartialType(CreateEventPricingDto) {}
