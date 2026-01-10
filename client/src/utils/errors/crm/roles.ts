export const roleCrmErrorMessages = {
  required: {
    name: 'Le nom du rôle est requis',
    permissions: 'Au moins une permission est requise',
  },
  minLength: {
    name: 'Le nom du rôle doit contenir au moins 3 caractères',
  },
  maxLength: {
    name: 'Le nom du rôle ne peut pas dépasser 50 caractères',
    description: 'La description ne peut pas dépasser 500 caractères',
  },
  api: {
    createError: 'Erreur lors de la création du rôle. Veuillez réessayer.',
    updateError: 'Erreur lors de la mise à jour du rôle. Veuillez réessayer.',
    roleExists: 'Un rôle avec ce nom existe déjà',
  },
};
