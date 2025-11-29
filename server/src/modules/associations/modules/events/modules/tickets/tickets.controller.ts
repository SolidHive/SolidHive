import { Controller, Get, Param, StreamableFile, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { AuthenticatedGuard } from '../../../../../auth/guards/authenticated.guard';
import { User as UserDecorator } from '../../../../../../common/decorators/user.decorator';
import { User } from '../../../../../users/entities/user.entity';

@Controller('tickets')
@UseGuards(AuthenticatedGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  /**
   * Télécharger un billet d'événement
   */
  @Get('registration/:registrationId')
  async downloadTicket(
    @Param('registrationId') registrationId: string,
    @UserDecorator() user: User
  ): Promise<StreamableFile> {
    const fileStream = await this.ticketsService.getTicketStream(registrationId, user.id);
    return fileStream;
  }
}
