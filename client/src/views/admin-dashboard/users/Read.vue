<template>
  <Read
    :table-headers="tableHeaders"
    :fetch-items="`admin/users`"
    :can-create-items="false"
    :can-update-items="true"
    :can-delete-items="true"
    :can-modify-specific-item="() => true"
    update-route-name="AdminDashboardUsersUpdate"
    delete-route-name="AdminDashboardUsersDelete"
  >
    <template #header>Gestion des utilisateurs</template>
    <template #table-row="{ email, firstname, name, isVerified, roles, timestamps }">
      <TableCell class="font-medium">
        <div>{{ email }}</div>
      </TableCell>
      <TableCell>
        <div>{{ firstname }} {{ name }}</div>
      </TableCell>
      <TableCell>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="role in roles"
            :key="role.id"
            :class="[
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
              role.name === 'ADMIN' ? 'bg-secondary/20 text-secondary' : 'bg-accent/20 text-accent',
            ]"
          >
            {{ role.name }}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <span
          v-if="isVerified"
          class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800"
        >
          Vérifié
        </span>
        <span
          v-else
          class="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800"
        >
          Non vérifié
        </span>
      </TableCell>
      <TableCell>
        <div v-if="timestamps?.createdAt" class="text-muted-foreground text-sm">
          {{ new Date(timestamps.createdAt).toLocaleString('fr-FR') }}
        </div>
        <div v-else class="text-muted-foreground">N/A</div>
      </TableCell>
    </template>
  </Read>
  <router-view />
</template>

<script setup lang="ts">
  import { TableCell } from '@/components/ui/table';
  import { Read } from '@/components/dashboard/crud';
  import type { User } from '@/interfaces/user.interface';
  import type { TableHeader } from '@/interfaces/table-header.interface';

  const tableHeaders: TableHeader<User>[] = [
    { text: 'Email', sortKey: 'email' },
    { text: 'Nom complet', sortKey: 'name' },
    { text: 'Rôles' },
    { text: 'Statut', sortKey: 'isVerified' },
    { text: 'Date de création', sortKey: 'timestamps.createdAt' },
  ];
</script>
