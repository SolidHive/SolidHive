<template>
  <div class="overflow-x-hidden">
    <AssociationHero
      v-if="fundraising && fundraising.association"
      :association="fundraising.association as Association"
      @don="faireUnDon"
    />
    <PageContainer>
      <h2 class="font-title text-secondary mb-4 text-2xl sm:text-3xl lg:text-4xl">Description</h2>
      <!-- Fundraising Details -->
      <div class="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
        <!-- Main Content -->
        <div class="space-y-6 sm:space-y-8 lg:col-span-2">
          <!-- Header with title, image and description -->
          <CagnotteHeader
            v-if="fundraising"
            :title="fundraising.title"
            :description="fundraising.description"
            :image="fundraising.image"
          />

          <!-- Separator -->
          <div class="border-t border-gray-200"></div>

          <!-- Organizer Info -->
          <CagnotteOrganizer
            v-if="fundraising && fundraising.association"
            :association="fundraising.association"
          />
        </div>

        <!-- Sidebar -->
        <div class="space-y-4 sm:space-y-6">
          <!-- Donation Sidebar -->
          <CagnotteDonationSidebar
            v-if="fundraising"
            :current-amount="fundraising.amount || 0"
            :target-amount="fundraising.wantedAmount"
            :donation-amount="donationAmount"
            :solid-hive-percentage="solidHivePercentage"
            :fundraising-id="fundraising.id"
            :association-id="fundraising.association?.id || ''"
            @update:donation-amount="donationAmount = $event"
            @update:solid-hive-percentage="solidHivePercentage = $event"
          />
        </div>
      </div>
    </PageContainer>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onActivated } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import AssociationHero from '@/components/associations/hero/AssociationHero.vue';
  import PageContainer from '@/components/PageContainer.vue';
  import CagnotteHeader from '@/components/cagnottes/CagnotteHeader.vue';
  import CagnotteOrganizer from '@/components/cagnottes/CagnotteOrganizer.vue';
  import CagnotteDonationSidebar from '@/components/cagnottes/CagnotteDonationSidebar.vue';
  import Database from '@/utils/database.utils';
  import api from '@/utils/api.utils';
  import { useToast } from 'vue-toastification';
  import type { Fundraising } from '@/interfaces/fundraising.interface';
  import type { FileMetadata } from '@/interfaces/file.interface';
  import type { Association } from '@/interfaces/association.interface';

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();

  const fundraising = ref<Fundraising | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  // Donation data
  const donationAmount = ref<number>(0);
  const solidHivePercentage = ref<number>(5);

  // Computed
  // (removed progressPercentage as it's now in CagnotteProgress component)

  // Methods
  const loadFundraising = async () => {
    try {
      loading.value = true;
      const associationId = route.params.associationId as string;
      const id = route.params.id as string;

      const fundraisingData = await Database.getOne(`association/${associationId}/fundraising`, id);

      // Charger les fichiers de l'association pour avoir son image
      if (fundraisingData.association) {
        const files = await loadAssociationFiles(fundraisingData.association.id);
        fundraisingData.association = {
          ...fundraisingData.association,
          logo: getFileUrl('logo', files, fundraisingData.association.id),
          image: getFileUrl('banner', files, fundraisingData.association.id),
          aboutImage: getFileUrl('about_image', files, fundraisingData.association.id),
          images: files
            .filter((f) => f.purpose === 'gallery')
            .map((f) => `/files/Association/${fundraisingData.association.id}?index=${f.index}`),
        };
      }

      fundraising.value = fundraisingData;
    } catch (err) {
      error.value = 'Impossible de charger les détails de la cagnotte.';
      console.error('Error loading fundraising:', err);
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
    const association = fundraising.value?.association as Association;
    if (!association) {
      toast.error("Informations de l'association manquantes");
      return;
    }
    router.push(`/association/${association.id}/donate`);
  };

  onMounted(() => {
    loadFundraising();
  });

  onActivated(() => {
    loadFundraising();
  });
</script>
