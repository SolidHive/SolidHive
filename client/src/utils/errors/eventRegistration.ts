import { validationPatterns, commonErrorMessages } from './common/validation';
import * as yup from 'yup';

export const eventRegistrationErrorMessages = {
  ticketSelection: {
    noTickets: 'Veuillez sélectionner au moins un billet',
  },
  participants: {
    firstName: commonErrorMessages.firstName,
    lastName: commonErrorMessages.lastName,
    email: commonErrorMessages.email,
    phone: {
      invalid: commonErrorMessages.phone.invalid,
    },
  },
  contact: {
    firstName: commonErrorMessages.firstName,
    lastName: commonErrorMessages.lastName,
    email: commonErrorMessages.email,
    phone: commonErrorMessages.phone,
    address: commonErrorMessages.address,
    postcode: commonErrorMessages.postcode,
    city: commonErrorMessages.city,
  },
  validation: {
    emailPattern: validationPatterns.email,
    phonePattern: validationPatterns.phone,
    postcodePattern: validationPatterns.postcode,
  },
};

export const contactFormValidationSchema = yup.object({
  firstName: yup
    .string()
    .required(eventRegistrationErrorMessages.contact.firstName.required)
    .min(2, eventRegistrationErrorMessages.contact.firstName.invalid),
  lastName: yup
    .string()
    .required(eventRegistrationErrorMessages.contact.lastName.required)
    .min(2, eventRegistrationErrorMessages.contact.lastName.invalid),
  email: yup
    .string()
    .required(eventRegistrationErrorMessages.contact.email.required)
    .email(eventRegistrationErrorMessages.contact.email.invalid),
  phone: yup
    .string()
    .required(eventRegistrationErrorMessages.contact.phone.required)
    .test(
      'phone',
      eventRegistrationErrorMessages.contact.phone.invalid,
      (value: string | undefined) => {
        if (!value) return false;
        return eventRegistrationErrorMessages.validation.phonePattern.test(value);
      }
    ),
  address: yup
    .string()
    .required(eventRegistrationErrorMessages.contact.address.required)
    .min(5, eventRegistrationErrorMessages.contact.address.invalid),
  postcode: yup
    .string()
    .required(eventRegistrationErrorMessages.contact.postcode.required)
    .matches(
      eventRegistrationErrorMessages.validation.postcodePattern,
      eventRegistrationErrorMessages.contact.postcode.invalid
    ),
  city: yup
    .string()
    .required(eventRegistrationErrorMessages.contact.city.required)
    .min(2, eventRegistrationErrorMessages.contact.city.invalid),
});

export const participantValidationSchema = yup.object({
  firstName: yup
    .string()
    .required(eventRegistrationErrorMessages.participants.firstName.required)
    .min(2, eventRegistrationErrorMessages.participants.firstName.invalid),
  lastName: yup
    .string()
    .required(eventRegistrationErrorMessages.participants.lastName.required)
    .min(2, eventRegistrationErrorMessages.participants.lastName.invalid),
  email: yup
    .string()
    .required(eventRegistrationErrorMessages.participants.email.required)
    .email(eventRegistrationErrorMessages.participants.email.invalid),
  phone: yup
    .string()
    .test(
      'phone',
      eventRegistrationErrorMessages.participants.phone.invalid,
      (value: string | undefined) => {
        if (!value) return true;
        return eventRegistrationErrorMessages.validation.phonePattern.test(value);
      }
    ),
});
