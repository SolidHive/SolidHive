<template>
  <Read
    :table-headers="tableHeaders"
    :fetch-items="`association/${associationId}/users`"
    :can-create-items="crmAccess.canCreateMember"
    :can-update-items="crmAccess.canUpdateMember"
    :can-delete-items="crmAccess.canRemoveMember"
    :can-modify-specific-item="(item: Member) => item.role.name !== 'owner'"
  >
    <template #header>Membres</template>
    <template #add-button>Inviter un membre</template>
    <template #table-row="{ user, role, status }">
      <TableCell class="font-medium">
        <div class="flex items-center gap-3">
          <div class="font-medium capitalize">{{ user.name }}</div>
          <div class="text-muted-foreground text-sm capitalize">
            {{ user.firstname }}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <a
          :href="`mailto:${member.user.email}`"
          class="text-blue-300 transition-all hover:underline hover:opacity-75"
        >
          {{ user.email }}
        </a>
      </TableCell>
      <TableCell>
        <div v-if="user.phone !== null && user.phone !== ''">
          <a
            :href="`tel:${user.phone}`"
            class="text-blue-300 transition-all hover:underline hover:opacity-75"
          >
            {{ user.phone }}
          </a>
        </div>
        <div v-else class="text-muted-foreground">N/A</div>
      </TableCell>
      <TableCell>
        <span
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
        >
          {{ role.name === 'owner' ? 'propriétaire' : role.name }}
        </span>
        <span
          v-if="member.user.id && user.id === member.user.id"
          class="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
        >
          Vous
        </span>
      </TableCell>
      <TableCell>
        <StatusTag :status="status" />
      </TableCell>
    </template>
  </Read>
  <router-view />
</template>

<script setup lang="ts">
  import { onBeforeMount } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import type { Member } from '@/interfaces/member.interface';
  import { useCrmStore } from '@/stores/crm';
  import { TableCell } from '@/components/ui/table';
  import StatusTag from '@/components/dashboard/tags/StatusTag.vue';
  import { useCrmAccess } from '@/composables/crm-access';
  import { Read } from '@/components/dashboard/crud';
  import type { TableHeader } from '@/interfaces/table-header.interface';

  const tableHeaders: TableHeader<Member>[] = [
    { text: 'Nom', sortKey: 'user.name' },
    { text: 'Email', sortKey: 'user.email' },
    { text: 'Téléphone', sortKey: 'user.phone' },
    { text: 'Rôle', sortKey: 'role.name' },
    { text: 'Statut', sortKey: 'status' },
  ];

  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const router = useRouter();
  const associationId = route.params.id as string;

  onBeforeMount(async () => {
    if (!crmAccess.canAccessToMembers) {
      router.push('/unauthorized');
      return;
    }
  });
</script>
