<template>
  <div class="bg-muted/30 min-h-screen pt-6 pb-12">
    <div class="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <!-- Header minimaliste -->
      <div class="bg-card border-border mb-6 rounded-3xl border p-6 shadow-sm">
        <div class="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <!-- Avatar + Info inline -->
          <div class="flex items-center gap-4">
            <div
              class="bg-secondary flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-md"
            >
              <UserIcon class="h-8 w-8 text-white" :stroke-width="2" />
            </div>

            <div>
              <h1 v-if="profile" class="font-title text-foreground mb-1 text-2xl">
                {{ profile.name }} {{ profile.firstname }}
              </h1>
              <div class="flex flex-wrap items-center gap-2 text-sm">
                <span v-if="profile" class="font-paragraph text-muted-foreground">
                  Membre depuis {{ formatDate(profile.createdAt, true) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <Button variant="default" size="sm">
              <Edit class="mr-1.5 h-4 w-4" />
              Modifier
            </Button>
            <Button variant="outline" size="sm" class="aspect-square w-9 p-0">
              <Settings class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Grid layout moderne -->
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Colonne principale - 2/3 -->
        <div class="space-y-6 lg:col-span-2">
          <!-- Informations personnelles -->
          <div class="bg-card border-border rounded-3xl border p-6 shadow-sm">
            <h2 class="font-subtitle text-foreground mb-5 text-lg">Informations personnelles</h2>

            <div v-if="profile" class="grid gap-4 sm:grid-cols-2">
              <!-- Nom -->
              <div class="group">
                <label
                  class="font-paragraph text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
                >
                  Nom
                </label>
                <p
                  class="font-paragraph text-foreground bg-muted/50 group-hover:bg-muted rounded-xl px-4 py-2.5 transition-colors"
                >
                  {{ profile.name || 'Non renseigné' }}
                </p>
              </div>

              <!-- Prénom -->
              <div class="group">
                <label
                  class="font-paragraph text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
                >
                  Prénom
                </label>
                <p
                  class="font-paragraph text-foreground bg-muted/50 group-hover:bg-muted rounded-xl px-4 py-2.5 transition-colors"
                >
                  {{ profile.firstname || 'Non renseigné' }}
                </p>
              </div>

              <!-- Email -->
              <div class="group sm:col-span-2">
                <label
                  class="font-paragraph text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
                >
                  Email
                </label>
                <p
                  class="font-paragraph text-foreground bg-muted/50 group-hover:bg-muted flex items-center gap-2 rounded-xl px-4 py-2.5 transition-colors"
                >
                  <Mail class="text-muted-foreground h-4 w-4" />
                  {{ profile.email }}
                </p>
              </div>

              <!-- Téléphone -->
              <div class="group">
                <label
                  class="font-paragraph text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
                >
                  Téléphone
                </label>
                <p
                  class="font-paragraph text-foreground bg-muted/50 group-hover:bg-muted rounded-xl px-4 py-2.5 transition-colors"
                >
                  {{ profile.phone || 'Non renseigné' }}
                </p>
              </div>
            </div>

            <div v-else class="bg-muted/30 flex h-32 items-center justify-center rounded-2xl">
              <LoadingOverlay :show="true" message="Chargement de votre profil..." />
            </div>
          </div>

          <!-- Mes Associations -->
          <div class="bg-card border-border rounded-3xl border p-6 shadow-sm">
            <div class="mb-5 flex items-center justify-between">
              <h2 class="font-subtitle text-foreground text-lg">Mes Associations</h2>
              <Button
                v-if="hasNoAssociations"
                variant="default"
                size="sm"
                @click="createAssociation"
              >
                <Plus class="mr-1.5 h-4 w-4" />
                Créer
              </Button>
            </div>

            <!-- Liste associations -->
            <LoadingOverlay
              v-if="isLoadingAssociations"
              :show="true"
              message="Chargement de vos associations..."
            />

            <div v-else-if="associations.length > 0" class="space-y-3">
              <div
                v-for="userAssoc in associations"
                :key="userAssoc.id"
                class="border-border hover:border-primary/30 bg-muted/20 group rounded-2xl border p-4 transition-all hover:shadow-sm"
              >
                <div class="mb-2 flex items-start justify-between gap-3">
                  <h3
                    class="font-subtitle text-foreground group-hover:text-primary text-base transition-colors"
                  >
                    {{ userAssoc.association.name }}
                  </h3>
                  <span
                    :class="getStatusBadgeClass(userAssoc.status)"
                    class="font-paragraph shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium"
                  >
                    {{ getStatusText(userAssoc.status) }}
                  </span>
                </div>

                <p
                  v-if="userAssoc.association.description"
                  class="font-paragraph text-muted-foreground mb-3 line-clamp-1 text-sm"
                >
                  {{ userAssoc.association.description }}
                </p>

                <div class="flex items-center justify-between">
                  <span
                    v-if="userAssoc.role"
                    class="font-paragraph text-muted-foreground flex items-center gap-1.5 text-xs"
                  >
                    <Shield class="h-3.5 w-3.5" />
                    {{ userAssoc.role.name }}
                  </span>

                  <Button variant="ghost" size="sm" as-child class="h-8">
                    <router-link :to="`/associations/${userAssoc.association.id}`">
                      Voir →
                    </router-link>
                  </Button>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else class="bg-muted/20 rounded-2xl py-10 text-center">
              <Building2 class="text-muted-foreground mx-auto mb-3 h-10 w-10" :stroke-width="1.5" />
              <p class="font-paragraph text-muted-foreground mb-4 text-sm">
                Vous ne faites partie d'aucune association
              </p>
              <div class="flex flex-col items-center gap-2">
                <Button variant="default" size="sm" @click="createAssociation">
                  Créer une association
                </Button>
                <Button variant="outline" size="sm" as-child>
                  <router-link to="/associations">Explorer les associations</router-link>
                </Button>
              </div>
            </div>
          </div>

          <!-- Mes dons -->
          <div class="bg-card border-border rounded-3xl border p-6 shadow-sm">
            <div class="mb-5 flex items-center justify-between">
              <h2 class="font-subtitle text-foreground text-lg">Mes dons</h2>
              <Button variant="outline" size="sm" as-child>
                <router-link to="/profile/donations">
                  <Heart class="mr-1.5 h-4 w-4" />
                  Voir tout
                </router-link>
              </Button>
            </div>

            <!-- Liste des dons récents -->
            <LoadingOverlay
              v-if="isLoadingDonations"
              :show="true"
              message="Chargement de vos dons..."
            />

            <div v-else-if="recentDonations.length > 0" class="space-y-3">
              <div
                v-for="donation in recentDonations"
                :key="donation.id"
                class="border-border hover:border-primary/30 bg-muted/20 group rounded-2xl border p-4 transition-all hover:shadow-sm"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div
                      class="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl"
                    >
                      <Heart class="h-5 w-5" />
                    </div>
                    <div>
                      <h3
                        class="font-subtitle text-foreground group-hover:text-primary text-base transition-colors"
                      >
                        {{ donation.relatedTo }}
                      </h3>
                      <p class="font-paragraph text-muted-foreground text-sm">
                        {{ formatDate(donation.timestamps.createdAt) }}
                      </p>
                    </div>
                  </div>

                  <div class="text-right">
                    <p class="font-title text-foreground text-lg font-bold">
                      {{ formatCurrency(donation.amount) }}
                    </p>
                    <p class="font-paragraph text-muted-foreground text-xs">
                      ID: {{ donation.relatedBy.slice(-8) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Placeholder si aucun don -->
            <div v-else class="bg-muted/20 rounded-2xl py-8 text-center">
              <Heart class="text-muted-foreground mx-auto mb-3 h-8 w-8" :stroke-width="1.5" />
              <p class="font-paragraph text-muted-foreground mb-2 text-sm">Aucun don récent</p>
              <p class="font-paragraph text-muted-foreground text-xs">Vos dons apparaîtront ici</p>
            </div>
          </div>
        </div>

        <!-- Sidebar - 1/3 -->
        <div class="space-y-6">
          <!-- Compte -->
          <div class="bg-card border-border rounded-3xl border p-6 shadow-sm">
            <h2 class="font-subtitle text-foreground mb-5 text-lg">Compte</h2>

            <div v-if="profile" class="space-y-4">
              <div>
                <label
                  class="font-paragraph text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
                >
                  Date d'inscription
                </label>
                <p
                  class="font-paragraph text-foreground bg-muted/50 rounded-xl px-4 py-2.5 text-sm"
                >
                  {{ formatDate(profile.createdAt) }}
                </p>
              </div>

              <div>
                <label
                  class="font-paragraph text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
                >
                  Dernière connexion
                </label>
                <p
                  class="font-paragraph text-foreground bg-muted/50 rounded-xl px-4 py-2.5 text-sm"
                >
                  {{ formatDate(new Date().toISOString()) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Actions dangereuses -->
          <div class="bg-card border-border rounded-3xl border p-6 shadow-sm">
            <h2 class="font-subtitle text-foreground mb-4 text-lg">Actions</h2>

            <div class="space-y-2">
              <Button
                variant="outline"
                size="sm"
                class="w-full"
                :disabled="isLoggingOut"
                @click="handleLogout"
              >
                <LogOut class="mr-2 h-4 w-4" />
                {{ isLoggingOut ? 'Déconnexion...' : 'Se déconnecter' }}
              </Button>

              <Button
                variant="outline"
                size="sm"
                class="border-destructive/30 text-destructive hover:bg-destructive w-full hover:text-white"
              >
                <Trash2 class="mr-2 h-4 w-4" />
                Supprimer le compte
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import Database from '../utils/database.utils';
  import type { User, UserAssociation, Transaction } from '../interfaces';
  import { Button } from '../components/ui/button';
  import { useRouter } from 'vue-router';
  import {
    User as UserIcon,
    Edit,
    Settings,
    Mail,
    Plus,
    Shield,
    Building2,
    Trash2,
    LogOut,
    Heart,
  } from 'lucide-vue-next';
  import { useToast } from 'vue-toastification';
  import { useAuthStore } from '../stores/auth';
  import LoadingOverlay from '../components/LoadingOverlay.vue';

  // État réactif
  const profile = ref<User | null>(null);
  const associations = ref<UserAssociation[]>([]);
  const recentDonations = ref<Transaction[]>([]);
  const isLoadingProfile = ref(true);
  const isLoadingAssociations = ref(true);
  const isLoadingDonations = ref(true);
  const isLoggingOut = ref(false);

  // Composables
  const router = useRouter();
  const toast = useToast();
  const authStore = useAuthStore();

  // Computed
  const hasNoAssociations = computed(() => associations.value.length === 0);

  // Méthodes utilitaires
  function formatDate(dateString: string, shortFormat = false): string {
    const date = new Date(dateString);

    if (shortFormat) {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    }

    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

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

  async function loadRecentDonations(): Promise<void> {
    try {
      isLoadingDonations.value = true;
      console.log('Chargement des dons récents...');
      const transactions = await Database.getAll('transactions', {
        order: JSON.stringify({ 'timestamps.createdAt': 'DESC' }),
        take: 3,
      });
      console.log('Dons récents reçus:', transactions);
      recentDonations.value = transactions;
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

  function getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'accepted':
        return 'bg-secondary/10 text-secondary border border-secondary/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-700 border border-amber-500/20';
      case 'rejected':
        return 'bg-destructive/10 text-destructive border border-destructive/20';
      default:
        return 'bg-muted/50 text-muted-foreground';
    }
  }

  function getStatusText(status: string): string {
    switch (status) {
      case 'accepted':
        return 'Accepté';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Refusé';
      default:
        return status;
    }
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
    loadRecentDonations();
  });
</script>
