import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AssociationsRolesService } from './associations-roles.service';
import { CreateAssociationRoleDto } from './dto/create-association-role.dto';
import { UpdateAssociationRoleDto } from './dto/update-association-role.dto';

@Controller('associations-roles')
export class AssociationsRolesController {
  constructor(
    private readonly associationsRolesService: AssociationsRolesService,
  ) {}

  @Post()
  create(@Body() createAssociationsRoleDto: CreateAssociationRoleDto) {
    return this.associationsRolesService.create(createAssociationsRoleDto);
  }

  @Get()
  findAll() {
    return this.associationsRolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.associationsRolesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAssociationsRoleDto: UpdateAssociationRoleDto,
  ) {
    return this.associationsRolesService.update(+id, updateAssociationsRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.associationsRolesService.remove(+id);
  }
}
