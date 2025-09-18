import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersAssociationsService } from './users-associations.service';
import { CreateUsersAssociationDto } from './dto/create-users-association.dto';
import { UpdateUsersAssociationDto } from './dto/update-users-association.dto';

@Controller('users-associations')
export class UsersAssociationsController {
  constructor(
    private readonly usersAssociationsService: UsersAssociationsService,
  ) {}

  @Post()
  create(@Body() createUsersAssociationDto: CreateUsersAssociationDto) {
    return this.usersAssociationsService.create(createUsersAssociationDto);
  }

  @Get()
  findAll() {
    return this.usersAssociationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersAssociationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUsersAssociationDto: UpdateUsersAssociationDto,
  ) {
    return this.usersAssociationsService.update(+id, updateUsersAssociationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersAssociationsService.remove(+id);
  }
}
