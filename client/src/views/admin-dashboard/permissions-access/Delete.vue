<template>
  <CrudDelete
    :can-remove-item="true"
    :fetch-item="`permission-access/${permission}`"
    :delete-endpoint="`permission-access/${permissionId}`"
  >
    <template #title>Supprimer la permission d'accès</template>
    <template #description="{ permission: perm }">
      Cette action est irréversible. La permission
      <span class="font-semibold">{{ formatPermissionLabel(perm) }}</span>
      sera supprimée définitivement.
    </template>
  </CrudDelete>
</template>

<script setup lang="ts">
  import { Delete as CrudDeleteRaw } from '@/components/dashboard/crud';
  import type { PermissionAccess } from '@/interfaces/permission-access.interface';
  import { formatPermissionLabel } from '@/utils/permissions.utils';
  import { useRoute } from 'vue-router';
  import { ref, onMounted } from 'vue';
  import Database from '@/utils/database.utils';

  const CrudDelete = CrudDeleteRaw<PermissionAccess>;
  const route = useRoute();
  const permission = route.params.itemId; // itemId contient la permission (enum)
  const permissionId = ref<string>(''); // Stocke l'UUID pour le delete

  if (!permission || typeof permission !== 'string') {
    console.error('No permission provided in route parameters.');
  }

  // Récupère l'UUID de la permission pour le delete
  onMounted(async () => {
    try {
      const response = await Database.getAll(`permission-access/${permission}`);
      if (response && response.id) {
        permissionId.value = response.id;
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la permission:', err);
    }
  });
</script>
