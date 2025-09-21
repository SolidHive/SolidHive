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
import { FundraisingsService } from './fundraisings.service';
import { CreateFundraisingDto } from './dto/create-fundraising.dto';
import { UpdateFundraisingDto } from './dto/update-fundraising.dto';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { FindOptionsDto } from '../../common/dto/find-all-query.dto';

@Controller('fundraisings')
export class FundraisingsController {
  constructor(private readonly fundraisingsService: FundraisingsService) {}

  @Post()
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('user') // In future update, change Roles to AssociationsRoles
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  create(@Body() createFundraisingDto: CreateFundraisingDto) {
    return this.fundraisingsService.create(createFundraisingDto);
  }

  @Get()
  findAll(@Query() options?: FindOptionsDto) {
    return this.fundraisingsService.findAll(options);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() options?: FindOptionsDto) {
    return this.fundraisingsService.findOne(id, options);
  }

  @Patch(':id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  update(
    @Param('id') id: string,
    @Body() updateFundraisingDto: UpdateFundraisingDto,
  ) {
    return this.fundraisingsService.update(id, updateFundraisingDto);
  }

  @Delete(':id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(@Param('id') id: string) {
    return this.fundraisingsService.remove(id);
  }
}
