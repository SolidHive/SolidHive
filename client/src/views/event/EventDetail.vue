<template>
  <div class="overflow-x-hidden">
    <AssociationHero
      v-if="event && event.association"
      :association="event.association as Association"
      @don="faireUnDon"
    />
    <PageContainer>
      <h2 class="font-title text-secondary mb-4 text-2xl sm:text-3xl lg:text-4xl">Description</h2>

      <div class="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
        <div class="space-y-6 sm:space-y-8 lg:col-span-2">
          <EventHeader
            v-if="event"
            :title="event.title"
            :description="event.description"
            :image="event.image"
          />

          <div class="border-t border-gray-200"></div>

          <EventInformations
            v-if="event"
            :start-date="event.startDate"
            :end-date="event.endDate"
            :address="event.address"
          />

          <div class="border-t border-gray-200"></div>

          <EventOrganizer v-if="event && event.association" :association="event.association" />
        </div>

        <div class="space-y-4 sm:space-y-6">
          <EventTicketsSidebar v-if="event" :pricings="event.pricings" />
        </div>
      </div>
    </PageContainer>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onActivated } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useToast } from 'vue-toastification';
  import AssociationHero from '@/components/associations/hero/AssociationHero.vue';
  import PageContainer from '@/components/PageContainer.vue';
  import EventHeader from '@/components/events/EventHeader.vue';
  import EventInformations from '@/components/events/EventInformations.vue';
  import EventOrganizer from '@/components/events/EventOrganizer.vue';
  import EventTicketsSidebar from '@/components/events/EventTicketsSidebar.vue';
  import Database from '@/utils/database.utils';
  import api from '@/utils/api.utils';
  import type { Event } from '@/interfaces/event.interface';
  import type { FileMetadata } from '@/interfaces/file.interface';
  import type { Association } from '@/interfaces/association.interface';

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();

  const event = ref<Event | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const loadEvent = async () => {
    try {
      loading.value = true;
      const associationId = route.params.associationId as string;
      const id = route.params.id as string;

      const eventData = await Database.getOne(`association/${associationId}/event`, id);

      if (eventData.association) {
        const files = await loadAssociationFiles(eventData.association.id);
        eventData.association = {
          ...eventData.association,
          logo: getFileUrl('logo', files, eventData.association.id),
          image: getFileUrl('banner', files, eventData.association.id),
          aboutImage: getFileUrl('about_image', files, eventData.association.id),
          images: files
            .filter((f) => f.purpose === 'gallery')
            .map((f) => `/files/Association/${eventData.association.id}?index=${f.index}`),
        };
      }

      event.value = eventData;
    } catch (err) {
      error.value = "Impossible de charger les détails de l'événement.";
      console.error('Error loading event:', err);
    } finally {
      loading.value = false;
    }
  };

  const getFileUrl = (
    purpose: string,
    files: FileMetadata[],
    associationId: string
  ): string | undefined => {
    const file = files.find((f) => f.purpose === purpose);
    const timestamp = Date.now() + Math.random();
    return file
      ? `/files/Association/${associationId}?index=${file.index}&t=${timestamp}`
      : undefined;
  };

  const loadAssociationFiles = async (associationId: string): Promise<FileMetadata[]> => {
    const files: FileMetadata[] = [];
    let index = 0;

    while (true) {
      try {
        const response = await api.get(`/files/Association/${associationId}/metadata`, {
          params: { index },
        });
        if (response.data) {
          files.push(response.data);
          index++;
        } else {
          break;
        }
      } catch (err: any) {
        if (err.response?.status === 404) break;
        console.error('Error loading file metadata:', err);
        break;
      }
    }

    return files;
  };

  const faireUnDon = () => {
    const association = event.value?.association as Association;
    if (!association) {
      toast.error("Informations de l'association manquantes");
      return;
    }
    router.push(`/association/${association.id}/donate`);
  };

  onMounted(() => {
    loadEvent();
  });

  onActivated(() => {
    loadEvent();
  });
</script>
