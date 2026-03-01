<template>
  <aside
    class="bg-accent fixed top-0 left-0 z-40 flex h-screen min-w-16 flex-none flex-col lg:w-45 xl:w-55 2xl:w-65"
  >
    <div
      id="admin-aside-header"
      class="flex h-16 w-full items-center justify-center border-b border-gray-200 py-4 sm:h-24"
    >
      <RouterLink to="/">
        <div class="h-12 w-12 rounded-full bg-white lg:h-16 lg:w-16">
          <img :src="logo" alt="Logo SolidHive" class="h-full w-full object-contain p-2" />
        </div>
      </RouterLink>
    </div>
    <div class="border-b border-gray-200 px-2 py-2 lg:px-4">
      <RouterLink
        to="/"
        class="text-accent-foreground flex flex-row items-center justify-center gap-2 rounded-lg px-2 py-3 hover:bg-[#8574B3] lg:justify-start"
      >
        <ArrowLeft :size="20" />
        <span class="hidden lg:block xl:hidden">Quitter</span>
        <span class="hidden xl:block">Quitter l'admin</span>
      </RouterLink>
    </div>
    <div class="flex flex-1 flex-col justify-between">
      <div id="admin-aside-links" class="px-2 lg:px-4">
        <div class="flex flex-col gap-4 py-4 lg:py-6">
          <RouterLink
            :to="{ name: 'AdminDashboardHome', params: { locale: $route.params.locale } }"
            class="text-accent-foreground flex flex-row items-center justify-center rounded-lg px-2 py-3 lg:justify-start lg:gap-2"
            :class="$route.name === 'AdminDashboardHome' ? '' : 'hover:bg-[#8574B3]'"
            active-class="bg-secondary font-semibold"
          >
            <LayoutDashboard :size="20" />
            <span class="hidden lg:block">Dashboard</span>
          </RouterLink>
          <RouterLink
            :to="{ name: 'AdminDashboardAssociations', params: { locale: $route.params.locale } }"
            class="text-accent-foreground flex flex-row items-center justify-center rounded-lg px-2 py-3 lg:justify-start lg:gap-2"
            :class="$route.name === 'AdminDashboardAssociations' ? '' : 'hover:bg-[#8574B3]'"
            active-class="bg-secondary font-semibold"
          >
            <Building2 :size="20" />
            <span class="hidden lg:block">Associations</span>
          </RouterLink>
          <RouterLink
            :to="{
              name: 'AdminDashboardPermissionsAccess',
              params: { locale: $route.params.locale },
            }"
            class="text-accent-foreground flex flex-row items-center justify-center rounded-lg px-2 py-3 lg:justify-start lg:gap-2"
            :class="$route.name === 'AdminDashboardPermissionsAccess' ? '' : 'hover:bg-[#8574B3]'"
            active-class="bg-secondary font-semibold"
          >
            <ShieldCheck :size="20" />
            <span class="hidden lg:block">Permissions</span>
          </RouterLink>
          <RouterLink
            :to="{ name: 'AdminDashboardUsers', params: { locale: $route.params.locale } }"
            class="text-accent-foreground flex flex-row items-center justify-center rounded-lg px-2 py-3 lg:justify-start lg:gap-2"
            :class="$route.name === 'AdminDashboardUsers' ? '' : 'hover:bg-[#8574B3]'"
            active-class="bg-secondary font-semibold"
          >
            <Users :size="20" />
            <span class="hidden lg:block">Utilisateurs</span>
          </RouterLink>
          <RouterLink
            :to="{ name: 'AdminDashboardAnnouncements', params: { locale: $route.params.locale } }"
            class="text-accent-foreground flex flex-row items-center justify-center rounded-lg px-2 py-3 lg:justify-start lg:gap-2"
            :class="$route.name === 'AdminDashboardAnnouncements' ? '' : 'hover:bg-[#8574B3]'"
            active-class="bg-secondary font-semibold"
          >
            <Megaphone :size="20" />
            <span class="hidden lg:block">Blog</span>
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
  import {
    LayoutDashboard,
    Building2,
    ShieldCheck,
    Users,
    ArrowLeft,
    Megaphone,
  } from 'lucide-vue-next';
  import { useWindowSize } from '@vueuse/core';

  const { width } = useWindowSize();
</script>
