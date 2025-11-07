<template>
  <div class="bg-card border-border rounded-3xl border p-6 shadow-sm">
    <LoadingOverlay v-if="isLoading" :show="true" message="Chargement de vos dons..." />

    <div v-else-if="donations.length > 0" class="space-y-4">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="font-subtitle text-foreground text-lg">
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
          :class="
            donation.relatedTo === 'Fundraising'
              ? 'border-border hover:border-secondary/30 bg-muted/20 group rounded-2xl border p-4 transition-all hover:shadow-sm'
              : 'border-border hover:border-primary/30 bg-muted/20 group rounded-2xl border p-4 transition-all hover:shadow-sm'
          "
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                :class="
                  donation.relatedTo === 'Fundraising'
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-primary/10 text-primary'
                "
                class="flex h-10 w-10 items-center justify-center rounded-xl"
              >
                <Heart class="h-5 w-5" />
              </div>
              <div>
                <h3
                  :class="
                    donation.relatedTo === 'Fundraising'
                      ? 'font-subtitle text-foreground group-hover:text-secondary text-base transition-colors'
                      : 'font-subtitle text-foreground group-hover:text-primary text-base transition-colors'
                  "
                >
                  {{ getEntityName(donation) }}
                </h3>
                <p class="font-paragraph text-muted-foreground text-sm">
                  {{ formatDate(donation.timestamps.createdAt) }}
                </p>
              </div>
            </div>

            <div class="text-right">
              <p class="font-title text-foreground text-lg font-bold">
                {{ formatCurrency(donation.amount) }}
              </p>
              <p class="font-paragraph text-muted-foreground text-xs">
                {{ getEntityType(donation) }} • ID: {{ donation.relatedBy.slice(-8) }}
              </p>
              <div v-if="donation.solidHiveAmount && donation.solidHiveAmount > 0" class="mt-1">
                <p
                  :class="
                    donation.relatedTo === 'Fundraising'
                      ? 'font-paragraph text-secondary text-xs'
                      : 'font-paragraph text-primary text-xs'
                  "
                >
                  Inclut {{ formatCurrency(donation.solidHiveAmount) }} pour SolidHive
                </p>
              </div>
            </div>
          </div>

          <!-- Informations supplémentaires -->
          <div class="mt-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
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
    associations: any[];
    fundraisings: any[];
    isLoading: boolean;
  }

  const props = defineProps<Props>();

  const totalAmount = computed(() =>
    props.donations.reduce((total, donation) => total + donation.amount, 0)
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

  // Fonction pour obtenir le nom de l'entité (association ou cagnotte)
  const getEntityName = (transaction: Transaction): string => {
    if (transaction.relatedTo === 'Fundraising') {
      const fundraising = props.fundraisings.find((f) => f.id === transaction.relatedBy);
      return fundraising ? fundraising.title : 'Cagnotte inconnue';
    } else {
      const association = props.associations.find((a) => a.id === transaction.relatedBy);
      return association ? association.name : 'Association inconnue';
    }
  };

  // Fonction pour obtenir le type d'entité
  const getEntityType = (transaction: Transaction): string => {
    return transaction.relatedTo === 'Fundraising' ? 'Cagnotte' : 'Association';
  };
</script>
