import { ref } from 'vue';
import { defineStore } from 'pinia';
import Database from '../utils/database.utils';
import { UNAUTHORIZED_EVENT } from '../utils/api.utils';
import type { AxiosError } from 'axios';
import type { User, UserAssociation } from '@/interfaces';

/**
 * Dernier état d'authentification connu, gardé dans le navigateur. Au
 * chargement, l'interface s'affiche tout de suite avec cet état, puis le
 * profil est revérifié en arrière-plan : seule une réponse 401 déconnecte.
 * Une panne réseau ou une API en train de se réveiller ne change rien.
 */
const CACHE_KEY = 'solidhive:auth';

type CachedAuth = { user: User; associations: UserAssociation[] };

const readCache = (): CachedAuth | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CachedAuth) : null;
  } catch {
    return null;
  }
};

const writeCache = (value: CachedAuth | null) => {
  try {
    if (value) localStorage.setItem(CACHE_KEY, JSON.stringify(value));
    else localStorage.removeItem(CACHE_KEY);
  } catch {
    // stockage indisponible (navigation privée) : on vit sans cache
  }
};

// Interface pour les informations d'identification
interface LoginCredentials {
  email: string;
  password: string;
}

export const useAuthStore = defineStore('auth', () => {
  const cached = readCache();
  const user = ref<User | null>(cached?.user ?? null);
  const associations = ref<UserAssociation[]>(cached?.associations ?? []);
  const error = ref<string | null>(null);
  // Vrai tant que l'état n'a jamais été confirmé par l'API. Avec un cache, on
  // part de faux : l'interface n'attend pas le réseau pour s'afficher.
  const isLoading = ref(!cached);

  // Vérifie l'authentification
  const isAuthenticated = () => !!user.value;

  let pending: Promise<void> | null = null;

  /**
   * Recharge le profil. Les appels simultanés partagent la même requête.
   * Un 401 déconnecte ; toute autre erreur conserve l'état courant.
   */
  function loadUser(force = false): Promise<void> {
    if (user.value && !force && !isLoading.value) {
      return Promise.resolve();
    }
    if (pending) return pending;

    pending = (async () => {
      try {
        const data = await Database.getAll('auth/profile');
        user.value = data || null;
        associations.value = (await Database.getAll('users/me/associations')) || [];
        writeCache(user.value ? { user: user.value, associations: associations.value } : null);
      } catch (err) {
        const axiosError = err as AxiosError<{ message: string }>;
        if (axiosError.response?.status === 401) {
          resetUserData();
        } else {
          error.value = axiosError.response?.data?.message || 'Erreur lors du chargement du profil';
        }
      } finally {
        isLoading.value = false;
        pending = null;
      }
    })();
    return pending;
  }

  function resetUserData() {
    user.value = null;
    associations.value = [];
    writeCache(null);
  }

  // Session expirée côté serveur, détectée par n'importe quel appel API
  window.addEventListener(UNAUTHORIZED_EVENT, () => {
    if (user.value) resetUserData();
  });

  async function login(credentials: LoginCredentials) {
    error.value = null;
    try {
      const result = await Database.create('auth/login', credentials);
      if (result?.data) {
        await loadUser(true);
        return true;
      }
      return false;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      error.value = axiosError.response?.data?.message || 'Échec de connexion';
      throw err;
    }
  }

  async function logout() {
    try {
      await Database.create('auth/logout', {});
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      error.value = axiosError.response?.data?.message || 'Erreur lors de la déconnexion';
      console.warn('Erreur lors de la déconnexion:', error.value);
    } finally {
      resetUserData();
    }
  }

  async function createAssociation(associationData: {
    name: string;
    description: string;
    contact: string;
    siret?: string;
  }) {
    try {
      const result = await Database.create('association', associationData);
      await loadUser(true);
      return result.data;
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      error.value =
        axiosError.response?.data?.message || "Erreur lors de la création de l'association";
      throw err;
    }
  }

  async function uploadAssociationFile(
    associationId: string,
    file: File,
    type: 'logo' | 'background'
  ) {
    try {
      const purpose = type === 'logo' ? 'logo' : 'banner';
      const index = type === 'logo' ? 0 : 1;

      await Database.uploadFile(file, {
        relatedTo: 'Association',
        relatedBy: associationId,
        purpose,
        index,
      });
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      error.value = axiosError.response?.data?.message || "Erreur lors de l'upload du fichier";
      throw err;
    }
  }

  async function updateUser(userData: Partial<User>) {
    try {
      await Database.put('users/me', userData);
      await loadUser(true);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      error.value = axiosError.response?.data?.message || 'Erreur lors de la mise à jour du profil';
      throw err;
    }
  }

  return {
    user,
    associations,
    error,
    isLoading,
    login,
    logout,
    loadUser,
    isAuthenticated,
    createAssociation,
    uploadAssociationFile,
    updateUser,
  };
});
