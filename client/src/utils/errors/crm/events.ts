import * as yup from 'yup';

export const eventCrmErrorMessages = {
  required: {
    title: "Le titre de l'événement est requis",
    startDate: 'La date de début est requise',
    endDate: 'La date de fin est requise',
    street: 'La rue est requise',
    city: 'La ville est requise',
    postcode: 'Le code postal est requis',
    state: 'La région est requise',
    country: 'Le pays est requis',
    image: "L'image de l'événement est requise",
  },
  minLength: {
    title: 'Le titre doit contenir au moins 5 caractères',
    description: 'La description doit contenir au moins 10 caractères',
    street: 'La rue doit contenir au moins 3 caractères',
    city: 'La ville doit contenir au moins 2 caractères',
  },
  maxLength: {
    title: 'Le titre ne peut pas dépasser 100 caractères',
    description: 'La description ne peut pas dépasser 1000 caractères',
  },
  date: {
    endAfterStart: 'La date de fin doit être après la date de début',
  },
  file: {
    imageSize: "L'image ne doit pas dépasser 5 Mo",
    imageType: "L'image doit être au format PNG ou JPG",
  },
  pricing: {
    titleRequired: 'Le titre du tarif est requis',
    titleMinLength: 'Le titre du tarif doit contenir au moins 3 caractères',
    descriptionRequired: 'La description du tarif est requise',
    descriptionMinLength: 'La description doit contenir au moins 5 caractères',
    amountRequired: 'Le montant est requis',
    amountType: 'Le montant doit être un nombre valide',
    amountMin: 'Le montant doit être supérieur ou égal à 0',
  },
  api: {
    createError: "Erreur lors de la création de l'événement. Veuillez réessayer.",
    updateError: "Erreur lors de la mise à jour de l'événement. Veuillez réessayer.",
  },
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
  .required(eventCrmErrorMessages.required.image)
  .test('fileSize', eventCrmErrorMessages.file.imageSize, imageFileValidation.fileSize)
  .test('fileType', eventCrmErrorMessages.file.imageType, imageFileValidation.fileType);

// Validation de l'image optionnelle (pour la mise à jour)
const optionalImageValidation = yup
  .mixed()
  .optional()
  .test('fileSize', eventCrmErrorMessages.file.imageSize, imageFileValidation.fileSize)
  .test('fileType', eventCrmErrorMessages.file.imageType, imageFileValidation.fileType);

// Schéma pour l'adresse
const addressSchema = yup.object({
  street: yup
    .string()
    .required(eventCrmErrorMessages.required.street)
    .min(3, eventCrmErrorMessages.minLength.street),
  city: yup
    .string()
    .required(eventCrmErrorMessages.required.city)
    .min(2, eventCrmErrorMessages.minLength.city),
  postcode: yup.string().required(eventCrmErrorMessages.required.postcode),
  state: yup.string().required(eventCrmErrorMessages.required.state),
  country: yup.string().required(eventCrmErrorMessages.required.country),
});

// Schéma pour la step 1: Informations de base + adresse + image
export const eventStep1ValidationSchema = yup.object({
  title: yup
    .string()
    .required(eventCrmErrorMessages.required.title)
    .min(5, eventCrmErrorMessages.minLength.title)
    .max(100, eventCrmErrorMessages.maxLength.title),
  description: yup
    .string()
    .min(10, eventCrmErrorMessages.minLength.description)
    .max(1000, eventCrmErrorMessages.maxLength.description)
    .optional(),
  startDate: yup.string().required(eventCrmErrorMessages.required.startDate),
  endDate: yup
    .string()
    .required(eventCrmErrorMessages.required.endDate)
    .test('is-after-start', eventCrmErrorMessages.date.endAfterStart, function (value) {
      if (!value) return true;
      const startDate = this.parent.startDate;
      if (!startDate) return true;
      return new Date(value) > new Date(startDate);
    }),
  address: addressSchema,
  image: requiredImageValidation,
});

// Schéma pour la step 2: Tarifs
export const eventStep2ValidationSchema = yup.object({
  pricings: yup
    .array()
    .of(
      yup.object({
        title: yup
          .string()
          .required(eventCrmErrorMessages.pricing.titleRequired)
          .min(3, eventCrmErrorMessages.pricing.titleMinLength),
        description: yup
          .string()
          .required(eventCrmErrorMessages.pricing.descriptionRequired)
          .min(5, eventCrmErrorMessages.pricing.descriptionMinLength),
        amount: yup
          .number()
          .typeError(eventCrmErrorMessages.pricing.amountType)
          .required(eventCrmErrorMessages.pricing.amountRequired)
          .min(0, eventCrmErrorMessages.pricing.amountMin),
        maxCapacity: yup
          .number()
          .optional()
          .min(1, 'La capacité maximale doit être supérieure à 0'),
      })
    )
    .min(1, 'Au moins un tarif est requis'),
});

// Schéma pour l'update: comme step1 mais avec image optionnelle
export const eventUpdateValidationSchema = yup.object({
  title: yup
    .string()
    .required(eventCrmErrorMessages.required.title)
    .min(5, eventCrmErrorMessages.minLength.title)
    .max(100, eventCrmErrorMessages.maxLength.title),
  description: yup
    .string()
    .min(10, eventCrmErrorMessages.minLength.description)
    .max(1000, eventCrmErrorMessages.maxLength.description)
    .optional(),
  startDate: yup.string().required(eventCrmErrorMessages.required.startDate),
  endDate: yup
    .string()
    .required(eventCrmErrorMessages.required.endDate)
    .test('is-after-start', eventCrmErrorMessages.date.endAfterStart, function (value) {
      if (!value) return true;
      const startDate = this.parent.startDate;
      if (!startDate) return true;
      return new Date(value) > new Date(startDate);
    }),
  address: addressSchema,
  image: optionalImageValidation,
});

// Schéma pour un seul pricing (ajout/modification)
export const singlePricingValidationSchema = yup.object({
  title: yup
    .string()
    .required(eventCrmErrorMessages.pricing.titleRequired)
    .min(3, eventCrmErrorMessages.pricing.titleMinLength),
  description: yup
    .string()
    .required(eventCrmErrorMessages.pricing.descriptionRequired)
    .min(5, eventCrmErrorMessages.pricing.descriptionMinLength),
  amount: yup
    .number()
    .typeError(eventCrmErrorMessages.pricing.amountType)
    .required(eventCrmErrorMessages.pricing.amountRequired)
    .min(0, eventCrmErrorMessages.pricing.amountMin),
  maxCapacity: yup.number().optional().min(1, 'La capacité maximale doit être supérieure à 0'),
});
