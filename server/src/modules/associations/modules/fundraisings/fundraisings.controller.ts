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
import { RateLimitGuard } from '../../../../common/guards/rate-limit.guard';
import { AuthenticatedGuard } from '../../../auth/guards/authenticated.guard';
import { ApiCookieAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import {
  AssociationPermissions,
  AssociationPermissionsGuard,
} from '../../guards/association-permissions.guard';
import { Permissions } from '../../../../common/enums/permissions';

@ApiTags('Association - Fundraisings')
@Controller('association/:associationId')
export class FundraisingsController {
  constructor(private readonly fundraisingsService: FundraisingsService) {}

  @Post('fundraising')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.FUNDRAISINGS_CREATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  create(@Body() createFundraisingDto: CreateFundraisingDto) {
    return this.fundraisingsService.create(createFundraisingDto);
  }

  @Get('fundraisings')
  findAll(@Query() options?: FindOptionsDto) {
    return this.fundraisingsService.findAll(options);
  }

  @Get('fundraising/:id')
  findOne(@Param('id') id: string, @Query() options?: FindOptionsDto) {
    return this.fundraisingsService.findOne(id, options);
  }

  @Patch('fundraising/:id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.FUNDRAISINGS_UPDATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  update(
    @Param('id') id: string,
    @Body() updateFundraisingDto: UpdateFundraisingDto,
  ) {
    return this.fundraisingsService.update(id, updateFundraisingDto);
  }

  @Delete('fundraising/:id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.FUNDRAISINGS_DELETE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(@Param('id') id: string) {
    return this.fundraisingsService.remove(id);
  }
}
