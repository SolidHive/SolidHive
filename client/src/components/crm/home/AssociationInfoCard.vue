<template>
  <div class="bg-card overflow-hidden rounded-lg border p-3 shadow-sm sm:p-4 md:p-6">
    <div class="space-y-4 sm:space-y-6">
      <!-- Logo et Image de couverture -->
      <div class="grid gap-3 sm:gap-4 md:grid-cols-2">
        <div>
          <label class="text-sm font-medium">Logo</label>
          <div
            class="bg-muted mt-2 flex h-32 items-center justify-center rounded-lg border-2 border-dashed"
          >
            <img
              v-if="association.logo"
              :key="imageKey"
              :src="association.logo"
              alt="Logo"
              class="max-h-full max-w-full object-contain"
            />
            <span v-else class="text-muted-foreground text-sm">Aucun logo</span>
          </div>
        </div>
        <div>
          <label class="text-sm font-medium">Image de couverture</label>
          <div
            class="bg-muted mt-2 flex h-32 items-center justify-center rounded-lg border-2 border-dashed"
          >
            <img
              v-if="association.image"
              :key="imageKey"
              :src="association.image"
              alt="Image de couverture"
              class="max-h-full max-w-full object-contain"
            />
            <span v-else class="text-muted-foreground text-sm">Aucune image</span>
          </div>
        </div>
      </div>

      <!-- Informations principales -->
      <div class="grid gap-3 sm:gap-4 md:grid-cols-2">
        <div>
          <label class="text-muted-foreground text-xs sm:text-sm">Nom de l'association</label>
          <p class="mt-1 font-medium break-all">{{ association.name }}</p>
        </div>
        <div>
          <label class="text-muted-foreground text-xs sm:text-sm">Statut</label>
          <p class="mt-1 font-medium capitalize">{{ getStatusLabel(association.status) }}</p>
        </div>
      </div>

      <div v-if="association.description">
        <label class="text-muted-foreground text-xs sm:text-sm">Description</label>
        <p class="mt-1 text-sm wrap-break-word sm:text-base">{{ association.description }}</p>
      </div>

      <div v-if="association.contact">
        <label class="text-muted-foreground text-xs sm:text-sm">Contact</label>
        <p class="mt-1 text-sm break-all sm:text-base">{{ association.contact }}</p>
      </div>

      <div>
        <label class="text-muted-foreground text-xs sm:text-sm">À propos</label>
        <p class="mt-1 text-sm wrap-break-word sm:text-base">
          {{ association.aboutText || 'Aucun texte à propos défini' }}
        </p>
      </div>

      <!-- Image à propos -->
      <div>
        <label class="text-sm font-medium">Image à propos</label>
        <div
          class="bg-muted mt-2 flex aspect-video items-center justify-center overflow-hidden rounded-lg border-2 border-dashed md:w-2/3 lg:w-1/2"
        >
          <img
            v-if="association.aboutImage"
            :key="imageKey"
            :src="association.aboutImage"
            alt="Image à propos"
            class="max-h-full max-w-full object-contain"
          />
          <span v-else class="text-muted-foreground text-sm">Aucune image à propos</span>
        </div>
      </div>

      <!-- Galerie d'images -->
      <div>
        <label class="text-sm font-medium">Galerie d'images</label>
        <div
          v-if="association.images && association.images.length > 0"
          class="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
        >
          <div
            v-for="(imageUrl, index) in association.images"
            :key="`${imageUrl}-${index}`"
            class="aspect-square overflow-hidden rounded-lg border"
          >
            <img
              :src="imageUrl"
              :alt="`Image de galerie ${index + 1}`"
              class="h-full w-full object-cover"
            />
          </div>
        </div>
        <div v-else class="mt-2">
          <div
            class="bg-muted flex h-32 items-center justify-center rounded-lg border-2 border-dashed"
          >
            <span class="text-muted-foreground text-sm">Aucune image pour la galerie</span>
          </div>
        </div>
      </div>

      <div v-if="association.siret">
        <label class="text-muted-foreground text-xs sm:text-sm">SIRET</label>
        <p class="mt-1 font-mono text-sm break-all sm:text-base">{{ association.siret }}</p>
      </div>

      <div v-if="association.additionalRequest" class="rounded-lg bg-yellow-50 p-3 sm:p-4">
        <label class="text-xs font-medium text-yellow-900 sm:text-sm">
          Demande d'informations supplémentaires
        </label>
        <p class="mt-1 text-xs wrap-break-word text-yellow-800 sm:text-sm">
          {{ association.additionalRequest }}
        </p>
      </div>

      <!-- Couleur -->
      <div v-if="association.primaryColor">
        <label class="text-muted-foreground text-xs sm:text-sm">Couleur principale</label>
        <div class="mt-1 flex items-center gap-2">
          <div
            class="h-6 w-6 rounded border sm:h-8 sm:w-8"
            :style="{ backgroundColor: association.primaryColor }"
          />
          <span class="font-mono text-xs break-all sm:text-sm">{{ association.primaryColor }}</span>
        </div>
      </div>

      <!-- Premium status -->
      <div class="mt-4">
        <label class="text-muted-foreground text-xs sm:text-sm">Statut premium</label>
        <div class="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <template v-if="association.paymentServiceValidUntil">
            <span class="text-xs font-medium sm:text-sm">
              Valide jusqu'au {{ formatDate(association.paymentServiceValidUntil) }}
            </span>
            <Button size="sm" variant="outline" :disabled="!invoiceUrl" @click="downloadInvoice">
              Voir la facture
            </Button>
          </template>
          <template v-else>
            <Button size="sm" variant="primary" class="mt-2" @click="goPremium">
              Découvrir Premium
            </Button>
          </template>
        </div>
      </div>

      <!-- Stripe -->
      <div v-if="association.stripeAccountId || showStripeForOwner">
        <label class="text-muted-foreground text-xs sm:text-sm">Stripe Connect</label>
        <div
          v-if="association.stripeAccountId"
          class="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2"
        >
          <span class="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Connecté</span>
          <span
            v-if="association.canReceiveDonations"
            class="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
          >
            Peut recevoir des dons
          </span>
          <span class="text-muted-foreground font-mono text-xs">
            {{ association.stripeAccountId }}
          </span>
        </div>
        <div v-else class="mt-1">
          <p class="text-muted-foreground mb-2 text-sm">Aucun compte Stripe Connect configuré</p>
        </div>
        <div v-if="showStripeForOwner" class="mt-3">
          <Button variant="outline" size="sm" @click="$emit('manage-stripe')">
            <CreditCard class="mr-2 h-4 w-4" />
            {{ association.stripeAccountId ? 'Gérer le compte Stripe' : 'Configurer Stripe' }}
          </Button>
        </div>
      </div>

      <!-- Actions -->
      <div class="border-t pt-4">
        <div class="flex flex-wrap gap-3">
          <Button v-if="canUpdate" variant="default" @click="$emit('edit')">
            <Pencil class="mr-2 h-4 w-4" />
            Modifier l'association
          </Button>
          <Button v-if="canDelete" variant="destructive" @click="$emit('delete')">
            <Trash2 class="mr-2 h-4 w-4" />
            Supprimer l'association
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Button from '@/components/ui/button/Button.vue';
  import type { Association } from '@/interfaces';
  import { Pencil, Trash2, CreditCard } from 'lucide-vue-next';
  import { ref, watch } from 'vue';
  import Database from '@/utils/database.utils';

  const props = defineProps<{
    association: Association;
    imageKey: number;
    canUpdate: boolean;
    canDelete: boolean;
    showStripeForOwner: boolean;
  }>();
  const { association, imageKey, canUpdate, canDelete, showStripeForOwner } = props; // destructure for ease of use

  defineEmits<{
    (e: 'edit'): void;
    (e: 'delete'): void;
    (e: 'manage-stripe'): void;
  }>();

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: 'En attente',
      accepted: 'Acceptée',
      rejected: 'Rejetée',
      additional_request: 'Informations requises',
      approved: 'Approuvée',
      active: 'Active',
      inactive: 'Inactive',
    };
    return statusMap[status] || status;
  };

  // premium invoice url
  const invoiceUrl = ref<string | null>(null);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const downloadInvoice = () => {
    if (invoiceUrl.value) {
      window.open(invoiceUrl.value, '_blank');
    }
  };

  const goPremium = () => {
    window.open('/about-premium', '_blank');
  };

  const fetchInvoice = async () => {
    if (!association.paymentServiceValidUntil) return;
    try {
      const res = await Database.getOne(`payments/premium/${association.id}/invoice`, '');
      if (res.transactionId) {
        invoiceUrl.value = `/files/Transaction/${res.transactionId}?purpose=invoice`;
      }
    } catch (err) {
      console.error('Erreur récupération facture premium', err);
    }
  };

  watch(
    () => association,
    (newVal) => {
      if (newVal) fetchInvoice();
    },
    { immediate: true }
  );
</script>
