<template>
  <CrudDelete
    :can-remove-item="true"
    :fetch-item="`admin/users/${userId}`"
    :delete-endpoint="`admin/users/${userId}`"
    delete-method="DELETE"
    action-label="Bannir"
    action-loading-label="Bannissement..."
  >
    <template #title>Bannir l'utilisateur</template>
    <template #description="{ email, firstname, name }">
      Cette action suspendra temporairement l'utilisateur
      <span class="font-semibold">{{ firstname }} {{ name }} ({{ email }})</span>
      . L'utilisateur recevra un email de notification et ne pourra plus se connecter à son compte.
    </template>
  </CrudDelete>
</template>

<script setup lang="ts">
  import { Delete as CrudDeleteRaw } from '@/components/dashboard/crud';
  import type { User } from '@/interfaces/user.interface';
  import { useRoute } from 'vue-router';

  const CrudDelete = CrudDeleteRaw<User>;

  const route = useRoute();
  const userId = route.params.itemId;

  if (!userId || typeof userId !== 'string') {
    console.error('No userId provided in route parameters.');
  }
</script>
