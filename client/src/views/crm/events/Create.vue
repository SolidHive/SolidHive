<template>
  <Header />
  <div class="p-6 md:px-12">
    <div class="mx-auto max-w-4xl">
      <div class="mb-6 flex items-start justify-between">
        <div>
          <h1 class="text-3xl font-bold">Créer un événement</h1>
          <p class="text-muted-foreground mt-1">Étape {{ currentStep }} sur 3</p>
        </div>
        <Button
          variant="outline"
          @click="router.push(`/crm/${crmStore.currentAssociationId}/events`)"
        >
          Annuler
        </Button>
      </div>

      <!-- Stepper -->
      <div class="mb-8 flex items-center justify-between">
        <div
          v-for="step in steps"
          :key="step.number"
          class="flex flex-1 items-center"
          :class="{ 'opacity-40': step.number > currentStep }"
        >
          <div class="flex items-center">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold"
              :class="
                step.number <= currentStep
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border'
              "
            >
              {{ step.number }}
            </div>
            <span class="ml-2 hidden font-medium md:inline">{{ step.title }}</span>
          </div>
          <div
            v-if="step.number < steps.length"
            class="border-border mx-2 flex-1 border-t-2"
            :class="{ 'border-primary': step.number < currentStep }"
          />
        </div>
      </div>

      <!-- Step 1: Informations de l'événement -->
      <div v-show="currentStep === 1" class="bg-card rounded-lg border p-6 shadow-sm">
        <h2 class="mb-4 text-xl font-bold">Informations de l'événement</h2>
        <div class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium">Titre *</label>
            <input
              v-model="form.title"
              type="text"
              required
              placeholder="Nom de l'événement"
              class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium">Description</label>
            <textarea
              v-model="form.description"
              rows="4"
              placeholder="Description de l'événement"
              class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium">Date de début *</label>
              <input
                v-model="form.startDate"
                type="datetime-local"
                required
                class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">Date de fin</label>
              <input
                v-model="form.endDate"
                type="datetime-local"
                class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              />
            </div>
          </div>

          <!-- Adresse -->
          <div class="border-t pt-4">
            <h3 class="mb-3 font-medium">Adresse</h3>
            <div class="space-y-4">
              <div>
                <label class="mb-1 block text-sm font-medium">Rue *</label>
                <input
                  v-model="form.address.street"
                  type="text"
                  required
                  placeholder="123 rue de la Paix"
                  class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                />
              </div>
              <div class="grid gap-4 md:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-medium">Ville *</label>
                  <input
                    v-model="form.address.city"
                    type="text"
                    required
                    placeholder="Paris"
                    class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium">Code postal *</label>
                  <input
                    v-model="form.address.postcode"
                    type="text"
                    required
                    placeholder="75001"
                    class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  />
                </div>
              </div>
              <div class="grid gap-4 md:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-medium">Région</label>
                  <input
                    v-model="form.address.state"
                    type="text"
                    placeholder="Île-de-France"
                    class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium">Pays *</label>
                  <input
                    v-model="form.address.country"
                    type="text"
                    required
                    placeholder="France"
                    class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Image -->
          <div class="border-t pt-4">
            <ImageUpload
              v-model="imageFile"
              v-model:preview="imagePreview"
              label="Image de l'événement"
              button-text="Ajouter une image"
              help-text="Format recommandé : JPG ou PNG (max 5 Mo)"
            />
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <Button :disabled="!isStep1Valid" @click="nextStep">Suivant</Button>
        </div>
      </div>

      <!-- Step 2: Tarifs -->
      <div v-show="currentStep === 2" class="bg-card rounded-lg border p-6 shadow-sm">
        <h2 class="mb-4 text-xl font-bold">Tarifs de participation</h2>
        <p class="text-muted-foreground mb-4 text-sm">
          Ajoutez différents types de tarifs pour votre événement
        </p>

        <div class="mb-4 space-y-4">
          <div
            v-for="(pricing, index) in pricings"
            :key="index"
            class="border-border rounded-lg border p-4"
          >
            <div class="mb-2 flex items-center justify-between">
              <span class="font-medium">Tarif {{ index + 1 }}</span>
              <Button
                v-if="pricings.length > 1"
                variant="ghost"
                size="sm"
                @click="removePricing(index)"
              >
                <Trash2 class="h-4 w-4 text-red-500" />
              </Button>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium">Titre *</label>
                <input
                  v-model="pricing.title"
                  type="text"
                  required
                  placeholder="Tarif normal, réduit, etc."
                  class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium">Prix (€) *</label>
                <input
                  v-model.number="pricing.amount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="0.00"
                  class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                />
              </div>
            </div>
            <div class="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium">Description</label>
                <input
                  v-model="pricing.description"
                  type="text"
                  placeholder="Description du tarif"
                  class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium">Capacité max</label>
                <input
                  v-model.number="pricing.maxCapacity"
                  type="number"
                  min="1"
                  placeholder="Illimité"
                  class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <Button variant="outline" class="mb-6 w-full" @click="addPricing">
          <Plus class="mr-2 h-4 w-4" />
          Ajouter un tarif
        </Button>

        <div class="flex justify-between">
          <Button variant="outline" @click="previousStep">Précédent</Button>
          <Button :disabled="!isStep2Valid" @click="nextStep">Suivant</Button>
        </div>
      </div>

      <!-- Step 3: Confirmation -->
      <div v-show="currentStep === 3" class="bg-card rounded-lg border p-6 shadow-sm">
        <h2 class="mb-4 text-xl font-bold">Récapitulatif</h2>

        <div class="space-y-6">
          <div>
            <h3 class="mb-2 font-medium">Informations générales</h3>
            <div class="text-muted-foreground space-y-1 text-sm">
              <p>
                <strong>Titre :</strong>
                {{ form.title }}
              </p>
              <p v-if="form.description">
                <strong>Description :</strong>
                {{ form.description }}
              </p>
              <p>
                <strong>Date de début :</strong>
                {{ formatDate(form.startDate) }}
              </p>
              <p v-if="form.endDate">
                <strong>Date de fin :</strong>
                {{ formatDate(form.endDate) }}
              </p>
            </div>
          </div>

          <div>
            <h3 class="mb-2 font-medium">Adresse</h3>
            <div class="text-muted-foreground text-sm">
              <p>{{ form.address.street }}</p>
              <p>{{ form.address.postcode }} {{ form.address.city }}</p>
              <p v-if="form.address.state">{{ form.address.state }}</p>
              <p>{{ form.address.country }}</p>
            </div>
          </div>

          <div v-if="pricings.length > 0">
            <h3 class="mb-2 font-medium">Tarifs ({{ pricings.length }})</h3>
            <div class="space-y-2">
              <div
                v-for="(pricing, index) in pricings"
                :key="index"
                class="bg-muted text-muted-foreground rounded-md p-3 text-sm"
              >
                <p class="font-medium">{{ pricing.title }} - {{ pricing.amount }}€</p>
                <p v-if="pricing.description" class="text-xs">{{ pricing.description }}</p>
                <p v-if="pricing.maxCapacity" class="text-xs">
                  Capacité : {{ pricing.maxCapacity }} places
                </p>
              </div>
            </div>
          </div>

          <div v-if="imagePreview">
            <h3 class="mb-2 font-medium">Image</h3>
            <img :src="imagePreview" alt="Aperçu" class="h-48 rounded-lg object-cover" />
          </div>
        </div>

        <div class="mt-6 flex justify-between">
          <Button variant="outline" @click="previousStep">Précédent</Button>
          <Button :disabled="isLoading" @click="createEvent">
            {{ isLoading ? 'Création...' : "Créer l'événement" }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { Plus, Trash2 } from 'lucide-vue-next';
  import Header from '@/components/dashboard/Header.vue';
  import Button from '@/components/ui/button/Button.vue';
  import ImageUpload from '@/components/form/ImageUpload.vue';
  import { useCrmStore } from '@/stores/crm';
  import Database from '@/utils/database.utils';

  const router = useRouter();
  const crmStore = useCrmStore();

  const currentStep = ref(1);
  const isLoading = ref(false);

  const steps = [
    { number: 1, title: 'Informations' },
    { number: 2, title: 'Tarifs' },
    { number: 3, title: 'Confirmation' },
  ];

  const form = ref({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    address: {
      street: '',
      city: '',
      postcode: '',
      state: '',
      country: 'France',
    },
  });

  const imageFile = ref<File | null>(null);
  const imagePreview = ref<string>('');

  const pricings = ref([
    {
      title: '',
      description: '',
      amount: 0,
      maxCapacity: undefined as number | undefined,
    },
  ]);

  const isStep1Valid = computed(() => {
    return (
      form.value.title.length >= 3 &&
      form.value.startDate &&
      form.value.address.street &&
      form.value.address.city &&
      form.value.address.postcode &&
      form.value.address.country
    );
  });

  const isStep2Valid = computed(() => {
    return pricings.value.every((p) => p.title.length >= 3 && p.amount >= 0);
  });

  const addPricing = () => {
    pricings.value.push({
      title: '',
      description: '',
      amount: 0,
      maxCapacity: undefined,
    });
  };

  const removePricing = (index: number) => {
    pricings.value.splice(index, 1);
  };

  const nextStep = () => {
    if (currentStep.value < 3) {
      currentStep.value++;
    }
  };

  const previousStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const createEvent = async () => {
    console.log('🚀 Début de createEvent');
    console.log('Association ID:', crmStore.currentAssociationId);

    if (!crmStore.currentAssociationId) {
      console.error('Aucune association sélectionnée');
      return;
    }

    try {
      isLoading.value = true;
      console.log('Loading activé');

      // 1. Créer l'événement
      const eventData = {
        title: form.value.title,
        description: form.value.description || undefined,
        startDate: new Date(form.value.startDate).toISOString(),
        endDate: form.value.endDate ? new Date(form.value.endDate).toISOString() : undefined,
        address: form.value.address,
      };

      console.log("📝 Données de l'événement:", eventData);

      const response = await Database.create(
        `association/${crmStore.currentAssociationId}/event`,
        eventData
      );
      console.log('✅ Réponse API:', response);
      const createdEvent = response.data || response;
      console.log('📌 Événement créé:', createdEvent);

      // 2. Uploader l'image si présente
      if (imageFile.value && createdEvent.id) {
        await Database.uploadFile(imageFile.value, {
          relatedTo: 'Event',
          relatedBy: createdEvent.id,
          purpose: 'image',
          index: 0,
        });
      }

      // 3. Créer les tarifs
      if (createdEvent.id) {
        for (const pricing of pricings.value) {
          if (pricing.title) {
            await Database.create(
              `association/${crmStore.currentAssociationId}/event/${createdEvent.id}/pricing`,
              {
                title: pricing.title,
                description: pricing.description || undefined,
                amount: pricing.amount,
                maxCapacity: pricing.maxCapacity || undefined,
              }
            );
          }
        }
      }

      console.log('Événement créé avec succès !');
      router.push(`/crm/${crmStore.currentAssociationId}/events/${createdEvent.id}`);
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      console.error(error.response?.data?.message || "Erreur lors de la création de l'événement");
    } finally {
      isLoading.value = false;
    }
  };
</script>
