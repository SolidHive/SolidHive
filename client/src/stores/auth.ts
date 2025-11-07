import { ref } from 'vue';
import { defineStore } from 'pinia';
import Database from '../utils/database.utils';
import type { AxiosError } from 'axios';

// Interface pour les informations d'identification
interface LoginCredentials {
  email: string;
  password: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
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
    } catch (err) {
      user.value = null;
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
      await Database.uploadFile(`/association/${associationId}/files`, file, { type });
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      error.value = axiosError.response?.data?.message || "Erreur lors de l'upload du fichier";
      throw err;
    }
  }

  async function hasAccessToAssociation(associationId: string) {
    if (!isAuthenticated()) {
      return false;
    }
    try {
      const result = await Database.getAll(`users/me/association/${associationId}`);
      return result;
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      error.value =
        axiosError.response?.data?.message || "Erreur lors de la vérification de l'accès";
      return false;
    }
  }

  return {
    user,
    error,
    isLoading,
    login,
    logout,
    loadUser,
    isAuthenticated,
    createAssociation,
    uploadAssociationFile,
    hasAccessToAssociation,
  };
});
