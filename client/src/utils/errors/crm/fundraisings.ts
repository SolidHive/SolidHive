export const fundraisingCrmErrorMessages = {
  required: {
    title: 'Le titre de la cagnotte est requis',
    description: 'La description de la cagnotte est requise',
    wantedAmount: 'Le montant souhaité est requis',
    startDate: 'La date de début est requise',
    endDate: 'La date de fin est requise',
  },
  minLength: {
    title: 'Le titre doit contenir au moins 5 caractères',
    description: 'La description doit contenir au moins 20 caractères',
  },
  maxLength: {
    title: 'Le titre ne peut pas dépasser 100 caractères',
    description: 'La description ne peut pas dépasser 2000 caractères',
  },
  min: {
    wantedAmount: 'Le montant souhaité doit être supérieur à 0',
  },
  date: {
    endDateBeforeStart: 'La date de fin doit être après la date de début',
  },
  api: {
    createError: 'Erreur lors de la création de la cagnotte. Veuillez réessayer.',
    updateError: 'Erreur lors de la mise à jour de la cagnotte. Veuillez réessayer.',
  },
};
