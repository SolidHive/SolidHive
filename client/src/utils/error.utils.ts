/**
 * Récupère le message d'erreur basé sur le statut HTTP
 */
export function getApiErrorMessage(
  error: unknown,
  apiErrorMessages?: Record<number | string, string>
): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (
      error as {
        response: { status: number; data?: { message?: string } };
      }
    ).response;

    const status = response.status;

    // Priorité aux messages personnalisés du front-end
    if (apiErrorMessages && status in apiErrorMessages) {
      return apiErrorMessages[status as keyof typeof apiErrorMessages]!;
    }

    // Sinon, utiliser le message de l'API si disponible
    if (response.data?.message) {
      return response.data.message;
    }
  }

  return apiErrorMessages?.unknown || 'Une erreur inconnue est survenue.';
}
