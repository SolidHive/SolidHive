import { commonErrorMessages, validationPatterns } from '../common/validation';
import * as yup from 'yup';

export const associationCrmErrorMessages = {
  required: {
    name: "Le nom de l'association est requis",
    description: 'La description est requise',
    siret: commonErrorMessages.siret.required,
  },
  length: {
    name: {
      min: 'Le nom doit contenir au moins 3 caractères',
      max: 'Le nom ne peut pas dépasser 100 caractères',
    },
    description: 'La description ne peut pas dépasser 1000 caractères',
    aboutText: 'Le texte à propos ne peut pas dépasser 1000 caractères',
  },
  format: {
    email: commonErrorMessages.email.invalid,
    siret: commonErrorMessages.siret.invalid,
  },
  update: {
    success: 'Association mise à jour avec succès',
    error: "Erreur lors de la mise à jour de l'association",
  },
  delete: {
    success: 'Association supprimée avec succès',
    error: "Erreur lors de la suppression de l'association",
    confirm: 'Êtes-vous sûr de vouloir supprimer cette association ?',
  },
  apiErrors: {
    400: 'Les données fournies sont invalides',
    401: 'Vous devez être authentifié pour effectuer cette action',
    403: "Vous n'avez pas les permissions nécessaires",
    404: 'Association introuvable',
    409: 'Une association avec ce SIRET existe déjà',
    500: 'Erreur serveur, veuillez réessayer plus tard',
    unknown: 'Une erreur inattendue est survenue',
  },
};

export { validationPatterns };

export const associationValidationSchema = yup.object({
  name: yup
    .string()
    .required(associationCrmErrorMessages.required.name)
    .min(3, associationCrmErrorMessages.length.name.min)
    .max(100, associationCrmErrorMessages.length.name.max),
  description: yup
    .string()
    .required(associationCrmErrorMessages.required.description)
    .max(1000, associationCrmErrorMessages.length.description),
  aboutText: yup.string().optional().max(1000, associationCrmErrorMessages.length.aboutText),
  contact: yup.string().optional().email(associationCrmErrorMessages.format.email),
  primaryColor: yup.string().optional(),
});
