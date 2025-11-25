<template>
  <!-- Mes dons aux associations -->
  <div class="bg-card border-border rounded-3xl border p-6 shadow-sm">
    <div class="mb-5 flex items-center justify-between">
      <h2 class="font-subtitle text-foreground text-lg">Mes dons aux associations</h2>
      <Button variant="outline" size="sm" as-child>
        <router-link to="/profile/donations">
          <Heart class="mr-1.5 h-4 w-4" />
          Voir tout
        </router-link>
      </Button>
    </div>

    <!-- Liste des dons aux associations -->
    <LoadingOverlay v-if="isLoading" :show="true" message="Chargement de vos dons..." />

    <div v-else-if="recentDonations.length > 0" class="space-y-3">
      <div
        v-for="donation in recentDonations"
        :key="donation.id"
        class="border-border hover:border-primary/30 bg-muted/20 group rounded-2xl border p-4 transition-all hover:shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl"
            >
              <Heart class="h-5 w-5" />
            </div>
            <div>
              <h3
                class="font-subtitle text-foreground group-hover:text-primary text-base transition-colors"
              >
                {{ getAssociationName(donation.relatedBy) }}
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
              Association • ID: {{ donation.relatedBy.slice(-8) }}
            </p>
            <div v-if="donation.solidHiveAmount && donation.solidHiveAmount > 0" class="mt-1">
              <p class="font-paragraph text-primary text-xs">
                Inclut {{ formatCurrency(donation.solidHiveAmount) }} pour SolidHive
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Placeholder si aucun don aux associations -->
    <div v-else class="bg-muted/20 rounded-2xl py-8 text-center">
      <Heart class="text-muted-foreground mx-auto mb-3 h-8 w-8" :stroke-width="1.5" />
      <p class="font-paragraph text-muted-foreground mb-2 text-sm">Aucun don aux associations</p>
      <p class="font-paragraph text-muted-foreground text-xs">
        Vos dons aux associations apparaîtront ici
      </p>
    </div>
  </div>

  <!-- Mes dons aux cagnottes -->
  <div class="bg-card border-border rounded-3xl border p-6 shadow-sm">
    <div class="mb-5 flex items-center justify-between">
      <h2 class="font-subtitle text-foreground text-lg">Mes dons aux cagnottes</h2>
      <Button variant="outline" size="sm" as-child>
        <router-link to="/profile/donations">
          <Heart class="mr-1.5 h-4 w-4" />
          Voir tout
        </router-link>
      </Button>
    </div>

    <!-- Liste des dons aux cagnottes -->
    <LoadingOverlay v-if="isLoading" :show="true" message="Chargement de vos dons..." />

    <div v-else-if="recentFundraisingDonations.length > 0" class="space-y-3">
      <div
        v-for="donation in recentFundraisingDonations"
        :key="donation.id"
        class="border-border hover:border-secondary/30 bg-muted/20 group rounded-2xl border p-4 transition-all hover:shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="bg-secondary/10 text-secondary flex h-10 w-10 items-center justify-center rounded-xl"
            >
              <Heart class="h-5 w-5" />
            </div>
            <div>
              <h3
                class="font-subtitle text-foreground group-hover:text-secondary text-base transition-colors"
              >
                {{ getFundraisingName(donation.relatedBy) }}
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
              Cagnotte • ID: {{ donation.relatedBy.slice(-8) }}
            </p>
            <div v-if="donation.solidHiveAmount && donation.solidHiveAmount > 0" class="mt-1">
              <p class="font-paragraph text-secondary text-xs">
                Inclut {{ formatCurrency(donation.solidHiveAmount) }} pour SolidHive
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Placeholder si aucun don aux cagnottes -->
    <div v-else class="bg-muted/20 rounded-2xl py-8 text-center">
      <Heart class="text-muted-foreground mx-auto mb-3 h-8 w-8" :stroke-width="1.5" />
      <p class="font-paragraph text-muted-foreground mb-2 text-sm">Aucun don aux cagnottes</p>
      <p class="font-paragraph text-muted-foreground text-xs">
        Vos dons aux cagnottes apparaîtront ici
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/components/ui/button';
  import { Heart } from 'lucide-vue-next';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import type { Transaction } from '@/interfaces';

  interface Props {
    recentDonations: Transaction[];
    recentFundraisingDonations: Transaction[];
    isLoading: boolean;
  }

  defineProps<Props>();

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  function getAssociationName(associationId: string): string {
    // Pour l'instant, on affiche juste l'ID jusqu'à ce que les transactions contiennent les noms
    return `Association ${associationId.slice(-8)}`;
  }

  function getFundraisingName(fundraisingId: string): string {
    // Pour l'instant, on affiche juste l'ID jusqu'à ce que les transactions contiennent les noms
    return `Cagnotte ${fundraisingId.slice(-8)}`;
  }
</script>
