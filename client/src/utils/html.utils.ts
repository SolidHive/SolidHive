/**
 * Texte brut d'un contenu HTML issu de l'éditeur riche, pour les aperçus où le
 * balisage ne doit pas apparaître. Passe par le parseur du navigateur plutôt
 * que par une expression régulière : les entités (`&amp;`, `&nbsp;`) sont
 * décodées et rien n'est exécuté.
 */
export const htmlToText = (html?: string | null): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
};
