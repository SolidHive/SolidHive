<template>
  <div class="bg-card border-border rounded-3xl border p-4 shadow-sm sm:p-6">
    <LoadingOverlay v-if="isLoading" :show="true" message="Chargement de vos dons..." />

    <div v-else-if="donations.length > 0" class="space-y-4">
      <div class="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="font-subtitle text-foreground text-base sm:text-lg">
          {{ donations.length }} don{{ donations.length > 1 ? 's' : '' }}
        </h2>
        <div class="text-right">
          <p class="font-paragraph text-muted-foreground text-sm">Total donné</p>
          <p class="font-title text-foreground text-xl font-bold">
            {{ formatCurrency(totalAmount) }}
          </p>
        </div>
      </div>

      <!-- Liste des dons -->
      <div class="space-y-3">
        <div
          v-for="donation in donations"
          :key="donation.id"
          :class="[
            'border-border bg-muted/20 group rounded-2xl border p-3 transition-all hover:shadow-sm sm:p-4',
            donation.relatedTo === 'Fundraising'
              ? 'hover:border-secondary/30'
              : donation.relatedTo === 'Event'
                ? 'hover:border-accent/30'
                : 'hover:border-primary/30',
          ]"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <div
                :class="[
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10',
                  donation.relatedTo === 'Fundraising'
                    ? 'bg-secondary/10 text-secondary'
                    : donation.relatedTo === 'Event'
                      ? 'bg-accent/10 text-accent'
                      : 'bg-primary/10 text-primary',
                ]"
              >
                <Heart class="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div class="min-w-0 flex-1">
                <h3
                  :class="[
                    'font-subtitle text-foreground truncate text-sm transition-colors sm:text-base',
                    donation.relatedTo === 'Fundraising'
                      ? 'group-hover:text-secondary'
                      : donation.relatedTo === 'Event'
                        ? 'group-hover:text-accent'
                        : 'group-hover:text-primary',
                  ]"
                >
                  {{ getEntityName(donation) }}
                </h3>
                <p class="font-paragraph text-muted-foreground text-sm">
                  {{ formatDate(donation.timestamps.createdAt) }}
                </p>
              </div>
            </div>

            <div class="shrink-0 text-right">
              <p class="font-title text-foreground text-base font-bold sm:text-lg">
                {{ formatCurrency(donation.amount) }}
              </p>
              <p class="font-paragraph text-muted-foreground text-xs">
                {{ getEntityType(donation) }} • ID: {{ donation.relatedBy.slice(-8) }}
              </p>
              <div v-if="donation.solidHiveAmount && donation.solidHiveAmount > 0" class="mt-1">
                <p
                  :class="[
                    'font-paragraph text-xs',
                    donation.relatedTo === 'Fundraising'
                      ? 'text-secondary'
                      : donation.relatedTo === 'Event'
                        ? 'text-accent'
                        : 'text-primary',
                  ]"
                >
                  Inclut {{ formatCurrency(donation.solidHiveAmount) }} pour SolidHive
                </p>
              </div>
            </div>
          </div>

          <!-- Informations supplémentaires -->
          <div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-wrap items-center gap-2">
              <div class="rounded-lg bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                Confirmé
              </div>
              <span class="font-paragraph text-muted-foreground text-xs">
                Transaction #{{ donation.id.slice(-8) }}
              </span>
            </div>

            <Button variant="ghost" size="sm" class="h-8 text-xs">
              <Receipt class="mr-1.5 h-3 w-3" />
              Facture (bientôt)
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-else class="py-12 text-center">
      <Heart class="text-muted-foreground mx-auto mb-4 h-12 w-12" :stroke-width="1.5" />
      <h3 class="font-subtitle text-foreground mb-2 text-lg">Aucun don trouvé</h3>
      <p class="font-paragraph text-muted-foreground mb-6 text-sm">
        Vous n'avez pas encore fait de don. Découvrez les associations qui ont besoin de votre
        soutien !
      </p>
      <Button as-child>
        <router-link to="/associations">Explorer les associations</router-link>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Button } from '@/components/ui/button';
  import type { Transaction } from '@/interfaces';
  import { Heart, Receipt } from 'lucide-vue-next';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';

  interface Props {
    donations: Transaction[];
    isLoading: boolean;
  }

  const props = defineProps<Props>();

  const totalAmount = computed(() =>
    props.donations.reduce((total: number, donation: Transaction) => total + donation.amount, 0)
  );

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Fonction pour obtenir le nom de l'entité (association, cagnotte ou événement)
  const getEntityName = (transaction: Transaction): string => {
    if (transaction.relatedTo === 'Fundraising') {
      return transaction.fundraising?.title || 'Cagnotte inconnue';
    } else if (transaction.relatedTo === 'Event') {
      return transaction.event?.title || 'Événement inconnu';
    } else {
      return transaction.association?.name || 'Association inconnue';
    }
  };

  // Fonction pour obtenir le type d'entité
  const getEntityType = (transaction: Transaction): string => {
    if (transaction.relatedTo === 'Fundraising') return 'Cagnotte';
    if (transaction.relatedTo === 'Event') return 'Inscription événement';
    return 'Association';
  };
</script>
