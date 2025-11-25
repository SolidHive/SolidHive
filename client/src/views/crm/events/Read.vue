<template>
  <div v-if="route.name === 'CRMEvents'">
    <Header />
    <div class="p-6 md:px-12">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold">Événements</h1>
        <Button
          v-if="crmAccess.canCreateEvent"
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

      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="event in events"
          :key="event.id"
          class="bg-card hover:border-primary group cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md"
          @click="router.push(`/crm/${crmStore.currentAssociationId}/events/${event.id}`)"
        >
          <div v-if="event.image" class="mb-4 aspect-video overflow-hidden rounded-md">
            <img :src="event.image" :alt="event.title" class="h-full w-full object-cover" />
          </div>
          <h3 class="mb-2 text-lg font-bold">{{ event.title }}</h3>
          <p class="text-muted-foreground mb-4 line-clamp-2 text-sm">{{ event.description }}</p>
          <div class="text-muted-foreground flex items-center gap-2 text-sm">
            <Calendar class="h-4 w-4" />
            {{ formatDate(event.startDate) }}
          </div>
          <div v-if="event.pricings && event.pricings.length > 0" class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="pricing in event.pricings.slice(0, 3)"
              :key="pricing.id"
              class="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs"
            >
              {{ pricing.title }}
            </span>
            <span
              v-if="event.pricings.length > 3"
              class="bg-muted text-muted-foreground rounded-full px-2 py-1 text-xs"
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
