import * as yup from 'yup';

export const fundraisingCrmErrorMessages = {
  required: {
    title: 'Le titre de la cagnotte est requis',
    description: 'La description de la cagnotte est requise',
    wantedAmount: 'Le montant souhaité est requis',
    startDate: 'La date de début est requise',
    endDate: 'La date de fin est requise',
    image: "L'image de la cagnotte est requise",
  },
  minLength: {
    title: 'Le titre doit contenir au moins 5 caractères',
    description: 'La description doit contenir au moins 20 caractères',
  },
  maxLength: {
    title: 'Le titre ne peut pas dépasser 100 caractères',
    description: 'La description ne peut pas dépasser 2000 caractères',
  },
  min: {
    wantedAmount: 'Le montant souhaité doit être supérieur à 0',
  },
  date: {
    endDateBeforeStart: 'La date de fin doit être après la date de début',
  },
  file: {
    imageSize: "L'image ne doit pas dépasser 5 Mo",
    imageType: "L'image doit être au format PNG ou JPG",
  },
  api: {
    createError: 'Erreur lors de la création de la cagnotte. Veuillez réessayer.',
    updateError: 'Erreur lors de la mise à jour de la cagnotte. Veuillez réessayer.',
  },
};

// Schéma commun pour les champs communs
const fundraisingBaseSchema = {
  title: yup
    .string()
    .required(fundraisingCrmErrorMessages.required.title)
    .min(5, fundraisingCrmErrorMessages.minLength.title)
    .max(100, fundraisingCrmErrorMessages.maxLength.title),
  description: yup
    .string()
    .required(fundraisingCrmErrorMessages.required.description)
    .min(20, fundraisingCrmErrorMessages.minLength.description)
    .max(2000, fundraisingCrmErrorMessages.maxLength.description),
  wantedAmount: yup
    .number()
    .required(fundraisingCrmErrorMessages.required.wantedAmount)
    .min(0.01, fundraisingCrmErrorMessages.min.wantedAmount)
    .typeError(fundraisingCrmErrorMessages.required.wantedAmount),
  startDate: yup.string().required(fundraisingCrmErrorMessages.required.startDate),
  endDate: yup
    .string()
    .required(fundraisingCrmErrorMessages.required.endDate)
    .test('is-after-start', fundraisingCrmErrorMessages.date.endDateBeforeStart, function (value) {
      const { startDate } = this.parent;
      if (!value || !startDate) return true;
      return new Date(value) > new Date(startDate);
    }),
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
  .required(fundraisingCrmErrorMessages.required.image)
  .test('fileSize', fundraisingCrmErrorMessages.file.imageSize, imageFileValidation.fileSize)
  .test('fileType', fundraisingCrmErrorMessages.file.imageType, imageFileValidation.fileType);

// Validation de l'image optionnelle (pour la mise à jour)
const optionalImageValidation = yup
  .mixed()
  .optional()
  .test('fileSize', fundraisingCrmErrorMessages.file.imageSize, imageFileValidation.fileSize)
  .test('fileType', fundraisingCrmErrorMessages.file.imageType, imageFileValidation.fileType);

export const createFundraisingValidationSchema = yup.object({
  ...fundraisingBaseSchema,
  image: requiredImageValidation,
});

export const updateFundraisingValidationSchema = yup.object({
  ...fundraisingBaseSchema,
  image: optionalImageValidation,
});
