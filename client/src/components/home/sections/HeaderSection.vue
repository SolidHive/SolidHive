<template>
  <section class="grid items-center lg:grid-cols-2">
    <!-- Contenu à gauche -->
    <div class="space-y-4 sm:space-y-6">
      <!-- Titre principal -->
      <h1 class="font-title text-secondary text-3xl leading-tight sm:text-4xl lg:text-5xl">
        {{ t('home.header.title') }}
      </h1>
      <!-- Paragraphe descriptif -->
      <p class="font-paragraph text-sm leading-relaxed lg:text-lg">
        {{ t('home.header.description') }}
      </p>
      <!-- Boutons d'action -->
      <div class="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button
          variant="default"
          class="bg-primary hover:bg-primary/90 px-4 py-2 text-sm text-white sm:text-base"
          @click="navigateToAssociations"
        >
          {{ t('home.header.findAssociation') }}
        </Button>
        <Button
          variant="outline"
          class="border-accent text-accent hover:bg-accent px-4 py-2 text-sm transition-colors hover:text-white sm:text-base"
          @click="navigateToEvents"
        >
          {{ t('home.header.discoverProjects') }}
        </Button>
      </div>
    </div>
    <!-- Image hexagonale à droite -->
    <div class="mt-4 hidden justify-center sm:mt-8 lg:mt-0 lg:flex lg:justify-end">
      <div class="h-60 w-60 lg:h-[400px] lg:w-[400px] 2xl:h-[550px] 2xl:w-[550px]">
        <img
          :src="polygonImage"
          :alt="t('home.header.imageAlt')"
          class="h-full w-full object-contain"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { Button } from '@/components/ui/button';
  import polygonImage from '@/assets/images/home/polygon_header.png';

  const router = useRouter();
  const { t } = useI18n();

  const navigateToAssociations = () => {
    router.push('/associations');
  };

  const navigateToEvents = () => {
    router.push('/events');
  };
</script>
