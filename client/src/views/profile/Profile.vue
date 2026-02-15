<template>
  <PageContainer>
    <div class="bg-muted/30 min-h-screen">
      <ProfileHeader :profile="profile" />

      <div class="grid gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <ProfilePersonalInfo :profile="profile" />

          <ProfileAssociations
            :associations="associations"
            :is-loading="isLoadingAssociations"
            @create-association="createAssociation"
          />

          <ProfileDonations
            :recent-donations="recentDonations"
            :recent-fundraising-donations="recentFundraisingDonations"
            :recent-event-registrations="recentEventRegistrations"
            :is-loading="isLoadingDonations"
            @registration-cancelled="handleRegistrationCancelled"
          />
        </div>

        <ProfileSidebar
          :profile="profile"
          :is-logging-out="isLoggingOut"
          :favorite-associations="favoriteAssociations"
          :is-loading-favorites="isLoadingFavorites"
          @logout="handleLogout"
          @remove-favorite="handleRemoveFavorite"
          @account-deleted="handleAccountDeleted"
        />
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useToast } from 'vue-toastification';
  import { useAuthStore } from '@/stores/auth';
  import Database from '@/utils/database.utils';
  import type { Transaction, Association } from '@/interfaces';

  import PageContainer from '@/components/PageContainer.vue';
  import ProfileHeader from '@/components/profile/ProfileHeader.vue';
  import ProfilePersonalInfo from '@/components/profile/ProfilePersonalInfo.vue';
  import ProfileAssociations from '@/components/profile/ProfileAssociations.vue';
  import ProfileDonations from '@/components/profile/ProfileDonations.vue';
  import ProfileSidebar from '@/components/profile/ProfileSidebar.vue';

  // Composables
  const router = useRouter();
  const toast = useToast();
  const authStore = useAuthStore();

  // État réactif
  const profile = computed(() => authStore.user);
  const associations = computed(() => authStore.associations);
  const recentDonations = ref<Transaction[]>([]);
  const recentFundraisingDonations = ref<Transaction[]>([]);
  const recentEventRegistrations = ref<Transaction[]>([]);
  const favoriteAssociations = ref<Association[]>([]);
  const isLoadingAssociations = ref(false);
  const isLoadingDonations = ref(true);
  const isLoadingFavorites = ref(true);
  const isLoggingOut = ref(false);

  // Chargement des données
  async function loadRecentDonations(): Promise<void> {
    try {
      isLoadingDonations.value = true;
      const transactions = await Database.getAll('transactions', {
        order: JSON.stringify({ 'timestamps.createdAt': 'DESC' }),
        relations: JSON.stringify(['association', 'fundraising', 'event']),
      });

      const classicDonations = transactions.filter(
        (t: Transaction) => t.relatedTo === 'Association'
      );
      const fundraisingDonations = transactions.filter(
        (t: Transaction) => t.relatedTo === 'Fundraising'
      );
      const eventRegistrations = transactions.filter((t: Transaction) => t.relatedTo === 'Event');

      recentDonations.value = classicDonations.slice(0, 3);
      recentFundraisingDonations.value = fundraisingDonations.slice(0, 3);
      recentEventRegistrations.value = eventRegistrations.slice(0, 3);
    } catch (error) {
      console.error('Erreur lors du chargement des dons récents:', error);
    } finally {
      isLoadingDonations.value = false;
    }
  }

  async function loadFavoriteAssociations(): Promise<void> {
    try {
      isLoadingFavorites.value = true;
      const favorites = await Database.getAll('favorites');

      // Filtrer les favoris d'associations
      const associationFavorites = favorites.filter(
        (favorite: any) => favorite.relatedTo === 'Association'
      );

      if (associationFavorites.length === 0) {
        favoriteAssociations.value = [];
        return;
      }

      const associationPromises = associationFavorites.map((favorite: any) =>
        Database.getAll(`association/${favorite.relatedBy}`)
      );

      const associations = await Promise.all(associationPromises);
      favoriteAssociations.value = associations;
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    } finally {
      isLoadingFavorites.value = false;
    }
  }

  // Actions
  function createAssociation(): void {
    router.push('/create-association');
  }

  function handleRemoveFavorite(associationId: string): void {
    favoriteAssociations.value = favoriteAssociations.value.filter(
      (assoc) => assoc.id !== associationId
    );
  }

  async function handleLogout(): Promise<void> {
    try {
      isLoggingOut.value = true;
      await authStore.logout();
      toast.success('Déconnexion réussie');
      router.push('/login');
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
      toast.error('Erreur lors de la déconnexion');
    } finally {
      isLoggingOut.value = false;
    }
  }

  function handleAccountDeleted(): void {
    toast.success('Votre compte a été supprimé avec succès');
    router.push('/login');
  }

  function handleRegistrationCancelled(transactionId: string | number): void {
    console.log('handleRegistrationCancelled appelé avec:', transactionId);
    loadRecentDonations();
  }

  onMounted(() => {
    loadRecentDonations();
    loadFavoriteAssociations();

    if (!authStore.user) {
      authStore.loadUser(false);
    }
  });
</script>
