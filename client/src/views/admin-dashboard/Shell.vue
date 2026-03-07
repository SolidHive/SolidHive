<template>
  <div class="w-full grow">
    <div class="flex h-full w-full">
      <AdminAside />
      <main class="bg-background flex-1 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import AdminAside from '@/components/admin-dashboard/AdminAside.vue';
  import { useAuthStore } from '@/stores/auth';
  import { onBeforeMount } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const authStore = useAuthStore();

  onBeforeMount(async () => {
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
  });
</script>
