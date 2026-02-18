<template>
  <Delete
    :can-remove-item="crmAccess.canRemoveMember"
    :fetch-item="`association/${associationId}/user/${id}`"
    :delete-endpoint="`association/${associationId}/user/${id}`"
  >
    <template #title>Supprimer le membre</template>
    <template #description="{ user }">
      Cette action est irréversible.
      <span class="font-semibold capitalize">{{ user.firstname }} {{ user.name }}</span>
      ne pourra plus accéder aux ressources de l'association.
    </template>
  </Delete>
</template>

<script setup lang="ts">
  import { Delete as DeleteRaw } from '@/components/dashboard/crud';
  import { useCrmAccess } from '@/composables/crm-access';
  import { useCrmPremiumAccess } from '@/composables/crm-premium';
  import { Permissions } from '@/enums/permissions';
  import type { Member } from '@/interfaces/member.interface';
  import { useCrmStore } from '@/stores/crm';
  import { onBeforeMount } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  const Delete = DeleteRaw<Member>;
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const crmPremiumAccess = useCrmPremiumAccess(crmStore.associationPremiumUntil);
  const router = useRouter();
  const associationId = route.params.id as string;
  const id = route.params.itemId;

  if (!id || typeof id !== 'string') {
    console.error('No member ID provided in route parameters.');
  }

  onBeforeMount(async () => {
    const hasPremiumAccess = await crmPremiumAccess.hasAccessToPremiumFeatures(
      Permissions.REGISTERS_DELETE
    );

    if (!hasPremiumAccess) {
      router.push({
        name: 'CRMPremiumRequired',
        params: { id: route.params.id },
      });
      return;
    }

    if (!crmAccess.canRemoveMember) {
      router.push('/unauthorized');
      return;
    }
  });
</script>
