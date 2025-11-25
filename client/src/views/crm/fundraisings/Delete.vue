<template>
  <Delete
    :can-remove-item="crmAccess.canRemoveFundraising"
    :fetch-item="`association/${associationId}/fundraising/${id}`"
    :delete-endpoint="`association/${associationId}/fundraising/${id}`"
  >
    <template #title>Supprimer la cagnotte</template>
    <template #description="{ title }">
      Cette action est irréversible. La cagnotte
      <span class="font-semibold">{{ title }}</span>
      sera supprimée définitivement.
    </template>
  </Delete>
</template>

<script setup lang="ts">
  import { Delete as DeleteRaw } from '@/components/dashboard/crud';
  import { useCrmAccess } from '@/composables/crm-access';
  import type { Fundraising } from '@/interfaces';
  import { useCrmStore } from '@/stores/crm';
  import { useRoute } from 'vue-router';

  const Delete = DeleteRaw<Fundraising>;
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const associationId = route.params.id as string;
  const id = route.params.itemId;

  if (!id || typeof id !== 'string') {
    console.error('No fundraising ID provided in route parameters.');
  }
</script>
