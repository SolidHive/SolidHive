import { validationPatterns, commonErrorMessages } from '../common/validation';
import * as yup from 'yup';

export const userErrorMessages = {
  required: {
    email: commonErrorMessages.email.required,
    password: 'Le mot de passe est requis',
    name: commonErrorMessages.lastName.required,
    firstname: commonErrorMessages.firstName.required,
    confirmPassword: 'La confirmation du mot de passe est requise',
    siret: commonErrorMessages.siret.required,
  },
  format: {
    email: commonErrorMessages.email.invalid,
    confirmPassword: 'Les mots de passe ne correspondent pas',
    phone: 'Format de téléphone français invalide (10 chiffres commençant par 0)',
    siret: commonErrorMessages.siret.invalid,
  },
  password: {
    invalid:
      'Le mot de passe doit contenir au moins 10 caractères, une minuscule, une majuscule, un chiffre et un symbole',
  },
  patterns: {
    email: validationPatterns.email,
    password: validationPatterns.password,
    phone: validationPatterns.phoneStrict,
    siret: validationPatterns.siret,
  },
  auth: {
    invalidCredentials: 'Échec de la connexion. Vérifiez vos identifiants.',
  },
  length: {
    name: 'Le nom doit contenir entre 1 et 50 caractères',
    firstname: 'Le prénom doit contenir entre 1 et 50 caractères',
    phone: 'Le numéro de téléphone doit contenir exactement 10 chiffres',
    siret: 'Le SIRET doit contenir exactement 14 chiffres',
  },
  apiErrors: {
    400: 'Données invalides, veuillez vérifier le formulaire.',
    401: "Votre compte n'est pas vérifié. Veuillez vérifier votre email avant de vous connecter.",
    409: "L'inscription a échoué. Vérifiez vos informations ou contactez le support.",
    429: 'Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.',
    500: 'Erreur serveur, veuillez réessayer plus tard.',
    unknown: "Une erreur est survenue lors de l'authentification.",
  },
};

export const registerValidationSchema = yup.object({
  name: yup
    .string()
    .required(userErrorMessages.required.name)
    .max(50, userErrorMessages.length.name),
  firstname: yup
    .string()
    .required(userErrorMessages.required.firstname)
    .max(50, userErrorMessages.length.firstname),
  email: yup
    .string()
    .required(userErrorMessages.required.email)
    .email(userErrorMessages.format.email),
  phone: yup
    .string()
    .optional()
    .test('phone-format', userErrorMessages.format.phone, (value) => {
      if (!value) return true;
      return userErrorMessages.patterns.phone.test(value);
    }),
  password: yup
    .string()
    .required(userErrorMessages.required.password)
    .matches(userErrorMessages.patterns.password, userErrorMessages.password.invalid),
});

export const loginValidationSchema = yup.object({
  email: yup
    .string()
    .required(userErrorMessages.required.email)
    .email(userErrorMessages.format.email),
  password: yup.string().required(userErrorMessages.required.password),
});

export const forgotPasswordValidationSchema = yup.object({
  email: yup
    .string()
    .required(userErrorMessages.required.email)
    .email(userErrorMessages.format.email),
});

export const resetPasswordValidationSchema = yup.object({
  password: yup
    .string()
    .required(userErrorMessages.required.password)
    .matches(userErrorMessages.patterns.password, userErrorMessages.password.invalid),
});
