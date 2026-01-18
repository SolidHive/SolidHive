<template>
  <PageContainer>
    <div class="flex min-h-[calc(100vh-200px)] items-center justify-center">
      <div class="max-w-2xl px-4 text-center">
        <!-- Illustration 404 -->
        <div class="mb-8">
          <h1 class="text-primary mb-4 text-9xl font-bold">404</h1>
        </div>

        <!-- Message d'erreur -->
        <h2 class="mb-4 text-3xl font-semibold text-gray-800 dark:text-white">Page introuvable</h2>
        <p class="mb-8 text-lg text-gray-600 dark:text-gray-300">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <!-- Actions -->
        <div class="flex flex-col justify-center gap-4 sm:flex-row">
          <router-link
            to="/"
            class="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium text-white transition-colors"
          >
            <Home class="mr-2 h-5 w-5" />
            Retour à l'accueil
          </router-link>

          <button
            class="inline-flex items-center justify-center rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            @click="goBack"
          >
            <ChevronLeft class="mr-2 h-5 w-5" />
            Page précédente
          </button>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import PageContainer from '@/components/PageContainer.vue';
  import { Home, ChevronLeft } from 'lucide-vue-next';

  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };
</script>
