<template>
  <aside
    class="bg-accent flex min-h-screen w-16 flex-col justify-between px-2 py-4 lg:w-60 lg:px-4 lg:py-6 xl:w-70 2xl:w-80"
  >
    <div>
      <div
        class="border-accent-foreground flex w-full items-center justify-center border-b pb-4 lg:pb-6"
      >
        <RouterLink to="/">
          <div class="h-12 w-12 rounded-full bg-white lg:h-16 lg:w-16">
            <img :src="logo" alt="Logo SolidHive" class="h-full w-full object-contain p-2" />
          </div>
        </RouterLink>
      </div>
      <div class="flex flex-col gap-4 py-4 lg:py-6">
        <RouterLink
          :to="`${$route.fullPath}`"
          class="text-accent-foreground flex flex-row items-center justify-center px-2 py-3 hover:opacity-75 lg:justify-start lg:gap-2"
          active-class="bg-secondary rounded-lg font-semibold"
        >
          <Home :size="20" />
          <span class="hidden lg:block">Accueil</span>
        </RouterLink>
        <RouterLink
          :to="`${$route.fullPath}/category`"
          class="text-accent-foreground flex flex-row items-center justify-center px-2 py-3 hover:opacity-75 lg:justify-start lg:gap-2"
          active-class="bg-secondary rounded-lg font-semibold"
        >
          <Settings :size="20" />
          <span class="hidden lg:block">Paramètres</span>
        </RouterLink>
      </div>
    </div>
    <div class="border-accent-foreground border-t">
      <p class="text-accent-foreground mt-4 text-xs">
        <span>{{ width >= 1024 ? 'Copyright' : '©' }}</span>
        {{ new Date().getFullYear() }}
      </p>
    </div>
  </aside>
</template>
<script setup lang="ts">
  import logo from '@/assets/images/logo-small-solidhive.svg';
  import { Settings, Home } from 'lucide-vue-next';
  import { useWindowSize } from '@vueuse/core';

  const { width } = useWindowSize();
</script>
