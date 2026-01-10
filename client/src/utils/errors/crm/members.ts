import { commonErrorMessages } from '../common/validation';

export const memberCrmErrorMessages = {
  required: {
    email: commonErrorMessages.email.required,
    roleId: 'Le rôle est requis',
  },
  format: {
    email: commonErrorMessages.email.invalid,
  },
  create: {
    success: 'Invitation envoyée avec succès',
    error: "Erreur lors de l'envoi de l'invitation",
  },
  update: {
    success: 'Membre mis à jour avec succès',
    error: 'Erreur lors de la mise à jour du membre',
  },
  apiErrors: {
    400: 'Les données fournies sont invalides',
    401: 'Vous devez être authentifié pour effectuer cette action',
    403: "Vous n'avez pas les permissions nécessaires",
    404: 'Membre introuvable',
    409: 'Cet utilisateur est déjà membre de cette association',
    500: 'Erreur serveur, veuillez réessayer plus tard',
    unknown: 'Une erreur inattendue est survenue',
  },
};
