<template>
  <Header>
    <button
      class="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors md:text-base"
      @click="openCreateDrawer"
    >
      <Plus :class="width >= 460 ? 'mr-2' : ''" :size="20" />
      <span>{{ width >= 460 ? 'Créer un rôle' : '' }}</span>
    </button>
  </Header>
  <div class="relative w-full p-6 md:px-12">
    <!-- Barre de recherche -->
    <RolesSearchBar v-model="searchQuery" />

    <!-- Table des rôles -->
    <RolesTable
      :roles="roles"
      :can-update-role="canUpdateRole ?? false"
      :can-remove-role="canRemoveRole ?? false"
      @edit="openEditDrawer"
      @delete="openDeleteDrawer"
    />

    <!-- Pagination -->
    <RolesPagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-roles="totalRoles"
      :items-per-page="itemsPerPage"
      @previous="goToPreviousPage"
      @next="goToNextPage"
      @update:items-per-page="handleItemsPerPageChange"
    />

    <!-- Loading -->
    <LoadingSpinner :is-loading="isLoading" />

    <!-- Drawers -->
    <CreateRoleDrawer
      v-model:open="isCreateDrawerOpen"
      :association-id="associationId"
      @role-created="fetchRoles"
    />

    <EditRoleDrawer
      v-model:open="isEditDrawerOpen"
      :role="selectedRole"
      :association-id="associationId"
      :can-update-role="canUpdateRole ?? false"
      @role-updated="fetchRoles"
    />

    <DeleteRoleDrawer
      v-model:open="isDeleteDrawerOpen"
      :role="selectedRole"
      :association-id="associationId"
      :can-remove-role="canRemoveRole ?? false"
      @role-deleted="fetchRoles"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, onBeforeMount, computed } from 'vue';
  import Header from '@/components/dashboard/Header.vue';
  import RolesSearchBar from '@/components/crm/roles/RolesSearchBar.vue';
  import RolesTable from '@/components/crm/roles/RolesTable.vue';
  import RolesPagination from '@/components/crm/roles/RolesPagination.vue';
  import LoadingSpinner from '@/components/crm/members/LoadingSpinner.vue';
  import CreateRoleDrawer from '@/components/crm/roles/CreateRoleDrawer.vue';
  import EditRoleDrawer from '@/components/crm/roles/EditRoleDrawer.vue';
  import DeleteRoleDrawer from '@/components/crm/roles/DeleteRoleDrawer.vue';
  import { useRoute, useRouter } from 'vue-router';
  import Database from '@/utils/database.utils';
  import type { Role } from '@/interfaces/roles.interface';
  import { useCrmStore } from '@/stores/crm';
  import { Permissions } from '@/enums/permissions';
  import { useWindowSize } from '@vueuse/core';
  import { Plus } from 'lucide-vue-next';

  const { width } = useWindowSize();
  const crmStore = useCrmStore();
  const member = crmStore.member;
  const route = useRoute();
  const router = useRouter();
  const associationId = route.params.id as string;

  const searchQuery = ref('');
  const roles = ref<Role[]>([]);
  const isLoading = ref(false);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalRoles = ref(0);
  const totalPages = ref(1);
  const isCreateDrawerOpen = ref(false);
  const isEditDrawerOpen = ref(false);
  const isDeleteDrawerOpen = ref(false);
  const selectedRole = ref<Role | null>(null);

  const canUpdateRole = computed(() => {
    return member?.role.permissions.some(
      (permission) => permission === Permissions.ALL || permission === Permissions.ROLES_UPDATE
    );
  });

  const canRemoveRole = computed(() => {
    return member?.role.permissions.some(
      (permission) => permission === Permissions.ALL || permission === Permissions.ROLES_DELETE
    );
  });

  function openCreateDrawer() {
    isCreateDrawerOpen.value = true;
  }

  function openEditDrawer(role: Role) {
    selectedRole.value = role;
    isEditDrawerOpen.value = true;
  }

  function openDeleteDrawer(role: Role) {
    selectedRole.value = role;
    isDeleteDrawerOpen.value = true;
  }

  async function fetchRoles(): Promise<void> {
    try {
      isLoading.value = true;

      const params: Record<string, any> = {
        skip: (currentPage.value - 1) * itemsPerPage.value,
        take: itemsPerPage.value,
      };

      if (searchQuery.value) {
        params.where = JSON.stringify({ name: searchQuery.value });
      }

      const response = await Database.getAll(`association/${associationId}/roles`, params);

      roles.value = response;
      totalRoles.value = roles.value.length;
      totalPages.value = Math.ceil(totalRoles.value / itemsPerPage.value) || 1;
    } catch (err) {
      console.error('Erreur lors du chargement des rôles:', err);
      roles.value = [];
      totalRoles.value = 0;
      totalPages.value = 1;
    } finally {
      isLoading.value = false;
    }
  }

  function goToPreviousPage() {
    if (currentPage.value > 1) {
      currentPage.value--;
      fetchRoles();
    }
  }

  function goToNextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
      fetchRoles();
    }
  }

  function handleItemsPerPageChange(value: number) {
    itemsPerPage.value = value;
    currentPage.value = 1;
    fetchRoles();
  }

  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  watch(searchQuery, () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      currentPage.value = 1;
      fetchRoles();
    }, 500);
  });

  onBeforeMount(async () => {
    const hasAccessToRoles = member?.role.permissions.some(
      (permission) => permission === Permissions.ROLES_VIEW || permission === Permissions.ALL
    );
    if (!hasAccessToRoles) {
      router.push('/unauthorized');
      return;
    }
  });

  onMounted(() => {
    fetchRoles();
  });
</script>
