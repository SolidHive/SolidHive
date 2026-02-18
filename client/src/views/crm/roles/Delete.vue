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
  import { useCrmPremiumAccess } from '@/composables/crm-premium';
  import { Permissions } from '@/enums/permissions';
  import type { Role } from '@/interfaces/roles.interface';
  import { useCrmStore } from '@/stores/crm';
  import { onBeforeMount } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  const CrudDelete = CrudDeleteRaw<Role>;
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const crmPremiumAccess = useCrmPremiumAccess(crmStore.associationPremiumUntil);
  const router = useRouter();
  const associationId = route.params.id as string;
  const id = route.params.itemId;

  if (!id || typeof id !== 'string') {
    console.error('No role ID provided in route parameters.');
  }

  onBeforeMount(async () => {
    const hasPremiumAccess = await crmPremiumAccess.hasAccessToPremiumFeatures(
      Permissions.ROLES_DELETE
    );

    if (!hasPremiumAccess) {
      router.push({
        name: 'CRMPremiumRequired',
        params: { id: route.params.id },
      });
      return;
    }

    if (!crmAccess.canRemoveRole) {
      router.push('/unauthorized');
      return;
    }
  });
</script>
