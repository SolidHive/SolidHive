import * as yup from 'yup';
import { validationPatterns, commonErrorMessages } from './common/validation';

export const associationValidationMessages = {
  required: {
    name: "Le nom de l'association est requis",
    description: 'La description est requise',
    contact: commonErrorMessages.email.required,
    siret: commonErrorMessages.siret.required,
    logo: 'Le logo est requis',
    background: 'La bannière est requise',
    primaryColor: 'La couleur principale est requise',
  },
  format: {
    contact: commonErrorMessages.email.invalid,
    siret: commonErrorMessages.siret.invalid,
    logo: 'Le fichier doit être une image (JPEG, PNG, GIF, WebP)',
    background: 'Le fichier doit être une image (JPEG, PNG, GIF, WebP)',
  },
  length: {
    name: "Le nom de l'association doit contenir entre 3 et 100 caractères",
    description: 'La description doit contenir entre 5 et 1000 caractères',
    contact: "L'email de contact doit contenir entre 5 et 100 caractères",
    siret: commonErrorMessages.siret.invalid,
  },
  size: {
    logo: 'Le logo ne doit pas dépasser 5 Mo',
    background: 'La bannière ne doit pas dépasser 10 Mo',
  },
  patterns: {
    siret: validationPatterns.siret,
  },
  apiErrors: {
    400: 'Données invalides, veuillez vérifier le formulaire.',
    401: 'Vous devez être connecté pour créer une association.',
    409: 'Une association avec ce SIRET existe déjà.',
    429: 'Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.',
    500: 'Erreur serveur, veuillez réessayer plus tard.',
    unknown: "Une erreur est survenue lors de la création de l'association.",
  },
  creation: {
    success: 'Votre association a été créée et est en attente de validation !',
    userCreated:
      'Compte créé ! Vérifiez votre email pour confirmer votre inscription. Votre association sera créée après connexion.',
    uploadFailed: "L'association a été créée mais l'upload des fichiers a échoué.",
  },
};

export const associationValidationSchema = yup.object({
  name: yup.string().required(associationValidationMessages.required.name).min(3).max(100),
  description: yup.string().required(associationValidationMessages.required.description).max(1000),
  contact: yup
    .string()
    .required(associationValidationMessages.required.contact)
    .email(associationValidationMessages.format.contact),
  siret: yup
    .string()
    .required(associationValidationMessages.required.siret)
    .matches(/^\d{14}$/, associationValidationMessages.format.siret),
  primaryColor: yup.string().required(associationValidationMessages.required.primaryColor),
});
