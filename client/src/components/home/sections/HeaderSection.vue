<template>
  <section class="grid items-center lg:grid-cols-2">
    <!-- Contenu à gauche -->
    <div class="space-y-4 sm:space-y-6">
      <!-- Titre principal -->
      <h1 class="font-title text-secondary text-3xl leading-tight sm:text-4xl lg:text-5xl">
        La ruche qui fait Bourdonner la solidarité
      </h1>
      <!-- Paragraphe descriptif -->
      <p class="font-paragraph text-sm leading-relaxed lg:text-lg">
        Rejoignez une communauté engagée qui transforme les bonnes intentions en actions concrètes.
        <br />
        Ensemble, créons un réseau de solidarité qui unit les associations et amplifie leur impact
        social.
      </p>
      <!-- Boutons d'action -->
      <div class="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button
          variant="default"
          class="bg-primary hover:bg-primary/90 px-4 py-2 text-sm text-white sm:text-base"
          @click="navigateToAssociations"
        >
          Trouver mon association
        </Button>
        <Button
          variant="outline"
          class="border-accent text-accent hover:bg-accent px-4 py-2 text-sm transition-colors hover:text-white sm:text-base"
          @click="navigateToEvents"
        >
          Découvrir les projets
        </Button>
      </div>
    </div>
    <!-- Image hexagonale à droite -->
    <div class="mt-4 hidden justify-center sm:mt-8 lg:mt-0 lg:flex lg:justify-end">
      <div class="h-[240px] w-[240px] lg:h-[400px] lg:w-[400px] 2xl:h-[550px] 2xl:w-[550px]">
        <img
          :src="polygonImage"
          alt="Solidarité communautaire"
          class="h-full w-full object-contain"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import { Button } from '@/components/ui/button';
  import polygonImage from '@/assets/images/home/polygon_header.png';

  const router = useRouter();

  const navigateToAssociations = () => {
    router.push('/associations');
  };

  const navigateToEvents = () => {
    router.push('/events');
  };
</script>
