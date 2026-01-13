import * as yup from 'yup';

/**
 * Fonction utilitaire pour valider des données avec un schéma Yup
 *
 * Cette fonction centralise la logique de validation manuelle avec Yup,
 * permettant de remplacer vue-yup-form par une approche plus flexible.
 *
 * @param schema - Le schéma Yup à utiliser pour la validation
 * @param data - Les données à valider
 * @param options - Options de validation Yup (optionnel)
 * @returns Un objet avec les propriétés suivantes :
 *   - isValid: boolean indiquant si la validation a réussi
 *   - errors: objet Record<string, string> contenant les erreurs par champ
 */
export async function validateWithYup<T extends Record<string, any>>(
  schema: yup.ObjectSchema<T>,
  data: T,
  options?: yup.ValidateOptions
): Promise<{
  isValid: boolean;
  errors: Record<string, string>;
}> {
  try {
    // Valider les données avec Yup
    await schema.validate(data, {
      abortEarly: false, // Ne pas s'arrêter à la première erreur
      ...options,
    });

    // Si validation réussie, retourner un objet vide d'erreurs
    return {
      isValid: true,
      errors: {},
    };
  } catch (err: any) {
    // En cas d'erreur, extraire les erreurs par champ
    const errors: Record<string, string> = {};

    if (err.inner && Array.isArray(err.inner)) {
      // Pour les erreurs Yup classiques
      err.inner.forEach((error: any) => {
        if (error.path) {
          errors[error.path] = error.message;
        }
      });
    } else if (err.message) {
      // Pour les autres types d'erreurs
      errors.general = err.message;
    }

    return {
      isValid: false,
      errors,
    };
  }
}

/**
 * Fonction utilitaire pour nettoyer les erreurs de validation
 *
 * @param errors - L'objet d'erreurs à nettoyer (peut être undefined)
 * @param fieldName - (optionnel) Nom du champ spécifique à nettoyer. Si non spécifié, nettoie toutes les erreurs
 */
export function clearValidationErrors(
  errors: Record<string, string> | undefined,
  fieldName?: string
): void {
  if (!errors) return;

  if (fieldName) {
    // Nettoyer seulement l'erreur du champ spécifié
    if (errors[fieldName]) {
      delete errors[fieldName];
    }
  } else {
    // Nettoyer toutes les erreurs
    Object.keys(errors).forEach((key) => {
      delete errors[key];
    });
  }
}
