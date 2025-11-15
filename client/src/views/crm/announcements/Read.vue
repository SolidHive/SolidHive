<template>
  <Read
    :fetch-items="`association/${associationId}/announcements`"
    :can-create-items="crmAccess.canCreateAnnouncement"
    :can-update-items="crmAccess.canUpdateAnnouncement"
    :can-delete-items="crmAccess.canRemoveAnnouncement"
    :can-modify-specific-item="() => true"
  >
    <template #header>Annonces</template>
    <template #add-button>Créer une annonce</template>
    <template #table-header>
      <TableHead v-for="header in tableHeaders" :key="header">{{ header }}</TableHead>
    </template>
    <template #table-row="{ title, isActive, timestamps, image }">
      <TableCell class="font-medium">
        <div>{{ title }}</div>
      </TableCell>
      <TableCell>
        <Image :src="image" />
      </TableCell>
      <TableCell>
        <span
          v-if="isActive"
          class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800"
        >
          Active
        </span>
        <span
          v-else
          class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800"
        >
          Inactive
        </span>
      </TableCell>
      <TableCell>
        <div v-if="timestamps?.createdAt" class="text-muted-foreground text-sm">
          {{ new Date(timestamps.createdAt).toLocaleString('fr-FR') }}
        </div>
        <div v-else class="text-muted-foreground">N/A</div>
      </TableCell>
      <TableCell>
        <div v-if="timestamps?.updatedAt" class="text-muted-foreground text-sm">
          {{ new Date(timestamps.updatedAt).toLocaleString('fr-FR') }}
        </div>
        <div v-else class="text-muted-foreground">N/A</div>
      </TableCell>
    </template>
  </Read>
  <router-view />
</template>

<script setup lang="ts">
  import { onBeforeMount } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useCrmStore } from '@/stores/crm';
  import { TableCell, TableHead } from '@/components/ui/table';
  import { useCrmAccess } from '@/composables/crm-access';
  import { Read as ReadRaw } from '@/components/dashboard/crud';
  import { Permissions } from '@/enums/permissions';
  import type { Announcement } from '@/interfaces';
  import Image from '@/components/dashboard/Image.vue';

  const Read = ReadRaw<Announcement>;
  const tableHeaders = ['Titre', 'Image', 'Statut', 'Date de création', 'Date de mise à jour'];

  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const router = useRouter();
  const associationId = route.params.id as string;

  onBeforeMount(async () => {
    const canAccessToAnnouncements = member.role.permissions.some(
      (permission) => permission === Permissions.ALL
    );
    if (!canAccessToAnnouncements) {
      router.push('/unauthorized');
      return;
    }
  });
</script>
