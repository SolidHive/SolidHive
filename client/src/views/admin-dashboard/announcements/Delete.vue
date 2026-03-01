<template>
  <Delete
    :can-remove-item="true"
    :fetch-item="`admin/announcements/${id}`"
    :delete-endpoint="`admin/announcements/${id}`"
  >
    <template #title>Supprimer l'annonce blog</template>
    <template #description="{ title }">
      Cette action est irréversible. L'annonce blog
      <span class="font-semibold">{{ title }}</span>
      sera supprimée définitivement.
    </template>
  </Delete>
</template>

<script setup lang="ts">
  import { Delete as DeleteRaw } from '@/components/dashboard/crud';
  import type { Announcement } from '@/interfaces/announcement.interface';
  import { useRoute } from 'vue-router';

  const Delete = DeleteRaw<Announcement>;
  const route = useRoute();
  const id = route.params.itemId;

  if (!id || typeof id !== 'string') {
    console.error('No announcement ID provided in route parameters.');
  }
</script>
