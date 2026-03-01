import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { EventRegister } from './entities/event-register.entity';
import { User } from '../../../../../../modules/users/entities/user.entity';
import { CreateEventRegisterDto } from './dto/create-event-register.dto';
import { FindOptionsDto } from 'src/common/dto/find-all-query.dto';
import { EventPricing } from '../pricings/entities/event-pricing.entity';
import { EventPaymentService } from '../../../../../payments/services/event-payment.service';
import { Transaction } from '../../../../../transactions/entities/transaction.entity';
import { EmailService } from '../../../../../../common/utils/email/email.service';
import { InvoicesService } from '../../../../../invoices/invoices.service';
import { File } from '../../../../../files/entities/file.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class EventsRegistersService {
  private cancellationTemplate: HandlebarsTemplateDelegate;

  constructor(
    @InjectRepository(EventRegister)
    private readonly eventsRegisterRepository: Repository<EventRegister>,
    @InjectRepository(EventPricing)
    private readonly eventsPricingRepository: Repository<EventPricing>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly eventPaymentService: EventPaymentService,
    private readonly emailService: EmailService,
    private readonly invoicesService: InvoicesService
  ) {
    this.loadEmailTemplates();
  }

  private loadEmailTemplates() {
    const cancellationTemplatePath = path.join(
      process.cwd(),
      'src/common/utils/email/templates/event-registration-cancellation.html'
    );
    try {
      const cancellationContent = fs.readFileSync(cancellationTemplatePath, 'utf8');
      this.cancellationTemplate = Handlebars.compile(cancellationContent);
    } catch (error) {
      console.error('Erreur chargement template annulation inscription:', error);
    }
  }

  async create(createEventRegisterDto: CreateEventRegisterDto, userId?: string) {
    const user = userId ? await this.usersRepository.findOne({ where: { id: userId } }) : null;

    const eventPricing = await this.eventsPricingRepository.findOne({
      where: { id: createEventRegisterDto.eventPricingId },
    });

    if (!eventPricing) {
      throw new HttpException('Event pricing not found', HttpStatus.NOT_FOUND);
    }

    const eventRegister = this.eventsRegisterRepository.create({
      eventPricing,
      user,
      participantFirstName: createEventRegisterDto.participantFirstName || null,
      participantLastName: createEventRegisterDto.participantLastName || null,
      participantEmail: createEventRegisterDto.participantEmail || null,
    });

    return this.eventsRegisterRepository.save(eventRegister);
  }

  findAll(eventId: string, options?: FindOptionsDto) {
    return this.eventsRegisterRepository.find({
      ...options,
      where: { eventPricing: { event: { id: eventId } } },
      relations: ['user', 'eventPricing'],
    });
  }

  async findUserRegisters(eventId: string, userId: string) {
    const registers = await this.eventsRegisterRepository.find({
      where: {
        user: { id: userId },
        eventPricing: { event: { id: eventId } },
        cancelledAt: IsNull(),
      },
      relations: ['eventPricing'],
    });

    return registers.map((register) => ({
      id: register.id,
      eventPricingId: register.eventPricing.id,
      registeredAt: register.registeredAt,
    }));
  }

  findOne(id: string, eventId: string, options?: FindOptionsDto) {
    return this.eventsRegisterRepository.findOne({
      ...options,
      where: { id, eventPricing: { event: { id: eventId } } },
    });
  }

  async remove(id: string, eventId: string) {
    return this.eventsRegisterRepository.delete({
      id,
      eventPricing: { event: { id: eventId } },
    });
  }

  /**
   * Annule toutes les inscriptions actives d'un utilisateur pour un événement via une transaction
   * @param transactionId - ID de la transaction de paiement
   * @param userId - ID de l'utilisateur
   * @returns Résultat de l'annulation avec le nombre d'inscriptions annulées
   */
  async cancelRegistrationByTransaction(transactionId: string, userId: string) {
    // 1. Vérifier la transaction
    const transaction = await this.transactionsRepository.findOne({
      where: { id: transactionId },
      relations: ['user'],
    });

    if (!transaction) {
      throw new HttpException('Transaction non trouvée', HttpStatus.NOT_FOUND);
    }

    if (transaction.user?.id !== userId) {
      throw new HttpException('Accès non autorisé', HttpStatus.FORBIDDEN);
    }

    if (transaction.amount < 0) {
      throw new HttpException('Transaction déjà remboursée', HttpStatus.BAD_REQUEST);
    }

    // 2. Récupérer toutes les inscriptions actives pour cet événement
    const eventId = transaction.relatedBy;
    const activeRegistrations = await this.eventsRegisterRepository.find({
      where: {
        user: { id: userId },
        eventPricing: { event: { id: eventId } },
        cancelledAt: IsNull(),
      },
      relations: ['user', 'eventPricing', 'eventPricing.event', 'eventPricing.event.association'],
    });

    if (!activeRegistrations || activeRegistrations.length === 0) {
      throw new HttpException('Aucune inscription active trouvée', HttpStatus.NOT_FOUND);
    }

    // 3. Vérifier que l'événement n'est pas passé
    const event = activeRegistrations[0].eventPricing.event;
    const eventStart = new Date(event.startDate);

    if (eventStart <= new Date()) {
      throw new HttpException('Événement passé, annulation impossible', HttpStatus.BAD_REQUEST);
    }

    // 4. Traiter le remboursement
    const refundAmount = transaction.amount;
    let refundProcessed = false;
    let refundTransactionId: string | null = null;

    if (refundAmount > 0) {
      try {
        const refundResult = await this.eventPaymentService.processEventRegistrationRefund(
          activeRegistrations[0].id,
          userId,
          refundAmount,
          event.id
        );
        refundProcessed = true;
        refundTransactionId = refundResult.transactionId;
      } catch (error) {
        console.error(`Erreur lors du remboursement de la transaction ${transactionId}:`, error);
      }
    } else {
      refundProcessed = true;
    }

    // 5. Marquer toutes les inscriptions comme annulées
    const cancellationDate = new Date();
    await this.eventsRegisterRepository.save(
      activeRegistrations.map((reg) => ({ ...reg, cancelledAt: cancellationDate }))
    );

    // 6. Générer la facture de remboursement si le remboursement a été traité
    let invoicePath: string | null = null;
    if (refundTransactionId) {
      try {
        // Préparer les informations des participants pour la facture
        const participants = activeRegistrations.map((reg) => ({
          firstName: reg.participantFirstName || '',
          lastName: reg.participantLastName || '',
          email: reg.participantEmail || '',
          pricingId: reg.eventPricing.id,
        }));

        // Générer la facture (cela la sauvegarde automatiquement)
        await this.invoicesService.getInvoiceStream(
          refundTransactionId,
          userId,
          undefined,
          participants
        );

        // Récupérer le fichier de facture depuis la base de données
        const invoiceFile = await this.fileRepository.findOne({
          where: {
            relatedTo: 'Transaction',
            relatedBy: refundTransactionId,
            purpose: 'invoice',
          },
        });

        if (invoiceFile) {
          invoicePath = path.join(process.cwd(), 'uploads', userId, invoiceFile.filename);
        }
      } catch (error) {
        console.error(
          `Erreur lors de la génération de la facture de remboursement ${refundTransactionId}:`,
          error
        );
      }
    }

    // 7. Envoyer l'email de confirmation
    await this.sendCancellationEmail(
      activeRegistrations,
      event,
      refundAmount,
      refundProcessed,
      invoicePath
    );

    // 8. Retourner le résultat
    return {
      success: true,
      message: refundProcessed
        ? `${activeRegistrations.length} inscription(s) annulée(s), remboursé ${refundAmount}€`
        : `${activeRegistrations.length} inscription(s) annulée(s), remboursement en cours`,
      refundAmount,
      refundProcessed,
      cancelledCount: activeRegistrations.length,
    };
  }

  /**
   * Envoie l'email de confirmation d'annulation
   */
  private async sendCancellationEmail(
    registrations: any[],
    event: any,
    refundAmount: number,
    refundProcessed: boolean,
    invoicePath?: string | null
  ): Promise<void> {
    try {
      const eventDate = new Date(event.startDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const participantsList = registrations
        .map((reg) => `${reg.participantFirstName} ${reg.participantLastName}`)
        .join(', ');

      const htmlContent = this.cancellationTemplate({
        userName: `${registrations[0].user?.firstname} ${registrations[0].user?.name}`,
        eventTitle: event.title,
        eventDate,
        cancellationDate: new Date().toLocaleDateString('fr-FR'),
        refundAmount: refundAmount.toFixed(2),
        refundStatus: refundProcessed ? 'Traitée' : 'En cours',
        refundProcessed,
        associationName: event.association?.name || 'SolidHive',
        participantCount: registrations.length,
        participantsList,
      });

      const emailOptions: any = {
        to: registrations[0].user?.email || '',
        subject: `Annulation de ${registrations.length} inscription(s) - ${event.title}`,
        html: htmlContent,
      };

      // Ajouter la facture en pièce jointe si disponible
      if (invoicePath && fs.existsSync(invoicePath)) {
        emailOptions.attachments = [
          {
            filename: 'avoir-remboursement.pdf',
            path: invoicePath,
          },
        ];
      }

      await this.emailService.sendEmail(emailOptions);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email d'annulation:", error);
    }
  }

  /**
   * Vérifie si une transaction d'inscription peut être annulée
   * @param transactionId - ID de la transaction
   * @param userId - ID de l'utilisateur
   * @returns Résultat de la vérification avec le nombre d'inscriptions concernées
   */
  async canCancelRegistrationByTransaction(
    transactionId: string,
    userId: string
  ): Promise<{ canCancel: boolean; reason?: string; registrationCount?: number }> {
    try {
      // 1. Vérifier la transaction
      const transaction = await this.transactionsRepository.findOne({
        where: { id: transactionId },
        relations: ['user'],
      });

      if (!transaction) {
        return { canCancel: false, reason: 'Transaction non trouvée' };
      }

      if (transaction.user?.id !== userId) {
        return { canCancel: false, reason: 'Accès non autorisé' };
      }

      if (transaction.amount < 0) {
        return { canCancel: false, reason: 'Transaction déjà remboursée' };
      }

      // 2. Vérifier les inscriptions actives
      const eventId = transaction.relatedBy;
      const activeRegistrations = await this.eventsRegisterRepository.find({
        where: {
          user: { id: userId },
          eventPricing: { event: { id: eventId } },
          cancelledAt: IsNull(),
        },
        relations: ['eventPricing', 'eventPricing.event'],
      });

      if (!activeRegistrations || activeRegistrations.length === 0) {
        return { canCancel: false, reason: 'Inscription annulée' };
      }

      // 3. Vérifier que l'événement n'est pas passé
      const eventStart = new Date(activeRegistrations[0].eventPricing.event.startDate);

      if (eventStart <= new Date()) {
        return { canCancel: false, reason: 'Événement passé' };
      }

      return {
        canCancel: true,
        registrationCount: activeRegistrations.length,
      };
    } catch (error) {
      console.error("Erreur lors de la vérification d'annulation:", error);
      return { canCancel: false, reason: 'Erreur vérification' };
    }
  }
}
