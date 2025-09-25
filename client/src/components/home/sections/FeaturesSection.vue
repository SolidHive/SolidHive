<template>
  <section>
    <!-- Titre principal -->
    <div class="mb-12">
      <h2 class="font-title text-secondary mb-8 text-2xl sm:text-3xl lg:text-4xl">
        Pourquoi choisir SolidHive ?
      </h2>
    </div>

    <!-- Grille des features 2x2 -->
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <!-- Feature 1 - Recherche -->
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <!-- Icône loupe -->
          <Search class="text-accent h-6 w-6 flex-shrink-0" />
          <!-- Titre -->
          <h3 class="font-subtitle text-secondary text-base lg:text-xl">
            Trouvez l’association qui vous ressemble
          </h3>
        </div>
        <!-- Paragraphe -->
        <p class="font-paragraph text-sm lg:text-base">
          Grâce à nos filtres malins, explorez des associations alignées avec vos valeurs, vos
          envies et votre cœur.
        </p>
      </div>

      <!-- Feature 2 - Rapidité -->
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <!-- Icône éclair -->
          <Zap class="text-accent h-6 w-6 flex-shrink-0" />
          <!-- Titre -->
          <h3 class="font-subtitle text-secondary text-base lg:text-xl">
            Un don en quelques clics
          </h3>
        </div>
        <!-- Paragraphe -->
        <p class="font-paragraph text-sm lg:text-base">
          Une interface fluide et rapide, pensée pour vous faire gagner du temps. Donner devient
          simple et naturel.
        </p>
      </div>

      <!-- Feature 3 - Communauté -->
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <!-- Icône personnage -->
          <User class="text-accent h-6 w-6 flex-shrink-0" />
          <!-- Titre -->
          <h3 class="font-subtitle text-secondary text-base lg:text-xl">
            Votre espace donateur personnel
          </h3>
        </div>
        <!-- Paragraphe -->
        <p class="font-paragraph text-sm lg:text-base">
          Retrouvez vos dons, vos associations favorites, vos reçus et l’historique de vos actions.
        </p>
      </div>

      <!-- Feature 4 - Sécurité -->
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <!-- Icône bouclier -->
          <Shield class="text-accent h-6 w-6 flex-shrink-0" />
          <!-- Titre -->
          <h3 class="font-subtitle text-secondary text-base lg:text-xl">Transparence total</h3>
        </div>
        <!-- Paragraphe -->
        <p class="font-paragraph text-sm lg:text-base">
          Chaque association est vérifiée. Vous voyez tout.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { Search, Zap, User, Shield } from 'lucide-vue-next';
</script>
