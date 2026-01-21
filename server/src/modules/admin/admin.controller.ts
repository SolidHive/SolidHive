import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { ApiCookieAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateAssociationStatusDto } from './dto/update-association-status.dto';
import { FindOptionsDto } from '../../common/dto/find-all-query.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(AuthenticatedGuard, RolesGuard)
@Roles('admin')
@ApiCookieAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('associations')
  @ApiResponse({ status: 200, description: 'Liste de toutes les associations' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin uniquement' })
  findAllAssociations(@Query() options?: FindOptionsDto) {
    return this.adminService.findAllAssociations(options);
  }

  @Patch('association/:associationId/status')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: "Statut de l'association mis à jour avec succès" })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Admin uniquement' })
  @ApiResponse({ status: 404, description: 'Association non trouvée' })
  async updateAssociationStatus(
    @Param('associationId') associationId: string,
    @Body() updateStatusDto: UpdateAssociationStatusDto
  ) {
    return this.adminService.updateAssociationStatus(associationId, updateStatusDto);
  }
}
