<template>
  <aside
    class="bg-accent fixed top-0 left-0 z-40 flex h-screen min-w-16 flex-none flex-col lg:w-45 xl:w-55 2xl:w-65"
  >
    <div
      id="admin-aside-header"
      class="flex h-16 w-full items-center justify-center border-b border-gray-200 sm:h-24"
    >
      <RouterLink to="/">
        <div class="h-12 w-12 rounded-full bg-white lg:h-16 lg:w-16">
          <img :src="logo" alt="Logo SolidHive" class="h-full w-full object-contain p-2" />
        </div>
      </RouterLink>
    </div>
    <div class="flex flex-1 flex-col justify-between">
      <div id="admin-aside-links" class="px-2 lg:px-4">
        <div class="flex flex-col gap-4 py-4 lg:py-6">
          <RouterLink
            :to="{ name: 'AdminDashboardHome', params: { locale: $route.params.locale } }"
            class="text-accent-foreground flex flex-row items-center justify-center px-2 py-3 hover:opacity-75 lg:justify-start lg:gap-2"
            active-class="bg-secondary rounded-lg font-semibold"
          >
            <LayoutDashboard :size="20" />
            <span class="hidden lg:block">Dashboard</span>
          </RouterLink>
          <RouterLink
            :to="{ name: 'AdminDashboardAssociations', params: { locale: $route.params.locale } }"
            class="text-accent-foreground flex flex-row items-center justify-center px-2 py-3 hover:opacity-75 lg:justify-start lg:gap-2"
            active-class="bg-secondary rounded-lg font-semibold"
          >
            <Building2 :size="20" />
            <span class="hidden lg:block">Associations</span>
          </RouterLink>
        </div>
      </div>
      <div id="admin-aside-footer" class="border-accent-foreground border-t px-2 py-4 lg:px-4">
        <p class="text-accent-foreground text-xs">
          <span>{{ width >= 1024 ? 'Copyright' : '©' }}</span>
          {{ new Date().getFullYear() }}
        </p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import logo from '@/assets/images/logo-small-solidhive.svg';
  import { LayoutDashboard, Building2 } from 'lucide-vue-next';
  import { useWindowSize } from '@vueuse/core';

  const { width } = useWindowSize();
</script>
