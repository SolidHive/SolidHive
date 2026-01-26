<template>
  <Header>
    <template #header>
      {{ event?.title || "Détail de l'événement" }}
    </template>
  </Header>

  <div class="px-2 py-4 sm:p-6 md:px-12">
    <div v-if="loading" class="flex justify-center py-12">
      <LoadingOverlay message="Chargement de l'événement..." />
    </div>

    <div v-else-if="!event" class="bg-muted rounded-lg p-12 text-center">
      <p class="text-muted-foreground">Événement introuvable</p>
    </div>

    <div v-else class="mx-auto max-w-6xl">
      <div class="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0 flex-1">
          <div class="mb-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              @click="router.push(`/crm/${crmStore.currentAssociationId}/events`)"
            >
              <ArrowLeft class="h-4 w-4" />
            </Button>
            <h1 class="line-clamp-2 text-xl font-bold break-words sm:text-2xl md:text-3xl">
              {{ event.title }}
            </h1>
          </div>
          <div
            class="text-muted-foreground flex flex-wrap items-center gap-2 text-xs sm:gap-4 sm:text-sm"
          >
            <span class="flex items-center gap-1">
              <Calendar class="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
              <span class="truncate">{{ formatDate(event.startDate) }}</span>
            </span>
            <span v-if="event.endDate" class="flex items-center gap-1">
              <ArrowRight class="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
              <span class="truncate">{{ formatDate(event.endDate) }}</span>
            </span>
          </div>
        </div>
        <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            v-if="crmAccess.canUpdateEvent"
            variant="outline"
            class="w-full sm:w-auto"
            @click="router.push(`/crm/${crmStore.currentAssociationId}/events/${event.id}/update`)"
          >
            <Pencil class="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button
            v-if="crmAccess.canDeleteEvent"
            variant="destructive"
            class="w-full sm:w-auto"
            @click="showDeleteDialog = true"
          >
            <Trash2 class="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      <!-- Image -->
      <div v-if="event.image" class="mb-4 aspect-video overflow-hidden rounded-lg sm:mb-6">
        <img :src="event.image" :alt="event.title" class="h-full w-full object-cover" />
      </div>

      <!-- Tabs -->
      <div class="mb-4 sm:mb-6">
        <div class="border-b">
          <div class="flex gap-2 overflow-x-auto sm:gap-4">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors sm:px-4 sm:py-3 sm:text-base"
              :class="
                currentTab === tab.id
                  ? 'border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              "
              @click="currentTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tab: Détails -->
      <div v-show="currentTab === 'details'" class="space-y-4 sm:space-y-6">
        <div class="bg-card overflow-hidden rounded-lg border p-3 sm:p-4 md:p-6">
          <h2 class="mb-3 text-lg font-bold sm:mb-4 sm:text-xl">Informations</h2>
          <div class="space-y-3">
            <div v-if="event.description">
              <label class="text-muted-foreground text-xs sm:text-sm">Description</label>
              <p class="mt-1 text-sm break-words sm:text-base">{{ event.description }}</p>
            </div>
            <div>
              <label class="text-muted-foreground text-xs sm:text-sm">Montant récolté</label>
              <p class="mt-1 text-sm font-medium sm:text-base">{{ totalAmount }}€</p>
            </div>
            <div v-if="event.address">
              <label class="text-muted-foreground text-xs sm:text-sm">Adresse</label>
              <div class="mt-1 text-sm break-words sm:text-base">
                <p>{{ event.address.street }}</p>
                <p>{{ event.address.postcode }} {{ event.address.city }}</p>
                <p v-if="event.address.state">{{ event.address.state }}</p>
                <p>{{ event.address.country }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Tarifs -->
      <div v-show="currentTab === 'pricings'" class="space-y-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-lg font-bold sm:text-xl">Tarifs de participation</h2>
          <Button
            v-if="crmAccess.canCreateEvent"
            class="w-full sm:w-auto"
            @click="showAddPricingDialog = true"
          >
            <Plus class="mr-2 h-4 w-4" />
            Ajouter un tarif
          </Button>
        </div>

        <div
          v-if="event.pricings && event.pricings.length > 0"
          class="grid gap-3 sm:gap-4 md:grid-cols-2"
        >
          <div
            v-for="pricing in event.pricings"
            :key="pricing.id"
            class="bg-card overflow-hidden rounded-lg border p-3 sm:p-4"
          >
            <div class="mb-2 flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <h3 class="text-sm font-bold break-words sm:text-base">{{ pricing.title }}</h3>
                <p class="text-primary text-lg font-bold sm:text-xl">{{ pricing.amount }}€</p>
              </div>
              <div class="flex flex-shrink-0 gap-1">
                <Button
                  v-if="crmAccess.canUpdateEvent"
                  variant="ghost"
                  size="sm"
                  @click="editPricing(pricing)"
                >
                  <Pencil class="h-4 w-4" />
                </Button>
                <Button
                  v-if="crmAccess.canDeleteEvent"
                  variant="ghost"
                  size="sm"
                  @click="confirmDeletePricing(pricing)"
                >
                  <Trash2 class="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            <p
              v-if="pricing.description"
              class="text-muted-foreground mb-2 text-xs break-words sm:text-sm"
            >
              {{ pricing.description }}
            </p>
            <div v-if="pricing.maxCapacity" class="text-muted-foreground text-xs sm:text-sm">
              <span class="font-medium">Capacité :</span>
              {{ pricing.availableCapacity ?? pricing.maxCapacity }} / {{ pricing.maxCapacity }}
            </div>
          </div>
        </div>

        <div v-else class="bg-muted rounded-lg p-12 text-center">
          <p class="text-muted-foreground">Aucun tarif défini</p>
        </div>
      </div>

      <!-- Tab: Inscrits -->
      <div v-show="currentTab === 'registrations'" class="space-y-4">
        <h2 class="text-xl font-bold">Participants inscrits</h2>

        <div v-if="loadingRegistrations" class="flex justify-center py-12">
          <LoadingOverlay message="Chargement des inscriptions..." />
        </div>

        <div v-else-if="registrations.length === 0" class="bg-muted rounded-lg p-12 text-center">
          <p class="text-muted-foreground">Aucune inscription pour le moment</p>
        </div>

        <div v-else class="bg-card rounded-lg border">
          <table class="w-full">
            <thead class="border-b">
              <tr>
                <th class="p-4 text-left text-sm font-medium">Participant</th>
                <th class="p-4 text-left text-sm font-medium">Email</th>
                <th class="p-4 text-left text-sm font-medium">Tarif</th>
                <th class="p-4 text-left text-sm font-medium">Date d'inscription</th>
                <th class="p-4 text-right text-sm font-medium">Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="registration in registrations"
                :key="registration.id"
                class="border-b last:border-b-0"
              >
                <td class="p-4">
                  <div>
                    {{ getParticipantName(registration) }}
                  </div>
                  <div
                    v-if="!registration.user"
                    class="text-muted-foreground mt-1 flex items-center gap-1 text-xs"
                  >
                    <span class="bg-muted rounded px-1.5 py-0.5">Invité</span>
                  </div>
                </td>
                <td class="text-muted-foreground p-4 text-sm">
                  {{ getParticipantEmail(registration) }}
                </td>
                <td class="p-4 text-sm">{{ registration.eventPricing?.title || '-' }}</td>
                <td class="text-muted-foreground p-4 text-sm">
                  {{ formatDate(registration.registeredAt) }}
                </td>
                <td class="p-4 text-right font-medium">
                  {{ Number(registration.eventPricing?.amount || 0).toFixed(2) }} €
                </td>
              </tr>
            </tbody>
          </table>

          <div class="border-t p-4">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Total des inscriptions</span>
              <span class="text-lg font-bold">{{ registrations.length }}</span>
            </div>
            <div class="mt-1 flex items-center justify-between">
              <span class="text-sm font-medium">Montant total collecté</span>
              <span class="text-primary text-lg font-bold">{{ totalAmount }} €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Dialog: Ajouter/Modifier un tarif -->
  <Dialog v-model:open="showAddPricingDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ editingPricing ? 'Modifier' : 'Ajouter' }} un tarif</DialogTitle>
      </DialogHeader>
      <div class="space-y-4 py-4">
        <div>
          <InputForm
            v-model="pricingForm.title"
            input-name="title"
            type="text"
            required
            placeholder="Tarif normal, réduit, etc."
            :error-message="getErrorMessage('title')"
            :error-state="showError('title')"
            @input="clearValidationErrors(validationErrors, 'title')"
            @blur="() => (touchedFields.title = true)"
          >
            <template #label>
              Titre
              <span class="text-destructive">*</span>
            </template>
          </InputForm>
        </div>
        <div>
          <InputForm
            v-model="pricingForm.amount"
            input-name="amount"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="0.00"
            :error-message="getErrorMessage('amount')"
            :error-state="showError('amount')"
            @input="clearValidationErrors(validationErrors, 'amount')"
            @blur="() => (touchedFields.amount = true)"
          >
            <template #label>
              Prix (€)
              <span class="text-destructive">*</span>
            </template>
          </InputForm>
        </div>
        <div>
          <TextareaForm
            v-model="pricingForm.description"
            input-name="description"
            :rows="3"
            required
            placeholder="Description du tarif"
            :error-message="getErrorMessage('description')"
            :error-state="showError('description')"
            @input="clearValidationErrors(validationErrors, 'description')"
            @blur="() => (touchedFields.description = true)"
          >
            <template #label>
              Description
              <span class="text-destructive">*</span>
            </template>
          </TextareaForm>
        </div>
        <div>
          <InputForm
            v-model="pricingForm.maxCapacity"
            input-name="maxCapacity"
            type="number"
            min="1"
            placeholder="Illimité"
            :error-message="getErrorMessage('maxCapacity')"
            :error-state="showError('maxCapacity')"
            @input="clearValidationErrors(validationErrors, 'maxCapacity')"
            @blur="() => (touchedFields.maxCapacity = true)"
          >
            <template #label>Capacité maximale</template>
          </InputForm>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showAddPricingDialog = false">Annuler</Button>
        <Button @click="savePricing">
          {{ editingPricing ? 'Modifier' : 'Ajouter' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Dialog: Supprimer l'événement -->
  <Dialog v-model:open="showDeleteDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Supprimer l'événement</DialogTitle>
        <DialogDescription>
          Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="showDeleteDialog = false">Annuler</Button>
        <Button variant="destructive" @click="deleteEvent">Supprimer</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Dialog: Supprimer un tarif -->
  <Dialog v-model:open="showDeletePricingDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Supprimer le tarif</DialogTitle>
        <DialogDescription>
          Êtes-vous sûr de vouloir supprimer le tarif "{{ pricingToDelete?.title }}" ? Cette action
          est irréversible.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="showDeletePricingDialog = false">Annuler</Button>
        <Button variant="destructive" @click="deletePricingConfirmed">Supprimer</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { ArrowLeft, ArrowRight, Calendar, Pencil, Plus, Trash2 } from 'lucide-vue-next';
  import Header from '@/components/dashboard/Header.vue';
  import Button from '@/components/ui/button/Button.vue';
  import InputForm from '@/components/form/InputForm.vue';
  import TextareaForm from '@/components/form/TextareaForm.vue';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
  import { useCrmStore } from '@/stores/crm';
  import { useCrmAccess } from '@/composables/crm-access';
  import Database from '@/utils/database.utils';
  import { singlePricingValidationSchema } from '@/utils/errors/crm/events';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';
  import { useToast } from 'vue-toastification';
  import type { Event, EventPricing, ParticipantCRM } from '@/interfaces';

  const route = useRoute();
  const router = useRouter();
  const crmStore = useCrmStore();
  const toast = useToast();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);

  const loading = ref(true);
  const loadingRegistrations = ref(false);
  const event = ref<Event | null>(null);
  const currentTab = ref('details');
  const showAddPricingDialog = ref(false);
  const showDeleteDialog = ref(false);
  const showDeletePricingDialog = ref(false);
  const editingPricing = ref<EventPricing | null>(null);
  const pricingToDelete = ref<EventPricing | null>(null);
  const registrations = ref<any[]>([]);
  const formSubmitted = ref(false);

  const tabs = [
    { id: 'details', label: 'Détails' },
    { id: 'pricings', label: 'Tarifs' },
    { id: 'registrations', label: 'Inscrits' },
  ];

  const pricingForm = reactive({
    title: '',
    description: '',
    amount: undefined as number | undefined,
    maxCapacity: undefined as number | undefined,
  });

  // Validation errors
  const validationErrors = reactive({
    title: '',
    description: '',
    amount: '',
    maxCapacity: '',
  });

  // Gestion des champs touchés
  const touchedFields = reactive({
    title: false,
    description: false,
    amount: false,
    maxCapacity: false,
  });

  const showError = (fieldName: keyof typeof touchedFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!validationErrors[fieldName];

  const getErrorMessage = (fieldName: keyof typeof touchedFields) =>
    touchedFields[fieldName] || formSubmitted.value ? validationErrors[fieldName] || '' : '';

  const validatePricingForm = async () => {
    const cleaned = {
      title: pricingForm.title?.trim() || '',
      description: pricingForm.description?.trim() || '',
      amount: pricingForm.amount,
      maxCapacity:
        pricingForm.maxCapacity === '' || pricingForm.maxCapacity == null
          ? undefined
          : pricingForm.maxCapacity,
    };
    const result = await validateWithYup(singlePricingValidationSchema as any, cleaned);

    if (result.isValid) {
      clearValidationErrors(validationErrors);
    } else {
      Object.assign(validationErrors, result.errors);
    }

    return result.isValid;
  };

  const resetPricingForm = () => {
    pricingForm.title = '';
    pricingForm.description = '';
    pricingForm.amount = undefined;
    pricingForm.maxCapacity = undefined;
    clearValidationErrors(validationErrors);
    Object.keys(touchedFields).forEach((key) => {
      touchedFields[key as keyof typeof touchedFields] = false;
    });
    formSubmitted.value = false;
  };

  const totalAmount = computed(() => {
    const total = registrations.value.reduce(
      (sum, reg) => sum + Number(reg.eventPricing?.amount || 0),
      0
    );
    return total.toFixed(2);
  });

  const getParticipantName = (registration: ParticipantCRM) => {
    const firstName = registration.participantFirstName?.trim() || '';
    const lastName = registration.participantLastName?.trim() || '';
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return 'Invité anonyme';
  };

  const getParticipantEmail = (registration: ParticipantCRM) => {
    return registration.user?.email || registration.participantEmail || '-';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const loadEvent = async () => {
    if (!crmStore.currentAssociationId) return;

    try {
      loading.value = true;
      const response = await Database.getOne(
        `association/${crmStore.currentAssociationId}/event`,
        route.params.eventId as string
      );
      event.value = response;
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error("Erreur lors du chargement de l'événement");
    } finally {
      loading.value = false;
    }
  };

  const loadRegistrations = async () => {
    if (!crmStore.currentAssociationId || !event.value) return;

    try {
      loadingRegistrations.value = true;
      const response = await Database.getAll(
        `association/${crmStore.currentAssociationId}/event/${event.value.id}/registers`
      );
      registrations.value = response || [];
    } catch (error) {
      console.error('Erreur lors du chargement des inscriptions:', error);
    } finally {
      loadingRegistrations.value = false;
    }
  };

  const editPricing = (pricing: EventPricing) => {
    editingPricing.value = pricing;
    pricingForm.title = pricing.title;
    pricingForm.description = pricing.description || '';
    pricingForm.amount = pricing.amount;
    pricingForm.maxCapacity = pricing.maxCapacity;
    showAddPricingDialog.value = true;
  };

  const savePricing = async () => {
    if (!crmStore.currentAssociationId || !event.value) return;

    formSubmitted.value = true;

    if (!(await validatePricingForm())) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    try {
      if (editingPricing.value) {
        await Database.update(
          `association/${crmStore.currentAssociationId}/event/${event.value.id}/pricing`,
          editingPricing.value.id,
          pricingForm
        );
        toast.success('Tarif modifié avec succès');
      } else {
        // Créer
        await Database.create(
          `association/${crmStore.currentAssociationId}/event/${event.value.id}/pricing`,
          pricingForm
        );
        toast.success('Tarif ajouté avec succès');
      }

      showAddPricingDialog.value = false;
      editingPricing.value = null;
      resetPricingForm();
      await loadEvent();
    } catch (error: any) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement du tarif");
    }
  };

  const confirmDeletePricing = (pricing: EventPricing) => {
    pricingToDelete.value = pricing;
    showDeletePricingDialog.value = true;
  };

  const deletePricingConfirmed = async () => {
    if (!crmStore.currentAssociationId || !event.value || !pricingToDelete.value) return;

    try {
      await Database.delete(
        `association/${crmStore.currentAssociationId}/event/${event.value.id}/pricing/${pricingToDelete.value.id}`
      );
      toast.success('Tarif supprimé avec succès');
      showDeletePricingDialog.value = false;
      pricingToDelete.value = null;
      await loadEvent();
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || 'Erreur lors de la suppression du tarif';
      toast.error(errorMessage);
    }
  };

  const deleteEvent = async () => {
    if (!crmStore.currentAssociationId || !event.value) return;

    try {
      await Database.delete(`association/${crmStore.currentAssociationId}/event/${event.value.id}`);
      toast.success('Événement supprimé avec succès');
      router.push(`/crm/${crmStore.currentAssociationId}/events`);
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || "Erreur lors de la suppression de l'événement";
      toast.error(errorMessage);
    }
  };
  onMounted(async () => {
    await loadEvent();
    await loadRegistrations();
  });
</script>
