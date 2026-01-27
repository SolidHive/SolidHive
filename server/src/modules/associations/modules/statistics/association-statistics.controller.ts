import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AssociationStatisticsService } from './association-statistics.service';
import { AuthenticatedGuard } from '../../../auth/guards/authenticated.guard';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import {
  AssociationPermissions,
  AssociationPermissionsGuard,
} from '../../guards/association-permissions.guard';
import { Permissions } from '../../../../common/enums/permissions';

@ApiTags('Association Statistics')
@Controller('associations/:associationId/statistics')
export class AssociationStatisticsController {
  constructor(private readonly statisticsService: AssociationStatisticsService) {}

  @Get()
  @UseGuards(AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.STATISTICS_VIEW)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get association statistics' })
  @ApiResponse({ status: 200, description: 'Association statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiParam({ name: 'associationId', type: 'string' })
  async getStatistics(@Param('associationId') associationId: string) {
    return this.statisticsService.getAssociationStatistics(associationId);
  }
}
