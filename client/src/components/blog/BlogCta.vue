<template>
  <section
    class="from-primary/10 to-accent/10 rounded-2xl bg-gradient-to-br p-8 text-center sm:p-12"
  >
    <h2 class="font-title text-secondary mb-4 text-2xl sm:text-3xl">
      Rejoignez la communauté SolidHive
    </h2>
    <p class="font-paragraph mx-auto mb-6 max-w-2xl text-sm lg:text-base">
      Découvrez nos associations partenaires et participez à des projets qui font la différence.
    </p>
    <div class="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
      <Button
        variant="default"
        size="lg"
        class="bg-primary hover:bg-primary/90"
        @click="$emit('navigate-associations')"
      >
        Découvrir les associations
      </Button>
      <Button
        variant="outline"
        size="lg"
        class="border-accent text-accent hover:bg-accent hover:text-white"
        @click="$emit('navigate-events')"
      >
        Voir les événements
      </Button>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { Button } from '@/components/ui/button';

  defineEmits<{
    'navigate-associations': [];
    'navigate-events': [];
  }>();
</script>
