<template>
  <div class="overflow-x-hidden">
    <AssociationHero v-if="association" :association="association" @don="faireUnDon" />
    <PageContainer>
      <AssociationMenu :current-tab="currentTab" @change-tab="onTabChange" />
      <div v-if="currentTab === 'accueil'" class="mt-8">
        <AnnouncementsSlider :items="annonces" :color="association?.color" />
        <div class="mt-8">
          <CampaignsSlider :items="campaigns" :color="association?.color" />
        </div>
        <div class="mt-8">
          <EventsSlider :items="eventsList" :color="association?.color" />
        </div>
        <div class="mt-8">
          <AboutUs :aboutText="association?.aboutText" :aboutImage="association?.aboutImage" />
        </div>
        <div class="mt-8">
          <ImageGallery :images="association?.images" />
        </div>
      </div>
      <div v-if="currentTab === 'annonces'" class="mt-8">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnnouncementCard
            v-for="(annonce, index) in paginatedAnnonces"
            :key="`annonce-${annoncesPage}-${index}`"
            :item="annonce"
            :color="association?.color"
          />
        </div>
        <Pagination
          :total-items="annonces.length"
          :items-per-page="itemsPerPage"
          :current-page="annoncesPage"
          @update:current-page="annoncesPage = $event"
        />
      </div>
      <div v-if="currentTab === 'campagnes'" class="mt-8">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <CampaignCard
            v-for="(campaign, index) in paginatedCampaigns"
            :key="`campaign-${campaignsPage}-${index}`"
            :item="campaign"
            :color="association?.color"
          />
        </div>
        <Pagination
          :total-items="campaigns.length"
          :items-per-page="itemsPerPage"
          :current-page="campaignsPage"
          @update:current-page="campaignsPage = $event"
        />
      </div>
      <div v-if="currentTab === 'evenements'" class="mt-8">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <EventCard
            v-for="(event, index) in paginatedEvents"
            :key="`event-${eventsPage}-${index}`"
            :item="event"
            :color="association?.color"
          />
        </div>
        <Pagination
          :total-items="eventsList.length"
          :items-per-page="itemsPerPage"
          :current-page="eventsPage"
          @update:current-page="eventsPage = $event"
        />
      </div>
    </PageContainer>
    <div class="mt-8">
      <ContactSection @change-tab="onTabChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import AssociationHero from '@/components/associations/hero/AssociationHero.vue';
  import AssociationMenu from '@/components/associations/menu/AssociationMenu.vue';
  import AnnouncementsSlider from '@/components/associations/sliders/AnnouncementsSlider.vue';
  import CampaignsSlider from '@/components/associations/sliders/CampaignsSlider.vue';
  import EventsSlider from '@/components/associations/sliders/EventsSlider.vue';
  import ImageGallery from '@/components/associations/sliders/ImageGallery.vue';
  import AboutUs from '@/components/associations/home/AboutUs.vue';
  import AnnouncementCard from '@/components/associations/AnnouncementCard.vue';
  import CampaignCard from '@/components/associations/CampaignCard.vue';
  import EventCard from '@/components/associations/EventCard.vue';
  import Pagination from '@/components/ui/Pagination.vue';
  import ContactSection from '@/components/associations/ContactSection.vue';
  import PageContainer from '@/components/PageContainer.vue';

  interface Association {
    id: string;
    name: string;
    description: string;
    category: string;
    location: string;
    address?: string;
    email?: string;
    phone?: string;
    website?: string;
    image?: string;
    logo?: string;
    color?: string;
    aboutText?: string;
    aboutImage?: string;
    images?: string[];
  }

  const route = useRoute();
  const association = ref<Association | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const currentTab = ref('accueil');

  // Pagination
  const annoncesPage = ref(1);
  const campaignsPage = ref(1);
  const eventsPage = ref(1);
  const itemsPerPage = 10;

  const annonces = [
    {
      title: 'Collecte alimentaire',
      description: 'Aidez-nous à distribuer des paniers aux familles.',
      image:
        'https://cdn.streamlabscharity.com/causes/headers/282887215531560960/ZFngyrXei2ALf63Z0PEeX6AROSjcCdBJLkRKE1pk.jpg',
    },
    {
      title: 'Atelier créatif',
      description: 'Atelier pour enfants tous les samedis.',
      image:
        'https://cdn.streamlabscharity.com/causes/headers/282887215531560960/ZFngyrXei2ALf63Z0PEeX6AROSjcCdBJLkRKE1pk.jpg',
    },
    {
      title: 'Collecte de vêtements',
      description: 'Donnez des vêtements en bon état.',
      image:
        'https://cdn.streamlabscharity.com/causes/headers/282887215531560960/ZFngyrXei2ALf63Z0PEeX6AROSjcCdBJLkRKE1pk.jpg',
    },
    {
      title: 'Bénévolat local',
      description: 'Rejoignez notre équipe de bénévoles pour des actions de proximité.',
      image:
        'https://cdn.streamlabscharity.com/causes/headers/282887215531560960/ZFngyrXei2ALf63Z0PEeX6AROSjcCdBJLkRKE1pk.jpg',
    },
    {
      title: 'Collecte de fonds',
      description: 'Soutenez notre projet éducatif pour les enfants.',
      image:
        'https://cdn.streamlabscharity.com/causes/headers/282887215531560960/ZFngyrXei2ALf63Z0PEeX6AROSjcCdBJLkRKE1pk.jpg',
    },
    {
      title: 'Journée portes ouvertes',
      description: 'Venez découvrir nos locaux et rencontrer l’équipe.',
      image:
        'https://cdn.streamlabscharity.com/causes/headers/282887215531560960/ZFngyrXei2ALf63Z0PEeX6AROSjcCdBJLkRKE1pk.jpg',
    },
    {
      title: 'Conférence thématique',
      description: 'Conférence gratuite sur les enjeux environnementaux.',
      image:
        'https://cdn.streamlabscharity.com/causes/headers/282887215531560960/ZFngyrXei2ALf63Z0PEeX6AROSjcCdBJLkRKE1pk.jpg',
    },
  ];

  const campaigns = [
    {
      title: 'Campagne de sensibilisation',
      description: 'Sensibilisation aux écogestes.',
      image:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60',
    },
    {
      title: 'Collecte annuelle',
      description: 'Aidez-nous à collecter des fonds pour nos actions.',
      image:
        'https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=1200&q=60',
    },
    {
      title: 'Action éducative',
      description: 'Programme scolaire pour les enfants.',
      image:
        'https://images.unsplash.com/photo-1525373693034-9a8119bd5d6f?auto=format&fit=crop&w=1200&q=60',
    },
  ];

  const eventsList = [
    {
      title: 'Journée portes ouvertes',
      description: 'Rencontrez notre équipe.',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=60',
    },
    {
      title: 'Conférence',
      description: 'Conférence sur les enjeux locaux.',
      image:
        'https://images.unsplash.com/photo-1508830524289-0adcbe822b40?auto=format&fit=crop&w=1200&q=60',
    },
    {
      title: 'Atelier',
      description: 'Atelier participatif pour les familles.',
      image:
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=60',
    },
  ];

  // Pagination computed
  const paginatedAnnonces = computed(() => {
    const start = (annoncesPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return annonces.slice(start, end);
  });

  const paginatedCampaigns = computed(() => {
    const start = (campaignsPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return campaigns.slice(start, end);
  });

  const paginatedEvents = computed(() => {
    const start = (eventsPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return eventsList.slice(start, end);
  });

  const loadAssociation = async () => {
    try {
      loading.value = true;
      error.value = null;

      const id = route.params.id as string;

      // TODO: Replace with actual API call
      // const response = await api.get(`/associations/${id}`);
      // association.value = response.data;

      // Mock data for now
      const mockAssociations: Association[] = [
        {
          id: '1',
          name: 'Human appeal france',
          description:
            "Human Appeal est une organisation à but non lucratif qui travaille dans le monde entier pour renforcer la lutte de l'humanité contre la pauvreté, l'injustice sociale et les catastrophes naturelles.",
          aboutText: `Human Appeal est une organisation à but non lucratif qui travaille dans
le monde entier pour renforcer la lutte de l'humanité contre la pauvreté,
l'injustice sociale et les catastrophes naturelles. En fournissant une aide immédiate et en mettant en place des programmes de développement autonomes, nous visons à investir dans des solutions réelles et efficaces.

Nous travaillons toute l'année pour mettre en place des programmes de soins de santé, d'éducation et de subsistance qui ouvrent la voie à des communautés autonomes et autosuffisantes. Nous fournissons également de la nourriture, une aide médicale et une assistance en cas de catastrophe lors des situations d'urgence, une intervention essentielle qui permet de sauver des vies.

Nos équipes locales qualifiées sont capables d'accéder à certains des endroits les plus difficiles à atteindre dans le monde, lors des moments les plus critiques.`,
          category: 'Éducation',
          location: 'Paris',
          address: '123 Rue des Étudiants, 75001 Paris',
          email: 'contact@asso-etudiants.fr',
          phone: '+33 1 23 45 67 89',
          website: 'https://asso-etudiants.fr',
          image:
            'https://global.unitednations.entermediadb.net/assets/mediadb/services/module/asset/downloads/preset/Collections/Embargoed/06-02-2025-WHO-Gaza-14.jpg/image1170x530cropped.jpg',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Human_appeal_logo18.png',
          aboutImage:
            'https://images.unsplash.com/photo-1503945438517-f65904a52ce6?auto=format&fit=crop&w=1200&q=60',
          color: '#8574B3',
          images: [
            'https://resize.elle.fr/article/var/plain_site/storage/images/societe/news/urgence-humanitaire-a-gaza-ou-faire-un-don-4236887/102249402-1-fre-FR/Urgence-humanitaire-a-Gaza-ou-faire-un-don.jpg',
            'https://media.licdn.com/dms/image/v2/C4E22AQG3vNTL5MEoDg/feedshare-shrink_800/feedshare-shrink_800/0/1648629361569?e=2147483647&v=beta&t=2A37goUWpwLmM5bjtO1jFXxDePciR8gvUuEUlMQRThA',
            'https://www.al-kanz.org/wp-content/uploads/Gaza-distribution-de-colis-alimentaire-Humn-Appeal-jpg.webp',
            'https://www.al-kanz.org/wp-content/uploads/Gaza-Human-Appeal-2024.jpg',
            'https://cdn.helloasso.com/img/photos/collectes/croppedimage-8ce56763ae6b472898ebad3e71aa206c.png',
            'https://care.ca/wp-content/uploads/2025/08/RS123144_1H4A0283-1_scr.jpg',
            'https://www.vaticannews.va/content/dam/vaticannews/agenzie/images/reuters/2023/10/21/10/1697878426456.JPG/_jcr_content/renditions/cq5dam.thumbnail.cropped.750.422.jpeg',
          ],
        },
        {
          id: '2',
          name: 'Solidarité Locale',
          description:
            'Aide aux personnes en difficulté dans la communauté locale. Nous distribuons des repas, des vêtements et proposons un accompagnement social.',
          aboutText:
            'Solidarité Locale agit au quotidien pour soutenir les familles et les personnes vulnérables grâce à des distributions, des ateliers et un accompagnement social adapté aux besoins locaux.',
          category: 'Social',
          location: 'Lyon',
          address: '456 Avenue de la Solidarité, 69000 Lyon',
          email: 'info@solidarite-locale.org',
          phone: '+33 4 56 78 90 12',
          website: 'https://solidarite-locale.org',
          image:
            'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=900&q=80',
          logo: 'https://randomuser.me/api/portraits/women/44.jpg',
          aboutImage:
            'https://images.unsplash.com/photo-1520975915763-1f2a0b1f343e?auto=format&fit=crop&w=1200&q=60',
          color: '#F87171', // rouge
          images: [
            'https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=1200&q=60',
            'https://images.unsplash.com/photo-1525373693034-9a8119bd5d6f?auto=format&fit=crop&w=1200&q=60',
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60',
          ],
        },
        {
          id: '3',
          name: 'Environnement & Nature',
          description:
            "Protection de l'environnement et sensibilisation aux enjeux écologiques. Nous organisons des nettoyages de plages, des plantations d'arbres et des campagnes de sensibilisation.",
          aboutText:
            'Environnement & Nature œuvre pour la préservation des espaces naturels en organisant des actions de terrain, des programmes éducatifs et des campagnes de sensibilisation ouvertes à tous.',
          category: 'Environnement',
          location: 'Marseille',
          address: '789 Boulevard Écologique, 13000 Marseille',
          email: 'contact@environnement-nature.fr',
          phone: '+33 4 91 23 45 67',
          website: 'https://environnement-nature.fr',
          image:
            'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=900&q=80',
          logo: 'https://randomuser.me/api/portraits/men/65.jpg',
          aboutImage:
            'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1200&q=60',
          color: '#34D399', // vert
          images: [
            'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1200&q=60',
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=60',
            'https://images.unsplash.com/photo-1508830524289-0adcbe822b40?auto=format&fit=crop&w=1200&q=60',
          ],
        },
      ];

      const found = mockAssociations.find((a) => a.id === id);
      if (found) {
        association.value = found;
      } else {
        throw new Error('Association non trouvée');
      }
    } catch (err) {
      error.value = "Impossible de charger les détails de l'association. Veuillez réessayer.";
      console.error('Error loading association:', err);
    } finally {
      loading.value = false;
    }
  };

  const faireUnDon = () => {
    // TODO: Rediriger vers la page de don ou ouvrir un modal
    alert('Redirection vers la page de don à implémenter');
  };

  const onTabChange = (tab: string) => {
    currentTab.value = tab;
    // Reset pagination when changing tabs
    if (tab === 'annonces') {
      annoncesPage.value = 1;
    } else if (tab === 'campagnes') {
      campaignsPage.value = 1;
    } else if (tab === 'evenements') {
      eventsPage.value = 1;
    }
    // optional debug log
    console.log('Tab changed to:', tab);
  };

  onMounted(() => {
    loadAssociation();
  });
</script>
