import * as yup from 'yup';
import { validationPatterns, commonErrorMessages } from './common/validation';

export const contactValidationMessages = {
  required: {
    name: commonErrorMessages.lastName.required,
    firstname: commonErrorMessages.firstName.required,
    email: commonErrorMessages.email.required,
    message: 'Le message est requis',
  },
  format: {
    email: commonErrorMessages.email.invalid,
    phone: commonErrorMessages.phone.invalid,
  },
  length: {
    name: commonErrorMessages.lastName.invalid,
    firstname: commonErrorMessages.firstName.invalid,
    message: 'Le message doit contenir au moins 3 caractères',
  },
};

export const contactValidationSchema = yup.object({
  name: yup
    .string()
    .required(contactValidationMessages.required.name)
    .min(2, contactValidationMessages.length.name)
    .max(100, contactValidationMessages.length.name),
  firstname: yup
    .string()
    .required(contactValidationMessages.required.firstname)
    .min(2, contactValidationMessages.length.firstname)
    .max(100, contactValidationMessages.length.firstname),
  email: yup
    .string()
    .required(contactValidationMessages.required.email)
    .matches(validationPatterns.email, contactValidationMessages.format.email),
  phone: yup
    .string()
    .notRequired()
    .test('is-valid-phone', contactValidationMessages.format.phone, (val: string | undefined) => {
      if (!val || val.trim() === '') return true;
      return validationPatterns.phone.test(val);
    }),
  message: yup
    .string()
    .required(contactValidationMessages.required.message)
    .min(3, contactValidationMessages.length.message),
});
