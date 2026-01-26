<template>
  <div class="overflow-x-hidden">
    <AssociationHero
      v-if="announcement && announcement.association"
      :association="announcement.association as Association"
      @don="faireUnDon"
    />
    <PageContainer>
      <h2 class="font-title text-secondary mb-4 text-2xl sm:text-3xl lg:text-4xl">Annonce</h2>
      <div class="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
        <div class="space-y-6 sm:space-y-8 lg:col-span-2">
          <AnnouncementHeader
            v-if="announcement"
            :title="announcement.title"
            :content="announcement.content || ''"
            :image="announcement.image"
          />

          <div class="border-t border-gray-200"></div>

          <AnnouncementAssociation
            v-if="announcement && announcement.association"
            :association="announcement.association"
          />
        </div>

        <div class="space-y-4 sm:space-y-6">
          <AnnouncementInfoSidebar
            v-if="announcement && announcement.timestamps"
            :created-at="announcement.timestamps.createdAt"
            :updated-at="announcement.timestamps.updatedAt"
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
  import AnnouncementHeader from '@/components/announcements/AnnouncementHeader.vue';
  import AnnouncementAssociation from '@/components/announcements/AnnouncementAssociation.vue';
  import AnnouncementInfoSidebar from '@/components/announcements/AnnouncementInfoSidebar.vue';
  import Database from '@/utils/database.utils';
  import { useToast } from 'vue-toastification';
  import type { FileMetadata } from '@/interfaces/file.interface';
  import type { Association } from '@/interfaces/association.interface';
  import type { Announcement } from '@/interfaces/announcement.interface';

  interface AnnouncementWithAssociation extends Announcement {
    association?: Association;
  }

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();

  const announcement = ref<AnnouncementWithAssociation | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  // Methods
  const loadAnnouncement = async () => {
    try {
      loading.value = true;
      const associationId = route.params.associationId as string;
      const id = route.params.id as string;

      const announcementData = await Database.getOne(
        `association/${associationId}/announcement`,
        id
      );

      // Vérifier si l'annonce est active
      if (!announcementData.isActive) {
        router.push(`/association/${associationId}`);
        return;
      }

      // Charger les fichiers de l'association pour avoir son image
      if (announcementData.association) {
        const files = await loadAssociationFiles(announcementData.association.id);
        announcementData.association = {
          ...announcementData.association,
          logo: getFileUrl('logo', files, announcementData.association.id),
          image: getFileUrl('banner', files, announcementData.association.id),
          aboutImage: getFileUrl('about_image', files, announcementData.association.id),
          images: files
            .filter((f) => f.purpose === 'gallery')
            .map((f) => `/files/Association/${announcementData.association.id}?index=${f.index}`),
        };
      }

      announcement.value = announcementData;
    } catch (err) {
      error.value = "Impossible de charger les détails de l'annonce.";
      console.error('Error loading announcement:', err);
      toast.error(error.value);
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
        const response = await Database.getOne(`files/Association/${associationId}/metadata`, '', {
          index,
        });
        if (response) {
          files.push(response);
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
    const association = announcement.value?.association as Association;
    if (!association) {
      toast.error("Informations de l'association manquantes");
      return;
    }
    router.push(`/association/${association.id}/donate`);
  };

  onMounted(() => {
    loadAnnouncement();
  });

  onActivated(() => {
    loadAnnouncement();
  });
</script>
