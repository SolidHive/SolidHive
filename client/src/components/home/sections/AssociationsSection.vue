<template>
  <section class="py-16">
    <!-- Section Header -->
    <header class="mb-12 text-center">
      <h2 class="font-title text-secondary mb-8 text-2xl sm:text-3xl lg:text-4xl">
        L'association qu'il te faut
      </h2>
      <p class="text-md font-paragraph lg:text-lg">Pars à la rencontre de ton association idéale</p>
    </header>

    <!-- Associations Grid -->
    <div class="mb-12">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      >
        <div
          v-for="n in 10"
          :key="n"
          class="flex aspect-4/3 animate-pulse items-center justify-center rounded-xl bg-gray-200 shadow-md sm:aspect-4/2 md:aspect-5/3 2xl:aspect-4/3"
        >
          <div
            class="h-16 w-16 rounded-full bg-gray-300 sm:h-20 sm:w-20 lg:h-24 lg:w-24 2xl:h-28 2xl:w-28"
          />
        </div>
      </div>

      <!-- Associations Grid -->
      <div
        v-else-if="associations.length > 0"
        class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      >
        <article
          v-for="association in associations"
          :key="association.id"
          class="group flex aspect-4/3 cursor-pointer items-center justify-center rounded-xl bg-white shadow-md transition-all duration-200 hover:shadow-lg sm:aspect-4/2 md:aspect-5/3 2xl:aspect-4/3"
          @click="navigateToAssociations"
        >
          <img
            v-if="association.logo"
            :src="association.logo"
            :alt="`Logo de ${association.name}`"
            class="h-16 w-16 object-contain transition-transform duration-200 group-hover:scale-105 sm:h-20 sm:w-20 lg:h-24 lg:w-24 2xl:h-28 2xl:w-28"
          />
          <div
            v-else
            class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 sm:h-20 sm:w-20 lg:h-24 lg:w-24 2xl:h-28 2xl:w-28"
          >
            <span class="text-xs font-medium">{{ association.name.charAt(0).toUpperCase() }}</span>
          </div>
        </article>
      </div>

      <!-- Empty State -->
      <div v-else class="py-12 text-center">
        <p class="text-gray-500">Aucune association disponible pour le moment.</p>
      </div>
    </div>

    <!-- Call to Action -->
    <div class="text-center">
      <Button variant="default" size="lg" class="px-8" @click="navigateToAssociations">
        Voir toutes les associations
      </Button>
    </div>
  </section>
</template>

<script setup lang="ts">
  // Vue imports
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  // Component imports
  import { Button } from '@/components/ui/button';

  // Utility imports
  import Database from '@/utils/database.utils';
  import api from '@/utils/api.utils';

  // Type imports
  import type { FileMetadata } from '@/interfaces/file.interface';
  import type { Association } from '@/interfaces/association.interface';

  // Constants
  const MAX_ASSOCIATIONS = 10;

  // Router
  const router = useRouter();

  // Reactive state
  const associations = ref<Association[]>([]);
  const isLoading = ref(true);
  const error = ref<string | null>(null);

  // Methods
  /**
   * Loads the latest associations from the API
   */
  const loadLatestAssociations = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      // Get latest associations (API will handle ordering)
      const response = await Database.getAll('associations', {
        take: MAX_ASSOCIATIONS,
      });

      const associationsData = response.data || [];

      // Load logos for each association
      associations.value = await Promise.all(
        associationsData.map(async (association: Association) => {
          const files = await loadAssociationFiles(association.id);
          return {
            ...association,
            logo: getFileUrl('logo', files, association.id),
          };
        })
      );
    } catch (err) {
      error.value = 'Impossible de charger les associations.';
      console.error('Error loading associations:', err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Loads all files for a specific association
   */
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

  /**
   * Gets the file URL for a specific purpose
   */
  const getFileUrl = (
    purpose: string,
    files: FileMetadata[],
    associationId: string
  ): string | undefined => {
    const file = files.find((f) => f.purpose === purpose);
    return file ? `/files/Association/${associationId}?index=${file.index}` : undefined;
  };

  /**
   * Navigates to the associations page
   */
  const navigateToAssociations = () => {
    router.push('/associations');
  };

  // Lifecycle
  onMounted(() => {
    loadLatestAssociations();
  });
</script>
