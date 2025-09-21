import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AssociationsService } from './associations.service';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { User } from 'src/common/decorators/user.decorator';
import { FindAllQueryDto } from 'src/common/dto/find-all-query.dto';

@Controller('associations')
export class AssociationsController {
  constructor(private readonly associationsService: AssociationsService) {}

  @Post()
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('user')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  create(
    @Body() createAssociationDto: CreateAssociationDto,
    @User('id') userId: string,
  ) {
    return this.associationsService.create(createAssociationDto, userId);
  }

  @Get()
  findAll(@Query() options?: FindAllQueryDto) {
    return this.associationsService.findAll(options);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() options?: FindAllQueryDto) {
    return this.associationsService.findOne(id, options);
  }

  @Patch(':id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  update(
    @Param('id') id: string,
    @Body() updateAssociationDto: UpdateAssociationDto,
  ) {
    return this.associationsService.update(id, updateAssociationDto);
  }

  @Delete(':id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(@Param('id') id: string) {
    return this.associationsService.remove(id);
  }
}
