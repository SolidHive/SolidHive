import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AssociationsAnnouncementsService } from './associations-announcements.service';
import { CreateAssociationAnnouncementDto } from './dto/create-association-announcement.dto';
import { UpdateAssociationAnnouncementDto } from './dto/update-association-announcement.dto';

@Controller('associations-announcements')
export class AssociationsAnnouncementsController {
  constructor(
    private readonly associationsAnnouncementsService: AssociationsAnnouncementsService,
  ) {}

  @Post()
  create(
    @Body()
    createAssociationAnnouncementDto: CreateAssociationAnnouncementDto,
  ) {
    return this.associationsAnnouncementsService.create(
      createAssociationAnnouncementDto,
    );
  }

  @Get()
  findAll() {
    return this.associationsAnnouncementsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.associationsAnnouncementsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateAssociationAnnouncementDto: UpdateAssociationAnnouncementDto,
  ) {
    return this.associationsAnnouncementsService.update(
      +id,
      updateAssociationAnnouncementDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.associationsAnnouncementsService.remove(+id);
  }
}
