<template>
  <section>
    <!-- Titre et sous-titre centrés -->
    <div class="mb-12 text-center">
      <h2 class="font-title text-secondary mb-8 text-2xl sm:text-3xl lg:text-4xl">
        L'association qu'il te faut
      </h2>
      <p class="text-md font-paragraph lg:text-lg">Pars à la rencontre de ton association idéale</p>
    </div>

    <!-- Grille des associations -->
    <div class="mb-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <!-- Cards associations avec boucle -->
      <div
        v-for="(association, index) in associations"
        :key="index"
        class="flex aspect-[4/3] items-center justify-center rounded-xl bg-white shadow-md transition-shadow hover:shadow-lg"
      >
        <img
          :src="association.logo"
          :alt="association.name"
          class="h-16 w-16 object-contain transition-transform duration-200 hover:scale-105 lg:h-24 lg:w-24"
        />
      </div>
    </div>

    <!-- Bouton centré -->
    <div class="text-center">
      <Button
        class="bg-accent hover:bg-accent/90 w-full px-8 text-white transition-colors sm:w-auto"
      >
        Voir toutes les associations
      </Button>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { Button } from '@/components/ui/button';

  // Données des associations (2 lignes de 5 = 10 associations)
  const associations = [
    {
      name: 'Association 1',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Human_appeal_logo18.png',
    },
    {
      name: 'Association 2',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Human_appeal_logo18.png',
    },
    {
      name: 'Association 3',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Human_appeal_logo18.png',
    },
    {
      name: 'Association 4',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Human_appeal_logo18.png',
    },
    {
      name: 'Association 5',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Human_appeal_logo18.png',
    },
    {
      name: 'Association 6',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Human_appeal_logo18.png',
    },
    {
      name: 'Association 7',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Human_appeal_logo18.png',
    },
    {
      name: 'Association 8',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Human_appeal_logo18.png',
    },
    {
      name: 'Association 9',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Human_appeal_logo18.png',
    },
    {
      name: 'Association 10',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Human_appeal_logo18.png',
    },
  ];
</script>
