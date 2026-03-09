import * as yup from 'yup';
import { validationPatterns, commonErrorMessages } from './common/validation';

export const newsletterErrorMessages = {
  required: {
    email: commonErrorMessages.email.required,
  },
  invalid: commonErrorMessages.email.invalid,
  api: {
    subscribe: "Impossible de s'inscrire. Veuillez réessayer.",
    unsubscribe: 'Impossible de se désinscrire. Veuillez réessayer.',
  },
};

export const newsletterValidationSchema = yup.object({
  email: yup
    .string()
    .required(newsletterErrorMessages.required.email)
    .matches(validationPatterns.email, newsletterErrorMessages.invalid),
});
