import { validationPatterns, commonErrorMessages } from './common/validation';

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
