<template>
  <div v-if="route.name === 'CRMEvents'">
    <Header :can-create-items="crmAccess.canCreateEvent && hasStripeAccount">
      <template #header>Événements</template>
      <template #description>Gérez les événements de votre association</template>
      <template #add-button>
        <Button
          class="w-full sm:w-auto"
          @click="router.push(`/crm/${crmStore.currentAssociationId}/events/create`)"
        >
          <Plus class="mr-2 h-4 w-4" />
          Créer un événement
        </Button>
      </template>
    </Header>

    <div class="px-2 py-4 sm:p-6 md:px-12">
      <!-- Message d'avertissement si pas de compte Stripe -->
      <div
        v-if="!hasStripeAccount && !loading"
        class="mb-6 border-l-4 border-yellow-400 bg-yellow-50 p-4"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <AlertTriangle class="h-5 w-5 text-yellow-400" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              <strong class="font-medium">Compte Stripe non configuré</strong>
              <br />
              Pour créer des événements payants, vous devez d'abord activer votre compte Stripe dans
              les paramètres de votre association.
            </p>
          </div>
        </div>
      </div>
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingOverlay message="Chargement des événements..." />
      </div>

      <div v-else-if="events.length === 0" class="bg-muted rounded-lg p-12 text-center">
        <p class="text-muted-foreground">Aucun événement pour le moment</p>
      </div>

      <div v-else class="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="event in events"
          :key="event.id"
          class="bg-card hover:border-primary group cursor-pointer overflow-hidden rounded-lg border p-3 transition-all hover:shadow-md sm:p-4"
          @click="router.push(`/crm/${crmStore.currentAssociationId}/events/${event.id}`)"
        >
          <div v-if="event.image" class="mb-3 aspect-video overflow-hidden rounded-md sm:mb-4">
            <img :src="event.image" :alt="event.title" class="h-full w-full object-cover" />
          </div>
          <h3 class="mb-2 line-clamp-2 text-base font-bold break-words sm:text-lg">
            {{ event.title }}
          </h3>
          <p class="text-muted-foreground mb-3 line-clamp-2 text-xs break-words sm:mb-4 sm:text-sm">
            {{ event.description }}
          </p>
          <div class="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
            <Calendar class="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
            <span class="truncate">{{ formatDate(event.startDate) }}</span>
          </div>
          <div
            v-if="event.pricings && event.pricings.length > 0"
            class="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2"
          >
            <span
              v-for="pricing in event.pricings.slice(0, 3)"
              :key="pricing.id"
              class="bg-primary/10 text-primary truncate rounded-full px-1.5 py-0.5 text-xs sm:px-2 sm:py-1"
            >
              {{ pricing.title }}
            </span>
            <span
              v-if="event.pricings.length > 3"
              class="bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-xs sm:px-2 sm:py-1"
            >
              +{{ event.pricings.length - 3 }}
            </span>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-items="totalItems"
        :items-per-page="itemsPerPage"
        @previous="goToPreviousPage"
        @next="goToNextPage"
        @update:items-per-page="handleItemsPerPageChange"
      />
    </div>
  </div>
  <router-view />
</template>

<script setup lang="ts">
  import { onMounted, watch, ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { Calendar, AlertTriangle } from 'lucide-vue-next';
  import Header from '@/components/dashboard/Header.vue';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import Pagination from '@/components/dashboard/Pagination.vue';
  import { useCrmStore } from '@/stores/crm';
  import { useCrmAccess } from '@/composables/crm-access';
  import Database from '@/utils/database.utils';
  import type { Event } from '@/interfaces';

  const router = useRouter();
  const route = useRoute();
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);

  const loading = ref(true);
  const events = ref<Event[]>([]);
  const hasStripeAccount = ref(false);
  const currentPage = ref(1);
  const itemsPerPage = ref(5);
  const totalItems = ref(0);
  const totalPages = ref(1);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleItemsPerPageChange = (value: number) => {
    itemsPerPage.value = value;
    currentPage.value = 1;
    fetchItems();
  };

  const goToPreviousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
      fetchItems();
    }
  };

  const goToNextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
      fetchItems();
    }
  };

  const fetchItems = async () => {
    if (!crmStore.currentAssociationId) return;

    try {
      loading.value = true;

      const params: Record<string, any> = {
        skip: (currentPage.value - 1) * itemsPerPage.value,
        take: itemsPerPage.value,
      };

      const response = await Database.getAll(
        `association/${crmStore.currentAssociationId}/events`,
        params
      );

      // Si la réponse contient data et meta (format paginé)
      if (response && typeof response === 'object' && 'data' in response && 'meta' in response) {
        events.value = response.data;
        totalItems.value = response.meta.total;
        totalPages.value = response.meta.totalPages;
        currentPage.value = response.meta.page;
        itemsPerPage.value =
          typeof response.meta.limit === 'string'
            ? parseInt(response.meta.limit, 10)
            : response.meta.limit;
      } else {
        // Format simple (tableau direct) - pour les endpoints sans pagination
        events.value = Array.isArray(response) ? response : [];
        totalItems.value = events.value.length;
        totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value) || 1;
      }
    } catch (err) {
      console.error('Erreur lors du chargement des événements:', err);
      events.value = [];
      totalItems.value = 0;
      totalPages.value = 1;
    } finally {
      loading.value = false;
    }
  };

  const checkStripeAccount = async () => {
    try {
      const association = await Database.getOne('association', crmStore.currentAssociationId!);
      hasStripeAccount.value = !!(association.stripeAccountId && association.canReceiveDonations);
    } catch (error) {
      console.error('Erreur lors de la vérification du compte Stripe:', error);
      hasStripeAccount.value = false;
    }
  };

  onMounted(async () => {
    await checkStripeAccount();
    await fetchItems();
  });

  watch(
    () => route.name,
    (newRouteName) => {
      if (newRouteName === 'CRMEvents') {
        fetchItems();
      }
    }
  );
</script>
