import { PartialType } from '@nestjs/swagger';
import { CreateFundraisingDto } from './create-fundraising.dto';

export class UpdateFundraisingDto extends PartialType(CreateFundraisingDto) {}
