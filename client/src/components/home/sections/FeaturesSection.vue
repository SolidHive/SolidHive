<template>
  <section>
    <!-- Titre principal -->
    <div class="mb-12">
      <h2 class="font-title text-secondary mb-8 text-2xl sm:text-3xl lg:text-4xl">
        {{ t('home.features.title') }}
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
            {{ t('home.features.search.title') }}
          </h3>
        </div>
        <!-- Paragraphe -->
        <p class="font-paragraph text-sm lg:text-base">
          {{ t('home.features.search.description') }}
        </p>
      </div>

      <!-- Feature 2 - Rapidité -->
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <!-- Icône éclair -->
          <Zap class="text-accent h-6 w-6 flex-shrink-0" />
          <!-- Titre -->
          <h3 class="font-subtitle text-secondary text-base lg:text-xl">
            {{ t('home.features.speed.title') }}
          </h3>
        </div>
        <!-- Paragraphe -->
        <p class="font-paragraph text-sm lg:text-base">
          {{ t('home.features.speed.description') }}
        </p>
      </div>

      <!-- Feature 3 - Communauté -->
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <!-- Icône personnage -->
          <User class="text-accent h-6 w-6 flex-shrink-0" />
          <!-- Titre -->
          <h3 class="font-subtitle text-secondary text-base lg:text-xl">
            {{ t('home.features.community.title') }}
          </h3>
        </div>
        <!-- Paragraphe -->
        <p class="font-paragraph text-sm lg:text-base">
          {{ t('home.features.community.description') }}
        </p>
      </div>

      <!-- Feature 4 - Sécurité -->
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <!-- Icône bouclier -->
          <Shield class="text-accent h-6 w-6 flex-shrink-0" />
          <!-- Titre -->
          <h3 class="font-subtitle text-secondary text-base lg:text-xl">
            {{ t('home.features.security.title') }}
          </h3>
        </div>
        <!-- Paragraphe -->
        <p class="font-paragraph text-sm lg:text-base">
          {{ t('home.features.security.description') }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { Search, Zap, User, Shield } from 'lucide-vue-next';

  const { t } = useI18n();
</script>
