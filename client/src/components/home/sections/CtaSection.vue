<template>
  <section>
    <div class="flex flex-col items-center gap-8 lg:grid lg:grid-cols-2 lg:gap-12">
      <!-- Image à gauche -->
      <div class="mb-8 flex w-full justify-center lg:mb-0 lg:mr-8 lg:block lg:w-auto">
        <div
          class="aspect-square w-full max-w-xs sm:max-w-sm md:max-w-md lg:h-[500px] lg:w-[500px]"
        >
          <img
            :src="phoneSolidHive"
            alt="Mouvement solidaire"
            class="h-full w-full rounded-xl object-cover"
          />
        </div>
      </div>

      <!-- Contenu à droite -->
      <div class="space-y-6">
        <!-- Titre principal -->
        <h2 class="font-title text-secondary text-2xl leading-tight sm:text-3xl lg:text-4xl">
          Une ruche solidaire pour agir ensemble
        </h2>

        <!-- Texte descriptif -->
        <div class="space-y-4">
          <p class="font-paragraph text-sm leading-relaxed lg:text-lg">
            👉 Donner de la visibilité aux associations et structures engagées, en leur fournissant
            des outils pratiques pour présenter leurs projets, mobiliser des bénévoles et recevoir
            des dons facilement.
          </p>

          <p class="font-paragraph text-sm leading-relaxed lg:text-lg">
            👉 Faciliter l'engagement des donateurs et citoyens solidaires, grâce à une interface
            intuitive, des filtres personnalisés, un espace donateur dédié et un suivi concret de
            l'impact de leurs contributions.
          </p>

          <p class="font-paragraph text-sm leading-relaxed lg:text-lg">
            SolidHive, c'est une ruche où chaque action, grande ou petite, compte.
            <br />
            <span class="font-bold">Ensemble, faisons grandir les causes qui font sens.</span>
          </p>
        </div>

        <!-- Bouton -->
        <div>
          <Button
            variant="outline"
            class="border-accent text-accent hover:bg-accent w-full px-8 py-3 transition-colors hover:text-white sm:w-auto"
          >
            En savoir plus
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { Button } from '@/components/ui/button';
  import phoneSolidHive from '@/assets/images/home/phone_solidhive.jpg';
</script>
