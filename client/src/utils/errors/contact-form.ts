import * as yup from 'yup';
import { validationPatterns, commonErrorMessages } from './common/validation';

export const contactFormErrorMessages = {
  required: {
    firstName: commonErrorMessages.firstName.required,
    lastName: commonErrorMessages.lastName.required,
    email: commonErrorMessages.email.required,
    subject: 'Veuillez sélectionner un sujet.',
    message: 'Le message est requis.',
  },
  invalid: {
    firstName: commonErrorMessages.firstName.invalid,
    lastName: commonErrorMessages.lastName.invalid,
    email: commonErrorMessages.email.invalid,
    message: 'Le message doit contenir au moins 10 caractères.',
  },
  api: {
    send: "Impossible d'envoyer votre message. Veuillez réessayer.",
  },
};

export const contactFormValidationSchema = yup.object({
  firstName: yup
    .string()
    .required(contactFormErrorMessages.required.firstName)
    .min(2, contactFormErrorMessages.invalid.firstName)
    .max(100, contactFormErrorMessages.invalid.firstName),
  lastName: yup
    .string()
    .required(contactFormErrorMessages.required.lastName)
    .min(2, contactFormErrorMessages.invalid.lastName)
    .max(100, contactFormErrorMessages.invalid.lastName),
  email: yup
    .string()
    .required(contactFormErrorMessages.required.email)
    .matches(validationPatterns.email, contactFormErrorMessages.invalid.email),
  subject: yup.string().required(contactFormErrorMessages.required.subject),
  message: yup
    .string()
    .required(contactFormErrorMessages.required.message)
    .min(10, contactFormErrorMessages.invalid.message),
});
