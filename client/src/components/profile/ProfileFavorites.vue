<template>
  <div class="bg-card border-border rounded-3xl border p-4 shadow-sm sm:p-6">
    <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="font-subtitle text-foreground text-lg">Mes Associations Favorites</h2>
      <Button variant="outline" size="sm" as-child>
        <router-link to="/associations">
          <Heart class="mr-1.5 h-4 w-4" />
          Explorer
        </router-link>
      </Button>
    </div>

    <LoadingOverlay v-if="isLoading" :show="true" message="Chargement de vos favoris..." />

    <div v-else-if="favoriteAssociations && favoriteAssociations.length > 0" class="space-y-3">
      <div
        v-for="association in favoriteAssociations || []"
        :key="association.id"
        class="group border-border relative rounded-2xl border bg-white p-3 shadow-sm transition-all hover:shadow-md"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
            <Heart class="h-4 w-4 fill-red-500 text-red-500" />
          </div>

          <div class="min-w-0 flex-1">
            <h3 class="font-subtitle text-foreground truncate text-sm font-semibold">
              {{ association.name }}
            </h3>
            <p
              v-if="association.description"
              class="font-paragraph text-muted-foreground line-clamp-1 text-xs"
            >
              {{ association.description }}
            </p>
          </div>

          <div class="flex items-center gap-1">
            <Button variant="ghost" size="sm" as-child class="h-7 w-7 p-0">
              <router-link :to="`/association/${association.id}`">
                <Eye class="h-3.5 w-3.5" />
              </router-link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              :disabled="removingFavorites.has(association.id)"
              class="text-muted-foreground h-7 w-7 p-0 hover:bg-red-500 hover:text-white"
              @click="removeFromFavorites(association.id)"
            >
              <X v-if="!removingFavorites.has(association.id)" class="h-3.5 w-3.5" />
              <Loader2 v-else class="h-3.5 w-3.5 animate-spin" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="rounded-2xl bg-white py-6 text-center">
      <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Heart class="h-6 w-6 text-gray-400" :stroke-width="1.5" />
      </div>
      <p class="font-paragraph text-muted-foreground mb-1 text-sm font-medium">
        Aucune association favorite
      </p>
      <p class="font-paragraph text-muted-foreground text-xs">
        Ajoutez des associations à vos favoris
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Button } from '@/components/ui/button';
  import { Heart, X, Loader2, Eye } from 'lucide-vue-next';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import Database from '@/utils/database.utils';
  import { Categories } from '@/enums/categories';
  import type { Association } from '@/interfaces';

  interface Props {
    favoriteAssociations?: Association[];
    isLoading: boolean;
  }

  defineProps<Props>();

  const removingFavorites = ref<Set<string>>(new Set());

  const emit = defineEmits<{
    removeFavorite: [associationId: string];
  }>();

  const removeFromFavorites = async (associationId: string) => {
    if (removingFavorites.value.has(associationId)) return;

    removingFavorites.value.add(associationId);
    try {
      await Database.delete(`favorites/${Categories.ASSOCIATION}/${associationId}`);
      emit('removeFavorite', associationId);
    } catch (error) {
      console.error('Erreur lors de la suppression du favori:', error);
    } finally {
      removingFavorites.value.delete(associationId);
    }
  };
</script>
