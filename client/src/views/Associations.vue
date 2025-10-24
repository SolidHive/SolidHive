<template>
  <PageContainer>
    <div>
      <div class="mb-8 text-center">
        <h1 class="mb-4 text-4xl font-bold text-gray-900">Associations</h1>
        <p class="text-lg text-gray-600">Découvrez les associations partenaires de SolidHive</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="loader" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="py-12 text-center">
        <div class="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
          <h3 class="mb-2 font-semibold text-red-800">Erreur de chargement</h3>
          <p class="text-red-600">{{ error }}</p>
          <Button class="mt-4" variant="secondary" @click="loadAssociations">Réessayer</Button>
        </div>
      </div>

      <!-- Associations Grid -->
      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="association in associations"
          :key="association.id"
          class="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
        >
          <div class="p-6">
            <div class="mb-4 flex items-center">
              <div class="bg-primary mr-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Building class="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">{{ association.name }}</h3>
                <p v-if="association.contact" class="text-sm text-gray-500">
                  {{ association.contact }}
                </p>
              </div>
            </div>

            <p class="mb-4 line-clamp-3 text-gray-600">
              {{ association.description || 'Aucune description disponible.' }}
            </p>

            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-500">Statut: {{ association.status }}</div>
              <Button size="sm" @click="viewAssociation(association.id)">Voir plus</Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && !error && associations.length === 0" class="py-12 text-center">
        <Building class="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <h3 class="mb-2 text-xl font-semibold text-gray-900">Aucune association trouvée</h3>
        <p class="text-gray-600">Les associations seront bientôt disponibles.</p>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  import PageContainer from '@/components/PageContainer.vue';
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { Button } from '@/components/ui/button';
  import { Building } from 'lucide-vue-next';
  import Database from '@/utils/database.utils';

  interface Association {
    id: string;
    name: string;
    description?: string;
    contact?: string;
    primaryColor?: string;
    secondaryColor?: string;
    status: string;
  }

  const router = useRouter();
  const associations = ref<Association[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const loadAssociations = async () => {
    try {
      loading.value = true;
      error.value = null;

      const response = await Database.getAll('associations');
      associations.value = response;
    } catch (err) {
      error.value = 'Impossible de charger les associations. Veuillez réessayer.';
      console.error('Error loading associations:', err);
    } finally {
      loading.value = false;
    }
  };

  const viewAssociation = (id: string) => {
    router.push(`/association/${id}`);
  };

  onMounted(() => {
    loadAssociations();
  });
</script>

<style scoped>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 3;
  }
</style>
