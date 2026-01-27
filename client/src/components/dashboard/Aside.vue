<template>
  <aside
    class="bg-accent fixed top-0 left-0 z-40 flex h-screen min-w-16 flex-none flex-col lg:w-45 xl:w-55 2xl:w-65"
  >
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
            v-if="crmAccess.canAccessToStatistics && isAssociationAccepted"
            :to="{ name: 'CRMStatistics', params: { locale: $route.params.locale } }"
            class="text-accent-foreground flex flex-row items-center justify-center px-2 py-3 hover:opacity-75 lg:justify-start lg:gap-2"
            active-class="bg-secondary rounded-lg font-semibold"
          >
            <BarChart3 :size="20" />
            <span class="hidden lg:block">Statistiques</span>
          </RouterLink>
          <RouterLink
            v-if="crmAccess.canAccessToMembers && isAssociationAccepted"
            :to="{ name: 'CRMMembers', params: { locale: $route.params.locale } }"
            class="text-accent-foreground flex flex-row items-center justify-center px-2 py-3 hover:opacity-75 lg:justify-start lg:gap-2"
            active-class="bg-secondary rounded-lg font-semibold"
          >
            <Users :size="20" />
            <span class="hidden lg:block">Membres</span>
          </RouterLink>
          <RouterLink
            v-if="crmAccess.canAccessToRoles && isAssociationAccepted"
            :to="{ name: 'CRMRoles', params: { locale: $route.params.locale } }"
            class="text-accent-foreground flex flex-row items-center justify-center px-2 py-3 hover:opacity-75 lg:justify-start lg:gap-2"
            active-class="bg-secondary rounded-lg font-semibold"
          >
            <ShieldCheck :size="20" />
            <span class="hidden lg:block">Rôles</span>
          </RouterLink>
          <RouterLink
            v-if="isAssociationAccepted"
            :to="{ name: 'CRMAnnouncements', params: { locale: $route.params.locale } }"
            class="text-accent-foreground flex flex-row items-center justify-center px-2 py-3 hover:opacity-75 lg:justify-start lg:gap-2"
            active-class="bg-secondary rounded-lg font-semibold"
          >
            <Megaphone :size="20" />
            <span class="hidden lg:block">Annonces</span>
          </RouterLink>
          <RouterLink
            v-if="isAssociationAccepted"
            :to="{ name: 'CRMFundraisings', params: { locale: $route.params.locale } }"
            class="text-accent-foreground flex flex-row items-center justify-center px-2 py-3 hover:opacity-75 lg:justify-start lg:gap-2"
            active-class="bg-secondary rounded-lg font-semibold"
          >
            <Heart :size="20" />
            <span class="hidden lg:block">Cagnottes</span>
          </RouterLink>
          <RouterLink
            v-if="crmAccess.canCreateEvent && isAssociationAccepted"
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
  import { Home, Users, ShieldCheck, Megaphone, Heart, Calendar, BarChart3 } from 'lucide-vue-next';
  import { useWindowSize } from '@vueuse/core';
  import { useCrmStore } from '@/stores/crm';
  import { useAuthStore } from '@/stores/auth';
  import { useCrmAccess } from '@/composables/crm-access';
  import { computed } from 'vue';
  import { Status } from '@/enums/status';

  const { width } = useWindowSize();
  const crmStore = useCrmStore();
  const authStore = useAuthStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);

  const isAssociationAccepted = computed(() => {
    const associationId = crmStore.currentAssociationId;
    if (!associationId) return false;

    const userAssociation = authStore.associations.find(
      (ua) => ua.association.id === associationId
    );

    return userAssociation?.association?.status === Status.ACCEPTED;
  });
</script>
