<template>
  <Read
    :table-headers="tableHeaders"
    :fetch-items="`association/${associationId}/fundraisings`"
    :can-create-items="crmAccess.canCreateFundraising && hasStripeAccount"
    :can-update-items="crmAccess.canUpdateFundraising"
    :can-delete-items="crmAccess.canRemoveFundraising"
    :can-modify-specific-item="() => true"
    create-route-name="CRMFundraisingsCreate"
    update-route-name="CRMFundraisingsUpdate"
    delete-route-name="CRMFundraisingsDelete"
  >
    <template #header>Cagnottes</template>
    <template #add-button>Créer une cagnotte</template>

    <!-- Message d'avertissement si pas de compte Stripe -->
    <template #before-table>
      <div v-if="!hasStripeAccount" class="mb-6 border-l-4 border-yellow-400 bg-yellow-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <AlertTriangle class="h-5 w-5 text-yellow-400" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              <strong class="font-medium">Compte Stripe non configuré</strong>
              <br />
              Pour créer des cagnottes, vous devez d'abord activer votre compte Stripe dans les
              paramètres de votre association.
            </p>
          </div>
        </div>
      </div>
    </template>
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
  import { onBeforeMount, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { AlertTriangle } from 'lucide-vue-next';
  import { useCrmStore } from '@/stores/crm';
  import { TableCell } from '@/components/ui/table';
  import { useCrmAccess } from '@/composables/crm-access';
  import { Read as ReadRaw } from '@/components/dashboard/crud';
  import { Permissions } from '@/enums/permissions';
  import type { Fundraising } from '@/interfaces';
  import Image from '@/components/dashboard/Image.vue';
  import type { TableHeader } from '@/interfaces/table-header.interface';
  import Database from '@/utils/database.utils';

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
  const hasStripeAccount = ref(false);

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

  const checkStripeAccount = async () => {
    try {
      const association = await Database.getOne('association', associationId);
      hasStripeAccount.value = !!(association.stripeAccountId && association.canReceiveDonations);
    } catch (error) {
      console.error('Erreur lors de la vérification du compte Stripe:', error);
      hasStripeAccount.value = false;
    }
  };

  onBeforeMount(async () => {
    const canAccessToFundraisings = member.role.permissions.some(
      (permission) => permission === Permissions.ALL
    );
    if (!canAccessToFundraisings) {
      router.push('/unauthorized');
      return;
    }
    await checkStripeAccount();
  });
</script>
