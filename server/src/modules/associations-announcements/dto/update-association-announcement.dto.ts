import { PartialType } from '@nestjs/swagger';
import { CreateAssociationAnnouncementDto } from './create-association-announcement.dto';

export class UpdateAssociationAnnouncementDto extends PartialType(
  CreateAssociationAnnouncementDto,
) {}
