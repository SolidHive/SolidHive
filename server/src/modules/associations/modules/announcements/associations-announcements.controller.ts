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
import { AssociationsAnnouncementsService } from './associations-announcements.service';
import { CreateAssociationAnnouncementDto } from './dto/create-association-announcement.dto';
import { UpdateAssociationAnnouncementDto } from './dto/update-association-announcement.dto';
import { AuthenticatedGuard } from '../../../../modules/auth/guards/authenticated.guard';
import { RateLimitGuard } from '../../../../common/guards/rate-limit.guard';
import { ApiCookieAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindOptionsDto } from '../../../../common/dto/find-all-query.dto';
import {
  AssociationPermissions,
  AssociationPermissionsGuard,
} from '../../../associations/guards/association-permissions.guard';
import { Permissions } from '../../../../common/enums/permissions';
import { UserAssociationDecorator } from '../../../../common/decorators/user-association.decorator';
import { UserAssociation } from '../users/entities/user-association.entity';

@ApiTags('Association - Announcements')
@Controller('association/:associationId')
export class AssociationsAnnouncementsController {
  constructor(
    private readonly associationsAnnouncementsService: AssociationsAnnouncementsService
  ) {}

  @Post('announcement')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.ANNOUNCEMENTS_CREATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiParam({ name: 'associationId', type: 'string' })
  create(
    @Body() createAssociationAnnouncementDto: CreateAssociationAnnouncementDto,
    @UserAssociationDecorator() userAssociation: UserAssociation
  ) {
    return this.associationsAnnouncementsService.create(
      createAssociationAnnouncementDto,
      userAssociation
    );
  }

  @Get('announcements')
  findAll(@Param('associationId') associationId: string, @Query() options?: FindOptionsDto) {
    return this.associationsAnnouncementsService.findAll(associationId, options);
  }

  @Get('announcement/:id')
  findOne(
    @Param('id') id: string,
    @Param('associationId') associationId: string,
    @Query() options?: FindOptionsDto
  ) {
    return this.associationsAnnouncementsService.findOne(id, associationId, options);
  }

  @Patch('announcement/:id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.ANNOUNCEMENTS_UPDATE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  update(
    @Param('id') id: string,
    @Param('associationId') associationId: string,
    @Body()
    updateAssociationAnnouncementDto: UpdateAssociationAnnouncementDto
  ) {
    return this.associationsAnnouncementsService.update(
      id,
      associationId,
      updateAssociationAnnouncementDto
    );
  }

  @Delete('announcement/:id')
  @UseGuards(RateLimitGuard, AuthenticatedGuard, AssociationPermissionsGuard)
  @AssociationPermissions(Permissions.ANNOUNCEMENTS_DELETE)
  @ApiCookieAuth()
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  remove(@Param('id') id: string, @Param('associationId') associationId: string) {
    return this.associationsAnnouncementsService.remove(id, associationId);
  }
}
