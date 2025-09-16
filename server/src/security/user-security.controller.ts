import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserSecurityService } from './user-security.service';
import { SecurityActionRequestDto } from './dto/security-action.dto';
import { SecurityActionType } from './enums/security-action-type.enum';

@ApiTags('User Security')
@Controller('security')
export class UserSecurityController {
  constructor(private readonly userSecurityService: UserSecurityService) {}

  @Post('action')
  @ApiOperation({
    summary: 'Traite les actions de sécurité utilisateur',
    description:
      "Point d'entrée unifié pour toutes les actions de sécurité des utilisateurs: vérification d'email, réinitialisation de mot de passe, etc.",
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        actionType: {
          type: 'string',
          enum: Object.values(SecurityActionType),
          description: "Type d'action à effectuer",
        },
        token: {
          type: 'string',
          description:
            'Token de sécurité (pour vérification ou réinitialisation)',
        },
        email: {
          type: 'string',
          description:
            'Email (pour demander une réinitialisation de mot de passe)',
        },
        newPassword: {
          type: 'string',
          description:
            'Nouveau mot de passe (pour finaliser la réinitialisation)',
        },
      },
      required: ['actionType'],
    },
    examples: {
      verifyEmail: {
        summary: "Vérification d'email",
        description: 'Exemple de requête pour vérifier un email utilisateur',
        value: {
          actionType: 'VERIFY_EMAIL',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ6...',
        },
      },
      requestPasswordReset: {
        summary: 'Demande de réinitialisation de mot de passe',
        description:
          'Exemple de requête pour demander un lien de réinitialisation de mot de passe',
        value: {
          actionType: 'RESET_PASSWORD',
          email: 'contact@entreprise.com',
        },
      },
      resetPassword: {
        summary: 'Réinitialisation du mot de passe',
        description:
          'Exemple de requête pour réinitialiser le mot de passe avec un token valide',
        value: {
          actionType: 'RESET_PASSWORD',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          newPassword: 'NouveauMotDePasse123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Action traitée avec succès',
    schema: {
      properties: {
        message: { type: 'string' },
        userId: { type: 'string' },
      },
    },
    content: {
      'application/json': {
        examples: {
          verifyEmail: {
            summary: "Réponse de vérification d'email",
            value: {
              message:
                'Vérification réussie. Vous pouvez maintenant vous connecter.',
            },
          },
          requestReset: {
            summary: 'Réponse de demande de réinitialisation',
            value: {
              message:
                'Si votre email est enregistré, vous recevrez un lien de réinitialisation.',
            },
          },
          passwordReset: {
            summary: 'Réponse de réinitialisation du mot de passe',
            value: {
              message:
                'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Requête invalide',
    content: {
      'application/json': {
        examples: {
          missingToken: {
            summary: 'Token manquant',
            value: {
              statusCode: 400,
              message: 'Token requis pour cette action',
              error: 'Bad Request',
            },
          },
          expiredToken: {
            summary: 'Token expiré',
            value: {
              statusCode: 400,
              message: 'Le lien de vérification a expiré',
              error: 'Bad Request',
            },
          },
          invalidToken: {
            summary: 'Token invalide',
            value: {
              statusCode: 400,
              message: 'Lien de vérification invalide',
              error: 'Bad Request',
            },
          },
          weakPassword: {
            summary: 'Mot de passe trop faible',
            value: {
              statusCode: 400,
              message: 'Le mot de passe doit contenir au moins 10 caractères',
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
  async processAction(@Body() actionRequest: SecurityActionRequestDto) {
    try {
      return await this.userSecurityService.processSecurityAction(
        actionRequest,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException("Erreur lors du traitement de l'action");
    }
  }
}
