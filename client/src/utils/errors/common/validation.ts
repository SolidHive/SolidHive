// Validation patterns réutilisables
export const validationPatterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
  phoneStrict: /^0[1-9][0-9]{8}$/,
  siret: /^\d{14}$/,
  postcode: /^\d{5}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{10,}$/,
};

// Messages d'erreur réutilisables
export const commonErrorMessages = {
  email: {
    required: "L'email est requis",
    invalid: "L'email n'est pas valide",
  },
  firstName: {
    required: 'Le prénom est requis',
    invalid: 'Le prénom doit contenir au moins 2 caractères',
  },
  lastName: {
    required: 'Le nom est requis',
    invalid: 'Le nom doit contenir au moins 2 caractères',
  },
  phone: {
    required: 'Le téléphone est requis',
    invalid: "Le numéro de téléphone n'est pas valide",
  },
  siret: {
    required: 'Le numéro SIRET est requis',
    invalid: 'Le SIRET doit contenir exactement 14 chiffres',
  },
  postcode: {
    required: 'Le code postal est requis',
    invalid: 'Le code postal doit contenir 5 chiffres',
  },
  city: {
    required: 'La ville est requise',
    invalid: 'La ville doit contenir au moins 2 caractères',
  },
  address: {
    required: "L'adresse est requise",
    invalid: "L'adresse doit contenir au moins 5 caractères",
  },
};
