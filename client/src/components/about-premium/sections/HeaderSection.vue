<template>
  <section class="grid items-center lg:grid-cols-2">
    <!-- Contenu à gauche -->
    <div class="space-y-4 sm:space-y-6">
      <!-- Titre principal -->
      <h1 class="font-title text-secondary text-3xl leading-tight sm:text-4xl lg:text-5xl">
        Un CRM tout-en-un pour les
        <span class="text-accent">Associations !</span>
      </h1>
      <!-- Paragraphe descriptif -->
      <p class="font-paragraph text-sm leading-relaxed lg:text-lg">
        Boostez la visibilité de votre association.
        <br />
        Gérez vos événements simplement et passez en premium pour les mettre en avant et toucher
        plus de participants.
      </p>
      <!-- Boutons d'action -->
      <div class="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button
          variant="default"
          class="bg-primary hover:bg-primary/90 px-4 py-2 text-sm text-white sm:text-base"
          @click="navigateToAssociations"
        >
          Inscrire mon association
        </Button>
      </div>
    </div>
    <!-- Image hexagonale à droite -->
    <div class="mt-4 hidden justify-center sm:mt-8 lg:mt-0 lg:flex lg:justify-end">
      <div class="h-60 w-60 lg:h-[550px] lg:w-[550px] 2xl:h-[650px] 2xl:w-[650px]">
        <img
          :src="hexagonsImage"
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
  import hexagonsImage from '@/assets/images/about-premium/hexagons-header.svg';

  const router = useRouter();

  const navigateToAssociations = () => {
    router.push('/create-association');
  };
</script>
