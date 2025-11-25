<template>
  <Header />
  <div class="p-6 md:px-12">
    <div v-if="loading" class="flex justify-center py-12">
      <LoadingOverlay message="Chargement de l'événement..." />
    </div>

    <div v-else-if="!event" class="bg-muted rounded-lg p-12 text-center">
      <p class="text-muted-foreground">Événement introuvable</p>
    </div>

    <div v-else class="mx-auto max-w-6xl">
      <!-- Header -->
      <div class="mb-6 flex items-start justify-between">
        <div>
          <div class="mb-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              @click="router.push(`/crm/${crmStore.currentAssociationId}/events`)"
            >
              <ArrowLeft class="h-4 w-4" />
            </Button>
            <h1 class="text-3xl font-bold">{{ event.title }}</h1>
          </div>
          <div class="text-muted-foreground flex items-center gap-4 text-sm">
            <span class="flex items-center gap-1">
              <Calendar class="h-4 w-4" />
              {{ formatDate(event.startDate) }}
            </span>
            <span v-if="event.endDate" class="flex items-center gap-1">
              <ArrowRight class="h-4 w-4" />
              {{ formatDate(event.endDate) }}
            </span>
          </div>
        </div>
        <div class="flex gap-2">
          <Button
            v-if="crmAccess.canUpdateEvent"
            variant="outline"
            @click="router.push(`/crm/${crmStore.currentAssociationId}/events/${event.id}/edit`)"
          >
            <Pencil class="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button
            v-if="crmAccess.canDeleteEvent"
            variant="destructive"
            @click="showDeleteDialog = true"
          >
            <Trash2 class="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      <!-- Image -->
      <div v-if="event.image" class="mb-6 aspect-video overflow-hidden rounded-lg">
        <img :src="event.image" :alt="event.title" class="h-full w-full object-cover" />
      </div>

      <!-- Tabs -->
      <div class="mb-6">
        <div class="border-b">
          <div class="flex gap-4">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="border-b-2 px-4 py-3 font-medium transition-colors"
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
      <div v-show="currentTab === 'details'" class="space-y-6">
        <div class="bg-card rounded-lg border p-6">
          <h2 class="mb-4 text-xl font-bold">Informations</h2>
          <div class="space-y-3">
            <div v-if="event.description">
              <label class="text-muted-foreground text-sm">Description</label>
              <p class="mt-1">{{ event.description }}</p>
            </div>
            <div>
              <label class="text-muted-foreground text-sm">Montant récolté</label>
              <p class="mt-1 font-medium">{{ event.amount }}€</p>
            </div>
            <div v-if="event.address">
              <label class="text-muted-foreground text-sm">Adresse</label>
              <div class="mt-1">
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
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">Tarifs de participation</h2>
          <Button v-if="crmAccess.canCreateEvent" @click="showAddPricingDialog = true">
            <Plus class="mr-2 h-4 w-4" />
            Ajouter un tarif
          </Button>
        </div>

        <div v-if="event.pricings && event.pricings.length > 0" class="grid gap-4 md:grid-cols-2">
          <div
            v-for="pricing in event.pricings"
            :key="pricing.id"
            class="bg-card rounded-lg border p-4"
          >
            <div class="mb-2 flex items-start justify-between">
              <div>
                <h3 class="font-bold">{{ pricing.title }}</h3>
                <p class="text-primary text-xl font-bold">{{ pricing.amount }}€</p>
              </div>
              <div class="flex gap-1">
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
                  @click="deletePricing(pricing.id)"
                >
                  <Trash2 class="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            <p v-if="pricing.description" class="text-muted-foreground mb-2 text-sm">
              {{ pricing.description }}
            </p>
            <div v-if="pricing.maxCapacity" class="text-muted-foreground text-sm">
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
                  {{ registration.user?.firstName }} {{ registration.user?.lastName }}
                </td>
                <td class="text-muted-foreground p-4 text-sm">{{ registration.user?.email }}</td>
                <td class="p-4 text-sm">{{ registration.pricing?.title }}</td>
                <td class="text-muted-foreground p-4 text-sm">
                  {{ formatDate(registration.createdAt) }}
                </td>
                <td class="p-4 text-right font-medium">{{ registration.pricing?.amount }}€</td>
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
              <span class="text-primary text-lg font-bold">{{ totalAmount }}€</span>
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
          <label class="mb-1 block text-sm font-medium">Titre *</label>
          <input
            v-model="pricingForm.title"
            type="text"
            required
            placeholder="Tarif normal, réduit, etc."
            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">Prix (€) *</label>
          <input
            v-model.number="pricingForm.amount"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="0.00"
            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">Description</label>
          <textarea
            v-model="pricingForm.description"
            rows="3"
            placeholder="Description du tarif"
            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">Capacité maximale</label>
          <input
            v-model.number="pricingForm.maxCapacity"
            type="number"
            min="1"
            placeholder="Illimité"
            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showAddPricingDialog = false">Annuler</Button>
        <Button :disabled="!isPricingFormValid" @click="savePricing">
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
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { ArrowLeft, ArrowRight, Calendar, Pencil, Plus, Trash2 } from 'lucide-vue-next';
  import Header from '@/components/dashboard/Header.vue';
  import Button from '@/components/ui/button/Button.vue';
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
  import api from '@/utils/api.utils';
  import type { Event, EventPricing } from '@/interfaces';

  const route = useRoute();
  const router = useRouter();
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);

  const loading = ref(true);
  const loadingRegistrations = ref(false);
  const event = ref<Event | null>(null);
  const currentTab = ref('details');
  const showAddPricingDialog = ref(false);
  const showDeleteDialog = ref(false);
  const editingPricing = ref<EventPricing | null>(null);
  const registrations = ref<any[]>([]);

  const tabs = [
    { id: 'details', label: 'Détails' },
    { id: 'pricings', label: 'Tarifs' },
    { id: 'registrations', label: 'Inscrits' },
  ];

  const pricingForm = ref({
    title: '',
    description: '',
    amount: 0,
    maxCapacity: undefined as number | undefined,
  });

  const isPricingFormValid = computed(() => {
    return pricingForm.value.title.length >= 3 && pricingForm.value.amount >= 0;
  });

  const totalAmount = computed(() => {
    return registrations.value.reduce((sum, reg) => sum + (reg.pricing?.amount || 0), 0).toFixed(2);
  });

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
      console.error("Erreur lors du chargement de l'événement");
    } finally {
      loading.value = false;
    }
  };

  const loadRegistrations = async () => {
    if (!crmStore.currentAssociationId || !event.value) return;

    try {
      loadingRegistrations.value = true;
      const response = await api.get(
        `/association/${crmStore.currentAssociationId}/event/${event.value.id}/registers`
      );
      registrations.value = response.data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des inscriptions:', error);
    } finally {
      loadingRegistrations.value = false;
    }
  };

  const editPricing = (pricing: EventPricing) => {
    editingPricing.value = pricing;
    pricingForm.value = {
      title: pricing.title,
      description: pricing.description || '',
      amount: pricing.amount,
      maxCapacity: pricing.maxCapacity,
    };
    showAddPricingDialog.value = true;
  };

  const savePricing = async () => {
    if (!crmStore.currentAssociationId || !event.value) return;

    try {
      if (editingPricing.value) {
        // Modifier
        await Database.update(
          `association/${crmStore.currentAssociationId}/event/${event.value.id}/pricing`,
          editingPricing.value.id,
          pricingForm.value
        );
        console.log('Tarif modifié avec succès');
      } else {
        // Créer
        await Database.create(
          `association/${crmStore.currentAssociationId}/event/${event.value.id}/pricing`,
          pricingForm.value
        );
        console.log('Tarif ajouté avec succès');
      }

      showAddPricingDialog.value = false;
      editingPricing.value = null;
      pricingForm.value = { title: '', description: '', amount: 0, maxCapacity: undefined };
      await loadEvent();
    } catch (error: any) {
      console.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  const deletePricing = async (pricingId: string) => {
    if (!crmStore.currentAssociationId || !event.value) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tarif ?')) return;

    try {
      await Database.delete(
        `association/${crmStore.currentAssociationId}/event/${event.value.id}/pricing/${pricingId}`
      );
      console.log('Tarif supprimé avec succès');
      await loadEvent();
    } catch (error: any) {
      console.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const deleteEvent = async () => {
    if (!crmStore.currentAssociationId || !event.value) return;

    try {
      await Database.delete(`association/${crmStore.currentAssociationId}/event/${event.value.id}`);
      console.log('Événement supprimé avec succès');
      router.push(`/crm/${crmStore.currentAssociationId}/events`);
    } catch (error: any) {
      console.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };
  onMounted(async () => {
    await loadEvent();
    if (currentTab.value === 'registrations') {
      await loadRegistrations();
    }
  });
</script>
