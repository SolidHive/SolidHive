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
import { AssociationsService } from './associations.service';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ApiCookieAuth, ApiResponse, ApiBody, ApiOperation } from '@nestjs/swagger';
import { User } from '../../common/decorators/user.decorator';
import { FindOptionsDto } from '../../common/dto/find-all-query.dto';
import {
  AssociationPermissions,
  AssociationPermissionsGuard,
} from './guards/association-permissions.guard';
import { Permissions } from '../../common/enums/permissions';
import { StatusAssociationDto } from './dto/status-association.dto';
import { UpdateStripeAccountDto } from './dto/update-stripe-account.dto';
import { AssociationContactDto } from './dto/association-contact.dto';

@Controller()
export class AssociationsController {
  constructor(private readonly associationsService: AssociationsService) {}

  @Post('association')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  create(@Body() createAssociationDto: CreateAssociationDto, @User('id') userId: string) {
    return this.associationsService.create(createAssociationDto, userId);
  }

  @Get('associations')
  findAll(@Query() options?: FindOptionsDto) {
    return this.associationsService.findAll(options);
  }

  @Get('association/:associationId')
  findOne(@Param('associationId') id: string, @Query() options?: FindOptionsDto) {
    return this.associationsService.findOne(id, options);
  }

  // Get associations by status
  @Get('associations/status/:status')
  findAllByStatus(@Param('status') status: string, @Query() options?: FindOptionsDto) {
    return this.associationsService.findAllByStatus(status, options);
  }

  // Get association by id and status
  @Get('association/:associationId/status/:status')
  findOneByStatus(
    @Param('associationId') id: string,
    @Param('status') status: string,
    @Query() options?: FindOptionsDto
  ) {
    return this.associationsService.findOneByStatus(id, status, options);
  }

  @Patch('association/:associationId')
  @UseGuards(AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.ASSOCIATION_UPDATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  update(@Param('associationId') id: string, @Body() updateAssociationDto: UpdateAssociationDto) {
    return this.associationsService.update(id, updateAssociationDto);
  }

  // Update association status if admin
  @Patch('association/:associationId/status')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('admin')
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  updateStatus(
    @Param('associationId') id: string,
    @Body() statusAssociationDto: StatusAssociationDto
  ) {
    return this.associationsService.updateStatus(id, statusAssociationDto);
  }

  @Delete('association/:associationId')
  @UseGuards(AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.ASSOCIATION_REMOVE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(@Param('associationId') id: string) {
    return this.associationsService.remove(id);
  }

  // Configure Stripe account for donations
  @Patch('association/:associationId/stripe-account')
  @UseGuards(AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.ASSOCIATION_UPDATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  updateStripeAccount(
    @Param('associationId') id: string,
    @Body() updateStripeAccountDto: UpdateStripeAccountDto
  ) {
    return this.associationsService.updateStripeAccount(id, updateStripeAccountDto);
  }

  @Post('association/:associationId/contact')
  @ApiOperation({ summary: 'Envoyer un message de contact à une association' })
  @ApiBody({ type: AssociationContactDto })
  async sendContactEmail(
    @Param('associationId') associationId: string,
    @Body() contactDto: AssociationContactDto
  ) {
    const { name, firstname, email, message, phone } = contactDto;
    await this.associationsService.sendContactEmail(
      associationId,
      name,
      firstname,
      email,
      message,
      phone
    );
    return { message: 'Message envoyé à l’association.' };
  }
}
