import { ref } from 'vue';
import { defineStore } from 'pinia';
import Database from '../utils/database.utils';
import type { AxiosError } from 'axios';
import type { User, UserAssociation } from '@/interfaces';

// Interface pour les informations d'identification
interface LoginCredentials {
  email: string;
  password: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const associations = ref<UserAssociation[]>([]);
  const error = ref<string | null>(null);
  const isLoading = ref(true);

  // Vérifie l'authentification
  const isAuthenticated = () => !!user.value;

  // Charge le profil utilisateur au démarrage
  async function loadUser() {
    isLoading.value = true;
    try {
      const data = await Database.getAll('auth/profile'); // Vérifie la session
      user.value = data || null;

      if (user.value !== null) {
        const data = await Database.getAll('users/me/associations');
        associations.value = data || [];
      }
    } catch (err) {
      user.value = null;
      associations.value = [];
      const axiosError = err as AxiosError<{ message: string }>;
      error.value = axiosError.response?.data?.message || 'Erreur lors du chargement du profil';
    } finally {
      isLoading.value = false;
    }
  }

  async function login(credentials: LoginCredentials) {
    error.value = null;
    try {
      const result = await Database.create('auth/login', credentials);
      if (result?.data) {
        await loadUser();
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
      user.value = null;
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
  };
});
