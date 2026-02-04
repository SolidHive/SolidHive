import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersAssociationsService } from './users-associations.service';
import { AuthenticatedGuard } from '../../../auth/guards/authenticated.guard';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly usersAssociationsService: UsersAssociationsService) {}

  @Post('accept/:invitationId')
  @UseGuards(AuthenticatedGuard)
  @ApiResponse({ status: 200, description: 'Invitation acceptée avec succès' })
  @ApiResponse({ status: 400, description: 'Invitation invalide ou expirée' })
  @ApiResponse({ status: 404, description: 'Invitation non trouvée' })
  acceptInvitation(@Param('invitationId') invitationId: string) {
    return this.usersAssociationsService.acceptInvitation(invitationId);
  }

  @Post('reject/:invitationId')
  @UseGuards(AuthenticatedGuard)
  @ApiResponse({ status: 200, description: 'Invitation rejetée avec succès' })
  @ApiResponse({ status: 400, description: 'Invitation invalide ou expirée' })
  @ApiResponse({ status: 404, description: 'Invitation non trouvée' })
  rejectInvitation(@Param('invitationId') invitationId: string) {
    return this.usersAssociationsService.rejectInvitation(invitationId);
  }
}
