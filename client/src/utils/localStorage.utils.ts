/**
 * Utilitaires pour gérer le localStorage des associations en attente
 */

const STORAGE_KEYS = {
  ASSOCIATION: 'pendingAssociation',
  LOGO: 'pendingAssociationLogo',
  LOGO_NAME: 'pendingAssociationLogoName',
  LOGO_TYPE: 'pendingAssociationLogoType',
  BACKGROUND: 'pendingAssociationBackground',
  BACKGROUND_NAME: 'pendingAssociationBackgroundName',
  BACKGROUND_TYPE: 'pendingAssociationBackgroundType',
} as const;

export interface PendingAssociation {
  name: string;
  description: string;
  contact: string;
  siret: string;
}

export interface PendingFile {
  data: string; // base64
  name: string;
  type: string;
}

/**
 * Sauvegarde les données d'une association en attente
 */
export function savePendingAssociation(data: PendingAssociation): void {
  localStorage.setItem(STORAGE_KEYS.ASSOCIATION, JSON.stringify(data));
}

/**
 * Sauvegarde un fichier en base64
 */
export function savePendingFile(file: File, type: 'logo' | 'background'): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const base64 = e.target?.result as string;

      if (type === 'logo') {
        localStorage.setItem(STORAGE_KEYS.LOGO, base64);
        localStorage.setItem(STORAGE_KEYS.LOGO_NAME, file.name);
        localStorage.setItem(STORAGE_KEYS.LOGO_TYPE, file.type);
      } else {
        localStorage.setItem(STORAGE_KEYS.BACKGROUND, base64);
        localStorage.setItem(STORAGE_KEYS.BACKGROUND_NAME, file.name);
        localStorage.setItem(STORAGE_KEYS.BACKGROUND_TYPE, file.type);
      }

      resolve();
    };

    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
    reader.readAsDataURL(file);
  });
}

/**
 * Récupère les données d'une association en attente
 */
export function getPendingAssociation(): PendingAssociation | null {
  const data = localStorage.getItem(STORAGE_KEYS.ASSOCIATION);
  return data ? JSON.parse(data) : null;
}

/**
 * Récupère un fichier en attente et le convertit en File
 */
export async function getPendingFile(type: 'logo' | 'background'): Promise<File | null> {
  const base64Key = type === 'logo' ? STORAGE_KEYS.LOGO : STORAGE_KEYS.BACKGROUND;
  const nameKey = type === 'logo' ? STORAGE_KEYS.LOGO_NAME : STORAGE_KEYS.BACKGROUND_NAME;
  const typeKey = type === 'logo' ? STORAGE_KEYS.LOGO_TYPE : STORAGE_KEYS.BACKGROUND_TYPE;

  const base64 = localStorage.getItem(base64Key);
  const name = localStorage.getItem(nameKey);
  const fileType = localStorage.getItem(typeKey);

  if (!base64 || !name || !fileType) return null;

  try {
    const blob = await fetch(base64).then((r) => r.blob());
    return new File([blob], name, { type: fileType });
  } catch (error) {
    console.error('Erreur lors de la conversion du fichier:', error);
    return null;
  }
}

/**
 * Vérifie si une association est en attente
 */
export function hasPendingAssociation(): boolean {
  return localStorage.getItem(STORAGE_KEYS.ASSOCIATION) !== null;
}

/**
 * Supprime toutes les données d'association en attente
 */
export function clearPendingAssociation(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
