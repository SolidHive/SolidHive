import { PartialType } from '@nestjs/swagger';
import { CreateEventRegisterDto } from './create-event-register.dto';

export class UpdateEventRegisterDto extends PartialType(
  CreateEventRegisterDto,
) {}
