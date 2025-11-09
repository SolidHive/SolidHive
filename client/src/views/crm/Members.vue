<template>
  <Header>
    <button
      v-if="canInviteMember"
      class="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors md:text-base"
      @click="openInviteDrawer"
    >
      <Plus :class="width >= 460 ? 'mr-2' : ''" :size="20" />
      <span>{{ width >= 460 ? 'Inviter un membre' : '' }}</span>
    </button>
  </Header>
  <div class="relative w-full p-6 md:px-12">
    <!-- Barre de recherche -->
    <MembersSearchBar v-model="searchQuery" />

    <!-- Table des membres -->
    <MembersTable
      :members="members"
      :current-user-id="member?.user.id"
      :can-update-member="canUpdateMember ?? false"
      :can-remove-member="canRemoveMember ?? false"
      @edit="openEditDrawer"
      @delete="openDeleteDrawer"
    />

    <!-- Pagination -->
    <MembersPagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-members="totalMembers"
      :items-per-page="itemsPerPage"
      @previous="goToPreviousPage"
      @next="goToNextPage"
      @update:items-per-page="handleItemsPerPageChange"
    />

    <!-- Loading -->
    <LoadingSpinner :is-loading="isLoading" />

    <!-- Drawers -->
    <InviteMemberDrawer
      v-model:open="isInviteDrawerOpen"
      :roles="roles"
      :association-id="associationId"
      :can-invite-member="canInviteMember ?? false"
      @member-invited="fetchMembers"
    />

    <EditMemberDrawer
      v-model:open="isEditDrawerOpen"
      :member="selectedMember"
      :roles="roles"
      :association-id="associationId"
      :can-update-member="canUpdateMember ?? false"
      @member-updated="fetchMembers"
    />

    <DeleteMemberDrawer
      v-model:open="isDeleteDrawerOpen"
      :member="selectedMember"
      :association-id="associationId"
      :can-remove-member="canRemoveMember ?? false"
      @member-deleted="fetchMembers"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, onBeforeMount, computed } from 'vue';
  import Header from '@/components/dashboard/Header.vue';
  import MembersSearchBar from '@/components/crm/members/MembersSearchBar.vue';
  import MembersTable from '@/components/crm/members/MembersTable.vue';
  import MembersPagination from '@/components/crm/members/MembersPagination.vue';
  import LoadingSpinner from '@/components/crm/members/LoadingSpinner.vue';
  import InviteMemberDrawer from '@/components/crm/members/InviteMemberDrawer.vue';
  import EditMemberDrawer from '@/components/crm/members/EditMemberDrawer.vue';
  import DeleteMemberDrawer from '@/components/crm/members/DeleteMemberDrawer.vue';
  import { useRoute, useRouter } from 'vue-router';
  import Database from '@/utils/database.utils';
  import type { Member } from '@/interfaces/member.interface';
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
  const members = ref<Member[]>([]);
  const roles = ref<Role[]>([]);
  const isLoading = ref(false);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalMembers = ref(0);
  const totalPages = ref(1);
  const isInviteDrawerOpen = ref(false);
  const isEditDrawerOpen = ref(false);
  const isDeleteDrawerOpen = ref(false);
  const selectedMember = ref<Member | null>(null);

  const canInviteMember = computed(() => {
    return member?.role.permissions.some(
      (permission) => permission === Permissions.ALL || permission === Permissions.REGISTERS_CREATE
    );
  });

  const canUpdateMember = computed(() => {
    return member?.role.permissions.some(
      (permission) => permission === Permissions.ALL || permission === Permissions.REGISTERS_UPDATE
    );
  });

  const canRemoveMember = computed(() => {
    return member?.role.permissions.some(
      (permission) => permission === Permissions.ALL || permission === Permissions.REGISTERS_DELETE
    );
  });

  function openInviteDrawer() {
    isInviteDrawerOpen.value = true;
  }

  function openEditDrawer(member: Member) {
    selectedMember.value = member;
    isEditDrawerOpen.value = true;
  }

  function openDeleteDrawer(member: Member) {
    selectedMember.value = member;
    isDeleteDrawerOpen.value = true;
  }

  async function fetchMembers(): Promise<void> {
    try {
      isLoading.value = true;

      const params: Record<string, any> = {
        skip: (currentPage.value - 1) * itemsPerPage.value,
        take: itemsPerPage.value,
      };

      if (searchQuery.value) {
        params.where = JSON.stringify(searchQuery.value);
      }

      const response = await Database.getAll(`association/${associationId}/users`, params);

      members.value = response;
      totalMembers.value = members.value.length;
      totalPages.value = Math.ceil(totalMembers.value / itemsPerPage.value) || 1;
    } catch (err) {
      console.error('Erreur lors du chargement des membres:', err);
      members.value = [];
      totalMembers.value = 0;
      totalPages.value = 1;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchRoles(): Promise<void> {
    try {
      isLoading.value = true;
      const response = await Database.getAll(`association/${associationId}/roles`);
      roles.value = response;
    } catch (err) {
      console.error('Erreur lors du chargement des rôles:', err);
      roles.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  function goToPreviousPage() {
    if (currentPage.value > 1) {
      currentPage.value--;
      fetchMembers();
    }
  }

  function goToNextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
      fetchMembers();
    }
  }

  function handleItemsPerPageChange(value: number) {
    itemsPerPage.value = value;
    currentPage.value = 1;
    fetchMembers();
  }

  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  watch(searchQuery, () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      currentPage.value = 1;
      fetchMembers();
    }, 500);
  });

  onBeforeMount(async () => {
    const hasAccessToMembers = member?.role.permissions.some(
      (permission) => permission === Permissions.REGISTERS_VIEW || permission === Permissions.ALL
    );
    if (!hasAccessToMembers) {
      router.push('/unauthorized');
      return;
    }
  });

  onMounted(() => {
    fetchMembers();
    fetchRoles();
  });
</script>
