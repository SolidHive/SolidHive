<template>
  <CrudDelete
    :can-remove-item="crmAccess.canRemoveRole"
    :fetch-item="`association/${associationId}/roles/${id}`"
    :delete-endpoint="`association/${associationId}/roles/${id}`"
  >
    <template #title>Supprimer le rôle</template>
    <template #description="{ name }">
      Cette action est irréversible. Le rôle
      <span class="font-semibold capitalize">{{ name }}</span>
      sera supprimé définitivement.
    </template>
  </CrudDelete>
</template>

<script setup lang="ts">
  import { Delete as CrudDeleteRaw } from '@/components/dashboard/crud';
  import { useCrmAccess } from '@/composables/crm-access';
  import type { Role } from '@/interfaces/roles.interface';
  import { useCrmStore } from '@/stores/crm';
  import { useRoute } from 'vue-router';

  const CrudDelete = CrudDeleteRaw<Role>;
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const associationId = route.params.id as string;
  const id = route.params.itemId;

  if (!id || typeof id !== 'string') {
    console.error('No role ID provided in route parameters.');
  }
</script>
