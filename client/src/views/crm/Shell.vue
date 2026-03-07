<template>
  <div v-if="!isLoading" class="w-full grow">
    <div class="flex h-full w-full">
      <Aside />
      <main class="bg-background flex-1 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
  <div v-else class="fixed inset-0 flex items-center justify-center" role="status">
    <Loader class="fill-primary h-16 w-16 animate-spin text-gray-200 dark:text-gray-600" />
    <span class="sr-only">Loading...</span>
  </div>
</template>
<script setup lang="ts">
  import { Loader } from 'lucide-vue-next';
  import Aside from '@/components/dashboard/Aside.vue';
  import { useAuthStore } from '@/stores/auth';
  import { useCrmStore } from '@/stores/crm';
  import { onBeforeMount } from 'vue';
  import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
  import { ref } from 'vue';

  const isLoading = ref(false);

  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();
  const crmStore = useCrmStore();

  onBeforeMount(async () => {
    isLoading.value = true;
    const id = route.params.id;

    if (!authStore.isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (typeof id !== 'string' || id === '') {
      router.push('/unauthorized');
      return;
    }

    const hasAccess = await crmStore.hasAccessToAssociation(id);

    if (!hasAccess) {
      router.push('/unauthorized');
      return;
    }

    // Définir l'association et la route actuelles
    crmStore.setCurrentAssociation(id);
    crmStore.setCurrentRoute(route.name as string);
    isLoading.value = false;
  });

  onBeforeRouteLeave(() => {
    crmStore.reset();
  });
</script>
