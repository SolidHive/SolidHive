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
  file: {
    imageSize: "L'image ne doit pas dépasser 5 Mo",
    imageType: "L'image doit être au format PNG ou JPG",
  },
  gallery: {
    maxImages: 'Vous ne pouvez pas ajouter plus de 10 images à la galerie',
    imageSize: 'Chaque image de la galerie ne doit pas dépasser 10 Mo',
    imageType: 'Les images de la galerie doivent être au format PNG ou JPG',
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

// Validation commune pour la taille et le type de fichier
const imageFileValidation = {
  fileSize: (value: any) => {
    if (!value) return true;
    return (value as File).size <= 5 * 1024 * 1024;
  },
  fileType: (value: any) => {
    if (!value) return true;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    return allowedTypes.includes((value as File).type);
  },
};

// Validation pour les images de galerie (10 Mo au lieu de 5 Mo)
const galleryImageFileValidation = {
  fileSize: (value: any) => {
    if (!value) return true;
    return (value as File).size <= 10 * 1024 * 1024;
  },
  fileType: imageFileValidation.fileType,
};

// Validation de l'image optionnelle (pour la mise à jour)
const optionalImageValidation = yup
  .mixed()
  .optional()
  .nullable()
  .test('fileSize', associationCrmErrorMessages.file.imageSize, imageFileValidation.fileSize)
  .test('fileType', associationCrmErrorMessages.file.imageType, imageFileValidation.fileType);

// Validation pour les images de galerie
const galleryImagesValidation = yup
  .array()
  .optional()
  .max(10, associationCrmErrorMessages.gallery.maxImages)
  .of(
    yup.object().shape({
      file: yup
        .mixed()
        .optional()
        .test(
          'fileSize',
          associationCrmErrorMessages.gallery.imageSize,
          galleryImageFileValidation.fileSize
        )
        .test(
          'fileType',
          associationCrmErrorMessages.gallery.imageType,
          galleryImageFileValidation.fileType
        ),
    })
  );

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
  logoFile: optionalImageValidation,
  imageFile: optionalImageValidation,
  aboutImageFile: optionalImageValidation,
  galleryImages: galleryImagesValidation,
});
