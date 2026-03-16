import * as yup from 'yup';

export const announcementCrmErrorMessages = {
  required: {
    title: "Le titre de l'annonce est requis",
    content: "Le contenu de l'annonce est requis",
    image: "L'image de l'annonce est requise",
  },
  minLength: {
    title: 'Le titre doit contenir au moins 5 caractères',
    content: 'Le contenu doit contenir au moins 10 caractères',
  },
  maxLength: {
    title: 'Le titre ne peut pas dépasser 100 caractères',
    content: 'Le contenu ne peut pas dépasser 1000 caractères',
  },
  file: {
    imageSize: "L'image ne doit pas dépasser 5 Mo",
    imageType: "L'image doit être au format PNG ou JPG",
  },
  api: {
    createError: "Erreur lors de la création de l'annonce. Veuillez réessayer.",
    updateError: "Erreur lors de la mise à jour de l'annonce. Veuillez réessayer.",
  },
};

// Schéma commun pour les champs texte
const announcementBaseSchema = {
  title: yup
    .string()
    .required(announcementCrmErrorMessages.required.title)
    .min(5, announcementCrmErrorMessages.minLength.title)
    .max(100, announcementCrmErrorMessages.maxLength.title),
  content: yup
    .string()
    .required(announcementCrmErrorMessages.required.content)
    .min(10, announcementCrmErrorMessages.minLength.content),
  isActive: yup.boolean(),
};

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

// Validation de l'image requise (pour la création)
const requiredImageValidation = yup
  .mixed()
  .required(announcementCrmErrorMessages.required.image)
  .test('fileSize', announcementCrmErrorMessages.file.imageSize, imageFileValidation.fileSize)
  .test('fileType', announcementCrmErrorMessages.file.imageType, imageFileValidation.fileType);

// Validation de l'image optionnelle (pour la mise à jour)
const optionalImageValidation = yup
  .mixed()
  .optional()
  .test('fileSize', announcementCrmErrorMessages.file.imageSize, imageFileValidation.fileSize)
  .test('fileType', announcementCrmErrorMessages.file.imageType, imageFileValidation.fileType);

export const createAnnouncementValidationSchema = yup.object({
  ...announcementBaseSchema,
  image: requiredImageValidation,
});

export const updateAnnouncementValidationSchema = yup.object({
  ...announcementBaseSchema,
  image: optionalImageValidation,
});
