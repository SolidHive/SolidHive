<template>
  <Delete
    :can-remove-item="crmAccess.canRemoveAnnouncement"
    :fetch-item="`association/${associationId}/announcement/${id}`"
    :delete-endpoint="`association/${associationId}/announcement/${id}`"
  >
    <template #title>Supprimer l'annonce</template>
    <template #description="{ title }">
      Cette action est irréversible. L'annonce
      <span class="font-semibold">{{ title }}</span>
      sera supprimée définitivement.
    </template>
  </Delete>
</template>

<script setup lang="ts">
  import { Delete as DeleteRaw } from '@/components/dashboard/crud';
  import { useCrmAccess } from '@/composables/crm-access';
  import type { Announcement } from '@/interfaces/announcement.interface';
  import { useCrmStore } from '@/stores/crm';
  import { useRoute } from 'vue-router';

  const Delete = DeleteRaw<Announcement>;
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const associationId = route.params.id as string;
  const id = route.params.itemId;

  if (!id || typeof id !== 'string') {
    console.error('No announcement ID provided in route parameters.');
  }
</script>
