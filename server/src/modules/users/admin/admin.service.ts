import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Association } from '../../associations/entities/association.entity';
import { EmailService } from '../../../common/utils/email/email.service';
import { UpdateAssociationStatusDto } from './dto/update-association-status.dto';
import { Status } from '../../../common/enums/status';
import { FindOptionsDto } from '../../../common/dto/find-all-query.dto';
import { AssociationsService } from '../../associations/associations.service';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class AdminService {
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor(
    @InjectRepository(Association)
    private readonly associationsRepository: Repository<Association>,
    private readonly emailService: EmailService,
    private readonly associationsService: AssociationsService
  ) {
    this.loadTemplates();
  }

  private loadTemplates(): void {
    const templatePaths = {
      'association-accepted': 'src/common/utils/email/templates/association/accepted.html',
      'association-rejected': 'src/common/utils/email/templates/association/rejected.html',
      'association-additional-request':
        'src/common/utils/email/templates/association/additional-request.html',
    };

    Object.entries(templatePaths).forEach(([type, templatePath]) => {
      try {
        const fullPath = path.join(process.cwd(), templatePath);
        const content = fs.readFileSync(fullPath, 'utf8');
        this.templates.set(type, Handlebars.compile(content));
      } catch (error: unknown) {
        console.error(`Erreur lors du chargement du template ${type}:`, error);
      }
    });
  }

  async findAllAssociations(options?: FindOptionsDto) {
    return this.associationsService.findAll({ ...options, includeAllStatuses: true });
  }

  async updateAssociationStatus(
    associationId: string,
    updateStatusDto: UpdateAssociationStatusDto
  ) {
    const association = await this.associationsRepository.findOne({
      where: { id: associationId },
      relations: ['createdBy'],
    });

    if (!association) {
      throw new NotFoundException('Association non trouvée');
    }

    const oldStatus = association.status;
    association.status = updateStatusDto.status;

    const updatedAssociation = await this.associationsRepository.save(association);

    if (oldStatus !== updateStatusDto.status && association.createdBy) {
      await this.sendStatusChangeEmail(association, updateStatusDto);
    }

    return updatedAssociation;
  }

  private async sendStatusChangeEmail(
    association: Association,
    updateStatusDto: UpdateAssociationStatusDto
  ) {
    const { createdBy, name, id } = association;
    const { status, message } = updateStatusDto;

    let subject = '';
    let templateName = '';
    const frontendUrl = process.env.FRONTEND_URL;
    const context: any = {
      userName: `${createdBy.firstname} ${createdBy.name}`,
      associationName: name,
      appUrl: `${frontendUrl}/crm/${id}/home`,
      associationId: id,
    };

    if (message && message.trim()) {
      context.message = message.trim();
    }

    switch (status) {
      case Status.ACCEPTED:
        subject = `Votre association "${name}" a été acceptée !`;
        templateName = 'association-accepted';
        break;

      case Status.REJECTED:
        subject = `Votre association "${name}" a été rejetée`;
        templateName = 'association-rejected';
        break;

      case Status.ADDITIONAL_REQUEST:
        subject = `Informations supplémentaires requises pour "${name}"`;
        templateName = 'association-additional-request';
        break;

      default:
        return;
    }

    try {
      const template = this.templates.get(templateName);

      if (!template) {
        console.error(`Template ${templateName} non trouvé`);
        return;
      }

      const html = template(context);

      await this.emailService.sendEmail({
        to: createdBy.email,
        subject,
        html,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
    }
  }
}
