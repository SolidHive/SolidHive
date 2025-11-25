<template>
  <Read
    :table-headers="tableHeaders"
    :fetch-items="`association/${associationId}/fundraisings`"
    :can-create-items="crmAccess.canCreateFundraising"
    :can-update-items="crmAccess.canUpdateFundraising"
    :can-delete-items="crmAccess.canRemoveFundraising"
    :can-modify-specific-item="() => true"
    create-route-name="CRMFundraisingsCreate"
    update-route-name="CRMFundraisingsUpdate"
    delete-route-name="CRMFundraisingsDelete"
  >
    <template #header>Cagnottes</template>
    <template #add-button>Créer une cagnotte</template>
    <template #table-row="{ title, amount, wantedAmount, startDate, endDate, image }">
      <TableCell class="font-medium">
        <div>{{ title }}</div>
      </TableCell>
      <TableCell>
        <Image :src="image" />
      </TableCell>
      <TableCell>
        <div class="text-sm">{{ formatCurrency(amount) }} / {{ formatCurrency(wantedAmount) }}</div>
        <div class="text-muted-foreground text-xs">
          {{ calculatePercentage(amount, wantedAmount) }}%
        </div>
      </TableCell>
      <TableCell>
        <div v-if="startDate" class="text-muted-foreground text-sm">
          {{ new Date(startDate).toLocaleDateString('fr-FR') }}
        </div>
        <div v-else class="text-muted-foreground">N/A</div>
      </TableCell>
      <TableCell>
        <div v-if="endDate" class="text-muted-foreground text-sm">
          {{ new Date(endDate).toLocaleDateString('fr-FR') }}
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
  import { TableCell } from '@/components/ui/table';
  import { useCrmAccess } from '@/composables/crm-access';
  import { Read as ReadRaw } from '@/components/dashboard/crud';
  import { Permissions } from '@/enums/permissions';
  import type { Fundraising } from '@/interfaces';
  import Image from '@/components/dashboard/Image.vue';
  import type { TableHeader } from '@/interfaces/table-header.interface';

  const Read = ReadRaw<Fundraising>;
  const tableHeaders: TableHeader<Fundraising>[] = [
    { text: 'Titre', sortKey: 'title' },
    { text: 'Image' },
    { text: 'Montant collecté' },
    { text: 'Date de début', sortKey: 'startDate' },
    { text: 'Date de fin', sortKey: 'endDate' },
  ];

  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const router = useRouter();
  const associationId = route.params.id as string;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const calculatePercentage = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.round((current / target) * 100);
  };

  onBeforeMount(async () => {
    const canAccessToFundraisings = member.role.permissions.some(
      (permission) => permission === Permissions.ALL
    );
    if (!canAccessToFundraisings) {
      router.push('/unauthorized');
      return;
    }
  });
</script>
