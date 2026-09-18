/**
 * Options de lancement de Chromium pour la génération de PDF.
 *
 * Pensées pour un conteneur à 512 Mo sans /dev/shm digne de ce nom : pas de
 * sandbox (conteneur déjà isolé), mémoire partagée remplacée par /tmp, pas de
 * GPU, et un seul processus pour éviter que le navigateur ne dépasse la
 * mémoire disponible. Un PDF à la fois, ce qui correspond à l'usage réel.
 */
export const CHROMIUM_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--no-zygote',
  '--single-process',
];
