import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Roles, RolesGuard } from '../../auth/guards/roles.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ApiCookieAuth, ApiResponse } from '@nestjs/swagger';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  getStatistics() {
    return this.statisticsService.getStatistics();
  }
}
