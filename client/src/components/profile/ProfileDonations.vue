<template>
  <!-- Mes dons aux associations -->
  <div class="bg-card border-border rounded-3xl border p-4 shadow-sm sm:p-6">
    <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        class="border-border hover:border-primary/30 bg-muted/20 group rounded-2xl border p-3 transition-all hover:shadow-sm sm:p-4"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div
              class="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10"
            >
              <Heart class="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div class="min-w-0 flex-1">
              <h3
                class="font-subtitle text-foreground group-hover:text-primary truncate text-sm transition-colors sm:text-base"
              >
                {{ getAssociationName(donation) }}
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

        <div class="mt-3 border-t border-gray-100 pt-3">
          <Button
            variant="ghost"
            size="sm"
            class="text-primary hover:text-primary hover:bg-primary/10 h-8 w-full text-xs sm:w-auto"
            :disabled="downloadingInvoices.has(donation.id)"
            @click="downloadInvoice(donation.id)"
          >
            <Loader2
              v-if="downloadingInvoices.has(donation.id)"
              class="mr-1.5 h-3 w-3 animate-spin"
            />
            <Receipt v-else class="mr-1.5 h-3 w-3" />
            {{ downloadingInvoices.has(donation.id) ? 'Téléchargement...' : 'Télécharger facture' }}
          </Button>
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
  <div class="bg-card border-border rounded-3xl border p-4 shadow-sm sm:p-6">
    <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        class="border-border hover:border-secondary/30 bg-muted/20 group rounded-2xl border p-3 transition-all hover:shadow-sm sm:p-4"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div
              class="bg-secondary/10 text-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10"
            >
              <Heart class="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div class="min-w-0 flex-1">
              <h3
                class="font-subtitle text-foreground group-hover:text-secondary truncate text-sm transition-colors sm:text-base"
              >
                {{ getFundraisingName(donation) }}
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

        <div class="mt-3 border-t border-gray-100 pt-3">
          <Button
            variant="ghost"
            size="sm"
            class="text-secondary hover:text-secondary hover:bg-secondary/10 h-8 w-full text-xs sm:w-auto"
            :disabled="downloadingInvoices.has(donation.id)"
            @click="downloadInvoice(donation.id)"
          >
            <Loader2
              v-if="downloadingInvoices.has(donation.id)"
              class="mr-1.5 h-3 w-3 animate-spin"
            />
            <Receipt v-else class="mr-1.5 h-3 w-3" />
            {{ downloadingInvoices.has(donation.id) ? 'Téléchargement...' : 'Télécharger facture' }}
          </Button>
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

  <!-- Mes inscriptions aux événements -->
  <div class="bg-card border-border rounded-3xl border p-4 shadow-sm sm:p-6">
    <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="font-subtitle text-foreground text-lg">Mes inscriptions aux événements</h2>
      <Button variant="outline" size="sm" as-child>
        <router-link to="/profile/donations?type=evenements">
          <Heart class="mr-1.5 h-4 w-4" />
          Voir tout
        </router-link>
      </Button>
    </div>

    <!-- Liste des inscriptions aux événements -->
    <LoadingOverlay v-if="isLoading" :show="true" message="Chargement de vos inscriptions..." />

    <div v-else-if="recentEventRegistrations.length > 0" class="space-y-3">
      <div
        v-for="registration in recentEventRegistrations.slice(0, 3)"
        :key="registration.id"
        class="border-border hover:border-accent/30 bg-muted/20 group rounded-2xl border p-3 transition-all hover:shadow-sm sm:p-4"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div
              class="bg-accent/10 text-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10"
            >
              <Heart class="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <h3
                  class="font-subtitle text-foreground group-hover:text-accent truncate text-sm transition-colors sm:text-base"
                >
                  {{ getEventName(registration) }}
                </h3>
                <span
                  v-if="registration.amount < 0"
                  class="bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-xs font-medium"
                >
                  Remboursé
                </span>
              </div>
              <p class="font-paragraph text-muted-foreground text-sm">
                {{ formatDate(registration.timestamps.createdAt) }}
              </p>
            </div>
          </div>

          <div class="shrink-0 text-right">
            <p
              class="font-title text-foreground text-base font-bold sm:text-lg"
              :class="{ 'text-destructive': registration.amount < 0 }"
            >
              {{ formatCurrency(registration.amount) }}
            </p>
            <p class="font-paragraph text-muted-foreground truncate text-xs">
              Événement • ID: {{ registration.relatedBy.slice(-8) }}
            </p>
            <p v-if="registration.amount < 0" class="font-paragraph text-destructive text-xs">
              Remboursement
            </p>
          </div>
        </div>

        <div class="mt-3 border-t border-gray-100 pt-3">
          <div class="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              class="text-accent hover:text-accent hover:bg-accent/10 h-8 flex-1 text-xs sm:flex-none"
              :disabled="downloadingInvoices.has(registration.id)"
              @click="downloadInvoice(registration.id)"
            >
              <Loader2
                v-if="downloadingInvoices.has(registration.id)"
                class="mr-1.5 h-3 w-3 animate-spin"
              />
              <Receipt v-else class="mr-1.5 h-3 w-3" />
              {{
                downloadingInvoices.has(registration.id)
                  ? 'Téléchargement...'
                  : 'Télécharger facture'
              }}
            </Button>
            <Button
              v-if="canCancelRegistrations.has(registration.id)"
              variant="outline"
              size="sm"
              class="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground h-8 flex-1 text-xs sm:flex-none"
              @click="cancelRegistration(registration)"
            >
              <Loader2
                v-if="cancellingRegistrations.has(registration.id)"
                class="mr-1.5 h-3 w-3 animate-spin"
              />
              <X v-else class="mr-1.5 h-3 w-3" />
              {{
                cancellingRegistrations.has(registration.id)
                  ? 'Annulation...'
                  : 'Annuler inscription'
              }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Placeholder si aucune inscription -->
    <div v-else class="bg-muted/20 rounded-2xl py-8 text-center">
      <Heart class="text-muted-foreground mx-auto mb-3 h-8 w-8" :stroke-width="1.5" />
      <p class="font-paragraph text-muted-foreground mb-2 text-sm">
        Aucune inscription aux événements
      </p>
      <p class="font-paragraph text-muted-foreground text-xs">
        Vos inscriptions aux événements apparaîtront ici
      </p>
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
  import { ref, onMounted, watch } from 'vue';
  import { Button } from '@/components/ui/button';
  import { Heart, Receipt, Loader2, X } from 'lucide-vue-next';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import type { Transaction } from '@/interfaces';
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

  interface Props {
    recentDonations: Transaction[];
    recentFundraisingDonations: Transaction[];
    recentEventRegistrations: Transaction[];
    isLoading: boolean;
  }

  interface Emits {
    (e: 'registration-cancelled', transactionId: string | number): void;
  }

  const downloadingInvoices = ref<Set<string | number>>(new Set());
  const canCancelRegistrations = ref<Set<string | number>>(new Set());
  const cancellingRegistrations = ref<Set<string | number>>(new Set());
  const toast = useToast();

  const showCancelDialog = ref(false);
  const registrationToCancel = ref<Transaction | null>(null);

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  onMounted(() => {});

  // Gérer l'affichage des boutons d'annulation pour les inscriptions aux événements
  watch(
    () => props.recentEventRegistrations,
    (newRegistrations) => {
      if (!newRegistrations || newRegistrations.length === 0) return;

      canCancelRegistrations.value.clear();

      for (const registration of newRegistrations) {
        if (registration.amount <= 0) continue;
        if (!registration.event?.startDate) continue;

        const eventDate = new Date(registration.event.startDate);
        const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        if (eventDate < sevenDaysFromNow) continue;

        // Vérifier si cette inscription a déjà été remboursée
        const hasMatchingRefund = newRegistrations.some(
          (transaction) =>
            transaction.amount < 0 &&
            Math.abs(transaction.amount) === registration.amount &&
            transaction.relatedBy === registration.relatedBy &&
            transaction.user?.id === registration.user?.id &&
            new Date(transaction.timestamps.createdAt) > new Date(registration.timestamps.createdAt)
        );

        if (!hasMatchingRefund) {
          canCancelRegistrations.value.add(registration.id);
        }
      }
    },
    { immediate: true }
  );

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

  function getAssociationName(donation: Transaction): string {
    return donation.association?.name || `Association ${donation.relatedBy.slice(-8)}`;
  }

  function getFundraisingName(donation: Transaction): string {
    return donation.fundraising?.title || `Cagnotte ${donation.relatedBy.slice(-8)}`;
  }

  function getEventName(registration: Transaction): string {
    return registration.event?.title || `Événement ${registration.relatedBy.slice(-8)}`;
  }

  async function downloadInvoice(transactionId: string): Promise<void> {
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
  }
</script>
