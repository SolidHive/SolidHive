import * as yup from 'yup';

export const permissionAccessErrorMessages = {
  required: {
    permission: 'La permission est requise',
  },
  api: {
    createError: "Erreur lors de la création de la permission d'accès. Veuillez réessayer.",
    updateError: "Erreur lors de la mise à jour de la permission d'accès. Veuillez réessayer.",
  },
};

export const createPermissionAccessValidationSchema = yup.object({
  permission: yup.string().required(permissionAccessErrorMessages.required.permission),
  requiresSubscription: yup.boolean(),
});

export const updatePermissionAccessValidationSchema = yup.object({
  requiresSubscription: yup.boolean(),
});
