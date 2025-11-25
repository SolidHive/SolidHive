<template>
  <aside class="bg-accent flex min-h-screen min-w-16 flex-none flex-col lg:w-45 xl:w-55 2xl:w-65">
    <div
      id="crm-aside-header"
      class="flex h-16 w-full items-center justify-center border-b border-gray-200 sm:h-24"
    >
      <RouterLink to="/">
        <div class="h-12 w-12 rounded-full bg-white lg:h-16 lg:w-16">
          <img :src="logo" alt="Logo SolidHive" class="h-full w-full object-contain p-2" />
        </div>
      </RouterLink>
    </div>
    <div class="flex flex-1 flex-col justify-between">
      <div id="crm-aside-links" class="px-2 lg:px-4">
        <div class="flex flex-col gap-4 py-4 lg:py-6">
          <RouterLink
            :to="{ name: 'CRMHome', params: { locale: $route.params.locale } }"
            class="text-accent-foreground flex flex-row items-center justify-center px-2 py-3 hover:opacity-75 lg:justify-start lg:gap-2"
            active-class="bg-secondary rounded-lg font-semibold"
          >
            <Home :size="20" />
            <span class="hidden lg:block">Accueil</span>
          </RouterLink>
          <RouterLink
            v-if="crmAccess.canAccessToMembers"
            :to="{ name: 'CRMMembers', params: { locale: $route.params.locale } }"
            class="text-accent-foreground flex flex-row items-center justify-center px-2 py-3 hover:opacity-75 lg:justify-start lg:gap-2"
            active-class="bg-secondary rounded-lg font-semibold"
          >
            <Users :size="20" />
            <span class="hidden lg:block">Membres</span>
          </RouterLink>
          <RouterLink
            v-if="crmAccess.canAccessToRoles"
            :to="{ name: 'CRMRoles', params: { locale: $route.params.locale } }"
            class="text-accent-foreground flex flex-row items-center justify-center px-2 py-3 hover:opacity-75 lg:justify-start lg:gap-2"
            active-class="bg-secondary rounded-lg font-semibold"
          >
            <ShieldCheck :size="20" />
            <span class="hidden lg:block">Rôles</span>
          </RouterLink>
          <RouterLink
            :to="{ name: 'CRMAnnouncements', params: { locale: $route.params.locale } }"
            class="text-accent-foreground flex flex-row items-center justify-center px-2 py-3 hover:opacity-75 lg:justify-start lg:gap-2"
            active-class="bg-secondary rounded-lg font-semibold"
          >
            <Megaphone :size="20" />
            <span class="hidden lg:block">Annonces</span>
          </RouterLink>
          <RouterLink
            :to="{ name: 'CRMFundraisings', params: { locale: $route.params.locale } }"
            class="text-accent-foreground flex flex-row items-center justify-center px-2 py-3 hover:opacity-75 lg:justify-start lg:gap-2"
            active-class="bg-secondary rounded-lg font-semibold"
          >
            <Heart :size="20" />
            <span class="hidden lg:block">Cagnottes</span>
          </RouterLink>
          <RouterLink
            v-if="crmAccess.canCreateEvent"
            :to="{ name: 'CRMEvents', params: { locale: $route.params.locale } }"
            class="text-accent-foreground flex flex-row items-center justify-center px-2 py-3 hover:opacity-75 lg:justify-start lg:gap-2"
            active-class="bg-secondary rounded-lg font-semibold"
          >
            <Calendar :size="20" />
            <span class="hidden lg:block">Événements</span>
          </RouterLink>
        </div>
      </div>
      <div id="crm-aside-footer" class="border-accent-foreground border-t px-2 py-4 lg:px-4">
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
  import { Home, Users, ShieldCheck, Megaphone, Heart, Calendar } from 'lucide-vue-next';
  import { useWindowSize } from '@vueuse/core';
  import { useCrmStore } from '@/stores/crm';
  import { useCrmAccess } from '@/composables/crm-access';

  const { width } = useWindowSize();
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
</script>
