<template>
  <div v-if="route.name === 'CRMEvents'">
    <Header />
    <div class="px-2 py-4 sm:p-6 md:px-12">
      <div class="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-xl font-bold sm:text-2xl md:text-3xl">Événements</h1>
        <Button
          v-if="crmAccess.canCreateEvent"
          class="w-full sm:w-auto"
          @click="router.push(`/crm/${crmStore.currentAssociationId}/events/create`)"
        >
          <Plus class="mr-2 h-4 w-4" />
          Créer un événement
        </Button>
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
    </div>
  </div>
  <router-view />
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';

  const route = useRoute();
  import { Plus, Calendar } from 'lucide-vue-next';
  import Header from '@/components/dashboard/Header.vue';
  import Button from '@/components/ui/button/Button.vue';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import { useCrmStore } from '@/stores/crm';
  import { useCrmAccess } from '@/composables/crm-access';
  import Database from '@/utils/database.utils';
  import type { Event } from '@/interfaces';

  const router = useRouter();
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);

  const loading = ref(true);
  const events = ref<Event[]>([]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const loadEvents = async () => {
    if (!crmStore.currentAssociationId) return;

    try {
      loading.value = true;
      const response = await Database.getAll(`association/${crmStore.currentAssociationId}/events`);
      events.value = response;
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    loadEvents();
  });
</script>
