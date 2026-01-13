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
  import { useCrmPremiumAccess } from '@/composables/crm-premium';
  import { Permissions } from '@/enums/permissions';
  import type { Fundraising } from '@/interfaces';
  import { useCrmStore } from '@/stores/crm';
  import { onBeforeMount } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  const Delete = DeleteRaw<Fundraising>;
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const crmPremiumAccess = useCrmPremiumAccess(crmStore.associationPremiumUntil);
  const router = useRouter();
  const associationId = route.params.id as string;
  const id = route.params.itemId;

  if (!id || typeof id !== 'string') {
    console.error('No fundraising ID provided in route parameters.');
  }

  onBeforeMount(async () => {
    const hasPremiumAccess = await crmPremiumAccess.hasAccessToPremiumFeatures(
      Permissions.FUNDRAISINGS_DELETE
    );

    if (!hasPremiumAccess) {
      router.push({
        name: 'CRMPremiumRequired',
        params: {
          id: route.params.id,
        },
      });
      return;
    }

    if (!crmAccess.canRemoveFundraising) {
      router.push('/unauthorized');
      return;
    }
  });
</script>
