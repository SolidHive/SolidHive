<template>
  <section>
    <div class="flex flex-col items-center gap-8 lg:grid lg:grid-cols-2 lg:gap-12">
      <!-- Image à gauche -->
      <div class="mb-8 hidden w-full justify-center lg:mr-8 lg:mb-0 lg:block lg:w-auto">
        <div class="aspect-square w-full lg:h-[450px] lg:w-[450px] 2xl:h-[600px] 2xl:w-[600px]">
          <img
            :src="phoneSolidHive"
            :alt="t('home.cta.imageAlt')"
            class="h-full w-full rounded-xl object-cover"
          />
        </div>
      </div>

      <!-- Contenu à droite -->
      <div class="space-y-6">
        <!-- Titre principal -->
        <h2 class="font-title text-secondary text-2xl leading-tight sm:text-3xl xl:text-4xl">
          {{ t('home.cta.title') }}
        </h2>

        <!-- Texte descriptif -->
        <div class="space-y-4">
          <p class="font-paragraph text-sm leading-relaxed xl:text-lg">
            {{ t('home.cta.point1') }}
          </p>

          <p class="font-paragraph text-sm leading-relaxed xl:text-lg">
            {{ t('home.cta.point2') }}
          </p>

          <p class="font-paragraph text-sm leading-relaxed xl:text-lg">
            {{ t('home.cta.point3') }}
            <br />
            <span class="font-bold">{{ t('home.cta.bold') }}</span>
          </p>
        </div>

        <!-- Bouton -->
        <div>
          <Button
            variant="outline"
            class="border-accent text-accent hover:bg-accent w-full px-8 py-3 transition-colors hover:text-white sm:w-auto"
          >
            {{ t('home.cta.button') }}
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { Button } from '@/components/ui/button';
  import phoneSolidHive from '@/assets/images/home/phone_solidhive.jpg';

  const { t } = useI18n();
</script>
