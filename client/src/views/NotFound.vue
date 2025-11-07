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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Retour à l'accueil
          </router-link>

          <button
            class="inline-flex items-center justify-center rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            @click="goBack"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
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

  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };
</script>
