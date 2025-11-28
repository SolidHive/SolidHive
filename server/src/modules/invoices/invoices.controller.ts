import { Controller, Get, Param, UseGuards, StreamableFile } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('invoices')
@Controller('invoices')
@UseGuards(AuthenticatedGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get('transaction/:transactionId')
  @ApiOperation({ summary: "Télécharger la facture d'une transaction" })
  @ApiResponse({ status: 200, description: 'Facture PDF' })
  @ApiResponse({ status: 404, description: 'Transaction non trouvée' })
  async downloadInvoice(
    @Param('transactionId') transactionId: string,
    @User('id') userId: string
  ): Promise<StreamableFile> {
    return await this.invoicesService.getInvoiceStream(transactionId, userId);
  }
}
