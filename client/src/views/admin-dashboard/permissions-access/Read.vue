<template>
  <Read
    :table-headers="tableHeaders"
    :fetch-items="`permission-access`"
    :can-create-items="true"
    :can-update-items="true"
    :can-delete-items="true"
    :can-modify-specific-item="() => true"
    route-param-key="permission"
    create-route-name="AdminDashboardPermissionsAccessCreate"
    update-route-name="AdminDashboardPermissionsAccessUpdate"
    delete-route-name="AdminDashboardPermissionsAccessDelete"
  >
    <template #header>Permissions d'accès</template>
    <template #add-button>Créer une permission</template>
    <template #table-row="{ permission, requiresSubscription }">
      <TableCell class="font-medium">
        <div>{{ formatPermissionLabel(permission) }}</div>
      </TableCell>
      <TableCell>
        <span
          v-if="requiresSubscription"
          class="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800"
        >
          Premium
        </span>
        <span
          v-else
          class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800"
        >
          Gratuit
        </span>
      </TableCell>
    </template>
  </Read>
  <router-view />
</template>

<script setup lang="ts">
  import { TableCell } from '@/components/ui/table';
  import { Read } from '@/components/dashboard/crud';
  import type { PermissionAccess } from '@/interfaces/permission-access.interface';
  import { formatPermissionLabel } from '@/utils/permissions.utils';
  import type { TableHeader } from '@/interfaces/table-header.interface';

  const tableHeaders: TableHeader<PermissionAccess>[] = [
    { text: 'Permission', sortKey: 'permission' },
    { text: 'Accès' },
  ];
</script>
