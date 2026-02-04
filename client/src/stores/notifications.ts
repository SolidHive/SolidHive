import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Database from '../utils/database.utils';

export const useNotificationsStore = defineStore('notifications', () => {
  const pendingNotificationsCount = ref(0);
  const isLoading = ref(false);

  const hasPendingNotifications = computed(() => pendingNotificationsCount.value > 0);

  async function loadPendingNotifications(userEmail?: string) {
    // Si pas d'email fourni, essayer de récupérer depuis le store auth
    if (!userEmail) {
      try {
        const { useAuthStore } = await import('./auth');
        const authStore = useAuthStore();
        userEmail = authStore.user?.email;
      } catch (error) {
        console.error("Erreur lors de l'import du store auth :", error);
        return;
      }
    }

    if (!userEmail) {
      pendingNotificationsCount.value = 0;
      return;
    }

    isLoading.value = true;
    try {
      const userAssociations = await Database.getAll('users/me/associations');
      const invitations = userAssociations.filter((ua: any) => ua.status === 'pending');
      pendingNotificationsCount.value = invitations.length;
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      pendingNotificationsCount.value = 0;
    } finally {
      isLoading.value = false;
    }
  }

  function decrementNotifications() {
    if (pendingNotificationsCount.value > 0) {
      pendingNotificationsCount.value -= 1;
    }
  }

  function resetNotifications() {
    pendingNotificationsCount.value = 0;
  }

  return {
    pendingNotificationsCount,
    isLoading,
    hasPendingNotifications,
    loadPendingNotifications,
    decrementNotifications,
    resetNotifications,
  };
});
