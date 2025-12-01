<template>
  <div class="overflow-x-hidden">
    <AssociationHero v-if="association" :association="association" @don="faireUnDon" />
    <PageContainer>
      <AssociationMenu :current-tab="currentTab" @change-tab="onTabChange" />
      <div v-if="currentTab === 'accueil'" class="mt-8">
        <div v-if="loadingAnnonces">
          <LoadingOverlay message="Chargement des annonces..." />
        </div>
        <AnnouncementsSlider v-else :items="annonces" :color="association?.primaryColor" />

        <div class="mt-8">
          <div v-if="loadingCagnottes">
            <LoadingOverlay message="Chargement des cagnottes..." />
          </div>
          <CagnottesSlider
            v-else
            :items="cagnottes"
            :color="association?.primaryColor"
            @view-details="viewCagnotteDetails"
          />
        </div>

        <div class="mt-8">
          <div v-if="loadingEvents">
            <LoadingOverlay message="Chargement des événements..." />
          </div>
          <EventsSlider
            v-else
            :items="eventsList"
            :color="association?.primaryColor"
            @view-details="viewEventDetails"
          />
        </div>
        <div v-if="association?.aboutText" class="mt-8">
          <AboutUs :about-text="association?.aboutText" :about-image="association?.aboutImage" />
        </div>
        <div class="mt-8">
          <ImageGallery :images="association?.images" />
        </div>
      </div>
      <div v-if="currentTab === 'annonces'" class="mt-8">
        <div v-if="loadingAnnonces">
          <LoadingOverlay message="Chargement des annonces..." />
        </div>
        <div
          v-else-if="annonces.length === 0"
          class="bg-muted/30 border-border rounded-xl border border-dashed p-12 text-center"
        >
          <p class="font-paragraph text-muted-foreground text-lg">
            Aucune annonce n'a été publiée pour le moment.
          </p>
        </div>
        <div v-else>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnnouncementCard
              v-for="(annonce, index) in paginatedAnnonces"
              :key="`annonce-${annoncesPage}-${index}`"
              :item="annonce"
              :color="association?.primaryColor"
            />
          </div>
          <Pagination
            :total-items="annonces.length"
            :items-per-page="itemsPerPage"
            :current-page="annoncesPage"
            @update:current-page="annoncesPage = $event"
          />
        </div>
      </div>
      <div v-if="currentTab === 'cagnottes'" class="mt-8">
        <div v-if="loadingCagnottes">
          <LoadingOverlay message="Chargement des cagnottes..." />
        </div>
        <div
          v-else-if="cagnottes.length === 0"
          class="bg-muted/30 border-border rounded-xl border border-dashed p-12 text-center"
        >
          <p class="font-paragraph text-muted-foreground text-lg">
            Aucune cagnotte de financement n'est active pour le moment.
          </p>
        </div>
        <div v-else>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <CagnotteCard
              v-for="(cagnotte, index) in paginatedCagnottes"
              :key="`cagnotte-${cagnottesPage}-${index}`"
              :item="cagnotte"
              :color="association?.primaryColor"
              @view-details="viewCagnotteDetails"
            />
          </div>
          <Pagination
            :total-items="cagnottes.length"
            :items-per-page="itemsPerPage"
            :current-page="cagnottesPage"
            @update:current-page="cagnottesPage = $event"
          />
        </div>
      </div>
      <div v-if="currentTab === 'evenements'" class="mt-8">
        <div v-if="loadingEvents">
          <LoadingOverlay message="Chargement des événements..." />
        </div>
        <div
          v-else-if="eventsList.length === 0"
          class="bg-muted/30 border-border rounded-xl border border-dashed p-12 text-center"
        >
          <p class="font-paragraph text-muted-foreground text-lg">
            Aucun événement n'est prévu pour le moment.
          </p>
        </div>
        <div v-else>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <EventCard
              v-for="(event, index) in paginatedEvents"
              :key="`event-${eventsPage}-${index}`"
              :item="event"
              :color="association?.primaryColor"
              @view-details="viewEventDetails"
            />
          </div>
          <Pagination
            :total-items="eventsList.length"
            :items-per-page="itemsPerPage"
            :current-page="eventsPage"
            @update:current-page="eventsPage = $event"
          />
        </div>
      </div>
    </PageContainer>
    <div class="mt-8">
      <ContactSection @change-tab="onTabChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import AssociationHero from '@/components/associations/hero/AssociationHero.vue';
  import AssociationMenu from '@/components/associations/menu/AssociationMenu.vue';
  import AnnouncementsSlider from '@/components/associations/sliders/AnnouncementsSlider.vue';
  import CagnottesSlider from '@/components/associations/sliders/CagnottesSlider.vue';
  import EventsSlider from '@/components/associations/sliders/EventsSlider.vue';
  import ImageGallery from '@/components/associations/sliders/ImageGallery.vue';
  import AboutUs from '@/components/associations/home/AboutUs.vue';
  import AnnouncementCard from '@/components/associations/AnnouncementCard.vue';
  import CagnotteCard from '@/components/associations/CagnotteCard.vue';
  import EventCard from '@/components/associations/EventCard.vue';
  import Pagination from '@/components/ui/Pagination.vue';
  import ContactSection from '@/components/associations/ContactSection.vue';
  import PageContainer from '@/components/PageContainer.vue';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import Database from '@/utils/database.utils';
  import api from '@/utils/api.utils';
  import type { Association } from '@/interfaces/association.interface';
  import type { Announcement } from '@/interfaces/announcement.interface';
  import type { Event } from '@/interfaces/event.interface';
  import type { Fundraising } from '@/interfaces/fundraising.interface';
  import type { FileMetadata } from '@/interfaces/file.interface';

  const route = useRoute();
  const router = useRouter();
  const association = ref<Association | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const currentTab = ref('accueil');

  // États de chargement
  const loadingAnnonces = ref(true);
  const loadingCagnottes = ref(true);
  const loadingEvents = ref(true);

  // Pagination
  const annoncesPage = ref(1);
  const cagnottesPage = ref(1);
  const eventsPage = ref(1);
  const itemsPerPage = 10;

  // Données
  const annonces = ref<Announcement[]>([]);
  const cagnottes = ref<Fundraising[]>([]);
  const eventsList = ref<Event[]>([]);

  // Pagination computed
  const paginatedAnnonces = computed(() => {
    const start = (annoncesPage.value - 1) * itemsPerPage;
    return annonces.value.slice(start, start + itemsPerPage);
  });

  const paginatedCagnottes = computed(() => {
    const start = (cagnottesPage.value - 1) * itemsPerPage;
    return cagnottes.value.slice(start, start + itemsPerPage);
  });

  const paginatedEvents = computed(() => {
    const start = (eventsPage.value - 1) * itemsPerPage;
    return eventsList.value.slice(start, start + itemsPerPage);
  });

  const loadAssociation = async () => {
    try {
      loading.value = true;
      const id = route.params.id as string;

      // Récupérer l'association et ses fichiers
      const associationData = await Database.getOne('association', id);
      const files = await loadAssociationFiles(id);

      // Construire l'objet association avec les URLs des images
      association.value = {
        ...associationData,
        logo: getFileUrl('logo', files, id),
        image: getFileUrl('banner', files, id),
        aboutImage: getFileUrl('about_image', files, id),
        images: files
          .filter((f) => f.purpose === 'gallery')
          .map((f) => `/files/Association/${id}?index=${f.index}`),
      };

      // Charger les données en parallèle
      await Promise.all([
        loadAssociationAnnouncements(id),
        loadAssociationFundraisings(id),
        loadAssociationEvents(id),
      ]);
    } catch (err) {
      error.value = "Impossible de charger les détails de l'association.";
      console.error('Error loading association:', err);
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
    console.log(file);
    return file ? `/files/Association/${associationId}?index=${file.index}` : undefined;
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

  const loadAssociationAnnouncements = async (associationId: string) => {
    try {
      loadingAnnonces.value = true;
      const response = await api.get(`/association/${associationId}/announcements`);
      annonces.value = response.data || [];
    } catch (err) {
      console.error('Error loading announcements:', err);
      annonces.value = [];
    } finally {
      loadingAnnonces.value = false;
    }
  };

  const loadAssociationFundraisings = async (associationId: string) => {
    try {
      loadingCagnottes.value = true;
      const response = await api.get(`/association/${associationId}/fundraisings`);
      cagnottes.value = response.data || [];
    } catch (err) {
      console.error('Error loading fundraisings:', err);
      cagnottes.value = [];
    } finally {
      loadingCagnottes.value = false;
    }
  };

  const loadAssociationEvents = async (associationId: string) => {
    try {
      loadingEvents.value = true;
      const response = await api.get(`/association/${associationId}/events`);
      eventsList.value = response.data || [];
    } catch (err) {
      console.error('Error loading events:', err);
      eventsList.value = [];
    } finally {
      loadingEvents.value = false;
    }
  };

  const faireUnDon = () => {
    router.push(`/association/${route.params.id}/donate`);
  };

  const viewCagnotteDetails = (fundraising: Fundraising) => {
    router.push(`/association/${route.params.id}/fundraising/${fundraising.id}`);
  };

  const viewEventDetails = (event: Event) => {
    router.push(`/association/${route.params.id}/event/${event.id}`);
  };

  const onTabChange = (tab: string) => {
    currentTab.value = tab;
    // Reset pagination
    if (tab === 'annonces') annoncesPage.value = 1;
    else if (tab === 'cagnottes') cagnottesPage.value = 1;
    else if (tab === 'evenements') eventsPage.value = 1;
  };

  onMounted(() => {
    loadAssociation();
  });
</script>
