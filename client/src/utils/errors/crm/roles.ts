import * as yup from 'yup';

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
  uniqueness: {
    name: 'Un rôle avec ce nom existe déjà',
  },
  api: {
    createError: 'Erreur lors de la création du rôle. Veuillez réessayer.',
    updateError: 'Erreur lors de la mise à jour du rôle. Veuillez réessayer.',
    roleExists: 'Un rôle avec ce nom existe déjà',
  },
};

// Schéma commun pour les champs de rôle
const roleBaseSchema = {
  name: yup
    .string()
    .required(roleCrmErrorMessages.required.name)
    .min(3, roleCrmErrorMessages.minLength.name)
    .max(50, roleCrmErrorMessages.maxLength.name),
  description: yup.string().max(500, roleCrmErrorMessages.maxLength.description),
  permissions: yup.array().of(yup.string()).min(1, roleCrmErrorMessages.required.permissions),
};

export const createRoleValidationSchema = yup.object({
  ...roleBaseSchema,
});

export const updateRoleValidationSchema = yup.object({
  ...roleBaseSchema,
});
