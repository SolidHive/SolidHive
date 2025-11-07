<template>
  <div class="bg-muted/30 min-h-screen pt-6 pb-12">
    <div class="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <!-- Header minimaliste -->
      <ProfileHeader :profile="profile" />

      <!-- Grid layout moderne -->
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Colonne principale - 2/3 -->
        <div class="space-y-6 lg:col-span-2">
          <!-- Informations personnelles -->
          <ProfilePersonalInfo :profile="profile" />

          <!-- Mes Associations -->
          <ProfileAssociations
            :associations="associations"
            :is-loading="isLoadingAssociations"
            @create-association="createAssociation"
          />

          <!-- Mes dons -->
          <ProfileDonations
            :recent-donations="recentDonations"
            :recent-fundraising-donations="recentFundraisingDonations"
            :all-associations="allAssociations"
            :all-fundraisings="allFundraisings"
            :is-loading="isLoadingDonations"
          />
        </div>

        <!-- Sidebar - 1/3 -->
        <ProfileSidebar :profile="profile" :is-logging-out="isLoggingOut" @logout="handleLogout" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import Database from '@/utils/database.utils';
  import type { User, UserAssociation, Transaction } from '@/interfaces';
  import { useRouter } from 'vue-router';
  import { useToast } from 'vue-toastification';
  import { useAuthStore } from '@/stores/auth';
  import ProfileHeader from '@/components/profile/ProfileHeader.vue';
  import ProfilePersonalInfo from '@/components/profile/ProfilePersonalInfo.vue';
  import ProfileAssociations from '@/components/profile/ProfileAssociations.vue';
  import ProfileDonations from '@/components/profile/ProfileDonations.vue';
  import ProfileSidebar from '@/components/profile/ProfileSidebar.vue';

  // État réactif
  const profile = ref<User | null>(null);
  const associations = ref<UserAssociation[]>([]);
  const allAssociations = ref<any[]>([]);
  const allFundraisings = ref<any[]>([]);
  const recentDonations = ref<Transaction[]>([]);
  const recentFundraisingDonations = ref<Transaction[]>([]);
  const isLoadingProfile = ref(true);
  const isLoadingAssociations = ref(true);
  const isLoadingAllAssociations = ref(true);
  const isLoadingFundraisings = ref(true);
  const isLoadingDonations = ref(true);
  const isLoggingOut = ref(false);

  // Composables
  const router = useRouter();
  const toast = useToast();
  const authStore = useAuthStore();

  // Méthodes de chargement des données
  async function loadProfile(): Promise<void> {
    try {
      isLoadingProfile.value = true;
      const data = await Database.getAll('auth/profile');
      profile.value = data || null;
    } catch (err) {
      console.error('Erreur lors du chargement du profil:', err);
      profile.value = null;
    } finally {
      isLoadingProfile.value = false;
    }
  }

  async function loadAssociations(): Promise<void> {
    try {
      isLoadingAssociations.value = true;
      const data = await Database.getAll('users/me/associations');
      associations.value = data || [];
    } catch (err) {
      console.error('Erreur lors du chargement des associations:', err);
      associations.value = [];
    } finally {
      isLoadingAssociations.value = false;
    }
  }

  async function loadAllAssociations(): Promise<void> {
    try {
      isLoadingAllAssociations.value = true;
      const data = await Database.getAll('associations');
      allAssociations.value = data || [];
    } catch (err) {
      console.error('Erreur lors du chargement de toutes les associations:', err);
      allAssociations.value = [];
    } finally {
      isLoadingAllAssociations.value = false;
    }
  }

  async function loadAllFundraisings(): Promise<void> {
    try {
      isLoadingFundraisings.value = true;
      const data = await Database.getAll('fundraisings');
      allFundraisings.value = data || [];
    } catch (err) {
      console.error('Erreur lors du chargement de toutes les cagnottes:', err);
      allFundraisings.value = [];
    } finally {
      isLoadingFundraisings.value = false;
    }
  }

  async function loadRecentDonations(): Promise<void> {
    try {
      isLoadingDonations.value = true;
      const transactions = await Database.getAll('transactions', {
        order: JSON.stringify({ 'timestamps.createdAt': 'DESC' }),
        take: 6, // On prend plus de transactions pour pouvoir les séparer
      });

      // Séparer les dons classiques des dons aux cagnottes
      const classicDonations = transactions.filter(
        (t: Transaction) => t.relatedTo !== 'Fundraising'
      );
      const fundraisingDonations = transactions.filter(
        (t: Transaction) => t.relatedTo === 'Fundraising'
      );

      // Prendre seulement les 3 plus récents de chaque type
      recentDonations.value = classicDonations.slice(0, 3);
      recentFundraisingDonations.value = fundraisingDonations.slice(0, 3);
    } catch (error) {
      console.error('Erreur lors du chargement des dons récents:', error);
    } finally {
      isLoadingDonations.value = false;
    }
  }

  // Méthodes d'actions
  function createAssociation(): void {
    router.push('/association/create');
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

  // Lifecycle
  onMounted(() => {
    loadProfile();
    loadAssociations();
    loadAllAssociations();
    loadAllFundraisings();
    loadRecentDonations();
  });
</script>
