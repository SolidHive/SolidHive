<template>
  <div v-if="!isLoading" class="w-full grow">
    <div class="flex h-full w-full">
      <AdminAside />
      <main class="bg-background ml-16 flex-1 overflow-y-auto lg:ml-45 xl:ml-55 2xl:ml-65">
        <router-view />
      </main>
    </div>
  </div>
  <div v-else class="fixed inset-0 flex items-center justify-center" role="status">
    <Loader class="fill-primary h-16 w-16 animate-spin text-gray-200" />
    <span class="sr-only">Loading...</span>
  </div>
</template>

<script setup lang="ts">
  import AdminAside from '@/components/admin-dashboard/AdminAside.vue';
  import { useAuthStore } from '@/stores/auth';
  import { onBeforeMount, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { Loader } from 'lucide-vue-next';

  const isLoading = ref(false);
  const router = useRouter();
  const authStore = useAuthStore();

  onBeforeMount(async () => {
    isLoading.value = true;

    if (!authStore.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const hasAdminRole = authStore.user?.roles?.some(
      (role: any) => role.name?.toLowerCase() === 'admin'
    );

    if (!hasAdminRole) {
      router.push('/unauthorized');
      return;
    }

    isLoading.value = false;
  });
</script>
