export const eventCrmErrorMessages = {
  required: {
    title: "Le titre de l'événement est requis",
    startDate: 'La date de début est requise',
    street: 'La rue est requise',
    city: 'La ville est requise',
    postcode: 'Le code postal est requis',
    country: 'Le pays est requis',
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
  pricing: {
    titleRequired: 'Le titre du tarif est requis',
    titleMinLength: 'Le titre du tarif doit contenir au moins 3 caractères',
    amountRequired: 'Le montant est requis',
    amountMin: 'Le montant doit être supérieur ou égal à 0',
  },
  api: {
    createError: "Erreur lors de la création de l'événement. Veuillez réessayer.",
    updateError: "Erreur lors de la mise à jour de l'événement. Veuillez réessayer.",
  },
};
