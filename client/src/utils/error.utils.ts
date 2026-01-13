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

    // Si l'API retourne un message spécifique, on l'utilise en priorité
    if (response.data?.message) {
      return response.data.message;
    }

    const status = response.status;

    if (apiErrorMessages && status in apiErrorMessages) {
      return apiErrorMessages[status as keyof typeof apiErrorMessages]!;
    }
  }

  return apiErrorMessages?.unknown || 'Une erreur inconnue est survenue.';
}
