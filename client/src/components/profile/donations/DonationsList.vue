<template>
  <div class="bg-card border-border rounded-3xl border p-4 shadow-sm sm:p-6">
    <LoadingOverlay v-if="isLoading" :show="true" message="Chargement de vos dons..." />

    <div v-else-if="donations.length > 0" class="space-y-4">
      <div class="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="font-subtitle text-foreground text-base sm:text-lg">
          {{ totalCount || donations.length }} don{{
            (totalCount || donations.length) > 1 ? 's' : ''
          }}
        </h2>
        <div class="text-right">
          <p class="font-paragraph text-muted-foreground text-sm">Total donné</p>
          <p class="font-title text-foreground text-xl font-bold">
            {{ formatCurrency(totalAmount || 0) }}
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
                <div class="flex items-center gap-2">
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
                  <span
                    v-if="donation.amount < 0"
                    class="bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-xs font-medium"
                  >
                    Remboursé
                  </span>
                </div>
                <p class="font-paragraph text-muted-foreground text-sm">
                  {{ formatDate(donation.timestamps.createdAt) }}
                </p>
              </div>
            </div>

            <div class="shrink-0 text-right">
              <p
                class="font-title text-foreground text-base font-bold sm:text-lg"
                :class="{ 'text-destructive': donation.amount < 0 }"
              >
                {{ formatCurrency(donation.amount) }}
              </p>
              <p class="font-paragraph text-muted-foreground text-xs">
                {{ getEntityType(donation) }} • ID: {{ donation.relatedBy.slice(-8) }}
              </p>
              <p v-if="donation.amount < 0" class="font-paragraph text-destructive text-xs">
                Remboursement
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

            <div class="flex flex-col gap-2 sm:flex-row sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                :class="[
                  'h-8 text-xs',
                  donation.relatedTo === 'Fundraising'
                    ? 'text-secondary hover:text-secondary hover:bg-secondary/10'
                    : donation.relatedTo === 'Event'
                      ? 'text-accent hover:text-accent hover:bg-accent/10'
                      : 'text-primary hover:text-primary hover:bg-primary/10',
                ]"
                :disabled="downloadingInvoices.has(donation.id)"
                @click="downloadInvoice(donation.id)"
              >
                <Loader2
                  v-if="downloadingInvoices.has(donation.id)"
                  class="mr-1.5 h-3 w-3 animate-spin"
                />
                <Receipt v-else class="mr-1.5 h-3 w-3" />
                {{
                  downloadingInvoices.has(donation.id) ? 'Téléchargement...' : 'Télécharger facture'
                }}
              </Button>
              <Button
                v-if="donation.relatedTo === 'Event' && canCancelRegistrations.has(donation.id)"
                variant="outline"
                size="sm"
                class="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground h-8 text-xs"
                @click="cancelRegistration(donation)"
              >
                <Loader2
                  v-if="cancellingRegistrations.has(donation.id)"
                  class="mr-1.5 h-3 w-3 animate-spin"
                />
                <X v-else class="mr-1.5 h-3 w-3" />
                {{
                  cancellingRegistrations.has(donation.id) ? 'Annulation...' : 'Annuler inscription'
                }}
              </Button>
            </div>
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

  <!-- Boîte de dialogue de confirmation d'annulation -->
  <Dialog v-model:open="showCancelDialog">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Confirmer l'annulation</DialogTitle>
        <DialogDescription>
          Êtes-vous sûr de vouloir annuler votre inscription à l'événement
          <strong>
            {{
              registrationToCancel?.event?.title ||
              `Événement ${registrationToCancel?.relatedBy.slice(-8)}`
            }}
          </strong>
          ?
          <br />
          <br />
          <span class="text-muted-foreground text-sm">
            • Cette annulation concerne toutes les inscriptions liées à ce paiement
            <br />
            • Le montant de {{ formatCurrency(registrationToCancel?.amount || 0) }} vous sera
            remboursé
            <br />
            • Le remboursement sera traité dans les 3-5 jours ouvrés
            <br />
            • Cette action est irréversible
          </span>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="flex gap-2 sm:gap-0">
        <Button
          variant="outline"
          :disabled="cancellingRegistrations.has(registrationToCancel?.id || '')"
          @click="showCancelDialog = false"
        >
          Annuler
        </Button>
        <Button
          variant="destructive"
          class="ml-2"
          :disabled="cancellingRegistrations.has(registrationToCancel?.id || '')"
          @click="confirmCancelRegistration"
        >
          <Loader2
            v-if="cancellingRegistrations.has(registrationToCancel?.id || '')"
            class="mr-2 h-4 w-4 animate-spin"
          />
          Confirmer l'annulation
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { Button } from '@/components/ui/button';
  import type { Transaction } from '@/interfaces';
  import { Heart, Receipt, Loader2, X } from 'lucide-vue-next';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import Database from '@/utils/database.utils';
  import { useToast } from 'vue-toastification';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';

  const downloadingInvoices = ref<Set<string>>(new Set());
  const canCancelRegistrations = ref<Set<string | number>>(new Set());
  const cancellingRegistrations = ref<Set<string | number>>(new Set());
  const toast = useToast();

  const showCancelDialog = ref(false);
  const registrationToCancel = ref<Transaction | null>(null);

  interface Props {
    donations: Transaction[];
    isLoading: boolean;
    totalCount?: number;
    totalAmount?: number;
  }

  interface Emits {
    (e: 'registration-cancelled', transactionId: string | number): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  // Gérer l'affichage des boutons d'annulation pour les inscriptions aux événements
  watch(
    () => props.donations,
    (newDonations) => {
      if (!newDonations || newDonations.length === 0) return;

      canCancelRegistrations.value.clear();

      for (const donation of newDonations) {
        if (donation.relatedTo !== 'Event') continue;
        if (donation.amount <= 0) continue;
        if (!donation.event?.startDate) continue;

        const eventDate = new Date(donation.event.startDate);
        const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        if (eventDate < sevenDaysFromNow) continue;

        // Vérifier si cette inscription a déjà été remboursée
        const hasMatchingRefund = newDonations.some(
          (transaction) =>
            transaction.relatedTo === 'Event' &&
            transaction.amount < 0 &&
            Math.abs(transaction.amount) === donation.amount &&
            transaction.relatedBy === donation.relatedBy &&
            transaction.user?.id === donation.user?.id &&
            new Date(transaction.timestamps.createdAt) > new Date(donation.timestamps.createdAt)
        );

        if (!hasMatchingRefund) {
          canCancelRegistrations.value.add(donation.id);
        }
      }
    },
    { immediate: true }
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
    if (!transaction.relatedTo) {
      // Essayer de deviner le type basé sur les propriétés disponibles
      if (transaction.event) return transaction.event.title || 'Événement inconnu';
      if (transaction.fundraising) return transaction.fundraising.title || 'Cagnotte inconnue';
      if (transaction.association) return transaction.association.name || 'Association inconnue';
      return 'Entité inconnue';
    }

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

  const downloadInvoice = async (transactionId: string) => {
    if (downloadingInvoices.value.has(transactionId)) return;

    downloadingInvoices.value.add(transactionId);
    try {
      const blob = await Database.downloadFile(`invoices/transaction/${transactionId}`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${transactionId.slice(-8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement de la facture:', error);
    } finally {
      downloadingInvoices.value.delete(transactionId);
    }
  };

  function cancelRegistration(registration: Transaction): void {
    registrationToCancel.value = registration;
    showCancelDialog.value = true;
  }

  async function confirmCancelRegistration(): Promise<void> {
    if (!registrationToCancel.value) return;

    const transactionId = registrationToCancel.value.id;
    if (cancellingRegistrations.value.has(transactionId)) return;

    cancellingRegistrations.value.add(transactionId);
    showCancelDialog.value = false;

    try {
      await Database.create(`associations/events/registers/cancel`, { transactionId });
      toast.success(
        'Votre inscription a été annulée avec succès. Le remboursement sera traité dans les prochains jours.'
      );
      emit('registration-cancelled', transactionId);
    } catch (error) {
      console.error("Erreur lors de l'annulation de l'inscription:", error);
      toast.error(
        "Une erreur est survenue lors de l'annulation de votre inscription. Veuillez réessayer."
      );
    } finally {
      cancellingRegistrations.value.delete(transactionId);
      registrationToCancel.value = null;
    }
  }
</script>
