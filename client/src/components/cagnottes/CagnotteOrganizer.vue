<template>
  <div>
    <h2 class="font-title text-secondary mb-4 text-2xl sm:text-3xl lg:text-4xl">Organisateur</h2>
    <div class="mb-4 flex items-center space-x-3 sm:space-x-4">
      <div
        v-if="association.logo"
        class="h-10 w-10 shrink-0 overflow-hidden rounded-full sm:h-12 sm:w-12"
      >
        <img :src="association.logo" :alt="association.name" class="h-full w-full object-cover" />
      </div>
      <div class="min-w-0 flex-1">
        <h4 class="truncate text-base font-medium sm:text-lg">{{ association.name }}</h4>
      </div>
    </div>
    <div>
      <button
        @click="goToAssociation"
        class="text-secondary hover:text-secondary/80 font-paragraph underline transition-colors"
      >
        Voir l'association
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const props = defineProps<{
    association: {
      id: string;
      name: string;
      logo?: string;
      status?: string;
    };
  }>();

  const goToAssociation = () => {
    router.push(`/association/${props.association.id}`);
  };
</script>
