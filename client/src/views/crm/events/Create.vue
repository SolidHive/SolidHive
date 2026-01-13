<template>
  <Header>
    <template #header>Créer un événement</template>
  </Header>

  <div class="px-2 py-4 sm:p-6 md:px-12">
    <div class="mx-auto max-w-4xl">
      <div class="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="text-muted-foreground mt-1 text-sm sm:text-base">
            Étape {{ currentStep }} sur 3
          </p>
        </div>
        <Button
          variant="outline"
          class="w-full sm:w-auto"
          @click="router.push(`/crm/${crmStore.currentAssociationId}/events`)"
        >
          Annuler
        </Button>
      </div>

      <!-- Stepper -->
      <div class="mb-4 flex items-center justify-center px-4 sm:mb-6 sm:px-8 md:mb-8">
        <div class="flex max-w-lg items-center">
          <div
            v-for="step in steps"
            :key="step.number"
            class="flex items-center"
            :class="{ 'opacity-40': step.number > currentStep }"
          >
            <div class="flex items-center">
              <div
                class="flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold sm:h-8 sm:w-8 sm:text-sm"
                :class="
                  step.number <= currentStep
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border'
                "
              >
                {{ step.number }}
              </div>
              <span class="ml-1 hidden text-xs font-medium sm:ml-2 sm:text-sm md:inline">
                {{ step.title }}
              </span>
            </div>
            <div
              v-if="step.number < steps.length"
              class="border-border mx-2 w-12 border-t-2 sm:mx-3 sm:w-16 md:w-20"
              :class="{ 'border-primary': step.number < currentStep }"
            />
          </div>
        </div>
      </div>

      <!-- Step 1: Informations de l'événement -->
      <div
        v-show="currentStep === 1"
        class="bg-card overflow-hidden rounded-lg border p-3 shadow-sm sm:p-4 md:p-6"
      >
        <h2 class="mb-3 text-lg font-bold sm:mb-4 sm:text-xl">Informations de l'événement</h2>
        <div class="space-y-3 sm:space-y-4">
          <InputForm
            v-model="formData.title"
            input-name="title"
            label="Titre"
            placeholder="Nom de l'événement"
            :error-message="showError('title') ? getErrorMessage('title') : ''"
            :error-state="showError('title')"
            required
            @input="clearValidationErrors(validationErrors, 'title')"
            @blur="touchedFields.title = true"
          />

          <TextareaForm
            v-model="formData.description"
            input-name="description"
            label="Description"
            placeholder="Description de l'événement"
            :rows="4"
            :max-length="1000"
            :error-message="showError('description') ? getErrorMessage('description') : ''"
            :error-state="showError('description')"
            @input="clearValidationErrors(validationErrors, 'description')"
            @blur="touchedFields.description = true"
          />

          <div class="grid gap-3 sm:gap-4 md:grid-cols-2">
            <InputForm
              v-model="formData.startDate"
              input-name="startDate"
              label="Date de début"
              type="datetime-local"
              :error-message="showError('startDate') ? getErrorMessage('startDate') : ''"
              :error-state="showError('startDate')"
              required
              @input="clearValidationErrors(validationErrors, 'startDate')"
              @blur="touchedFields.startDate = true"
            />
            <InputForm
              v-model="formData.endDate"
              input-name="endDate"
              label="Date de fin"
              type="datetime-local"
              :error-message="showError('endDate') ? getErrorMessage('endDate') : ''"
              :error-state="showError('endDate')"
              required
              @input="clearValidationErrors(validationErrors, 'endDate')"
              @blur="touchedFields.endDate = true"
            />
          </div>

          <!-- Adresse -->
          <div class="border-t pt-3 sm:pt-4">
            <h3 class="mb-2 text-sm font-medium sm:mb-3 sm:text-base">Adresse</h3>
            <div class="space-y-3 sm:space-y-4">
              <InputForm
                v-model="formData.address.street"
                input-name="street"
                label="Rue"
                placeholder="123 rue de la Paix"
                :error-message="
                  showError('address.street') ? getErrorMessage('address.street') : ''
                "
                :error-state="showError('address.street')"
                required
                @input="clearValidationErrors(validationErrors, 'address.street')"
                @blur="touchedFields['address.street'] = true"
              />
              <div class="grid gap-4 md:grid-cols-2">
                <InputForm
                  v-model="formData.address.city"
                  input-name="city"
                  label="Ville"
                  placeholder="Paris"
                  :error-message="showError('address.city') ? getErrorMessage('address.city') : ''"
                  :error-state="showError('address.city')"
                  required
                  @input="clearValidationErrors(validationErrors, 'address.city')"
                  @blur="touchedFields['address.city'] = true"
                />
                <InputForm
                  v-model="formData.address.postcode"
                  input-name="postcode"
                  label="Code postal"
                  placeholder="75001"
                  :error-message="
                    showError('address.postcode') ? getErrorMessage('address.postcode') : ''
                  "
                  :error-state="showError('address.postcode')"
                  required
                  @input="clearValidationErrors(validationErrors, 'address.postcode')"
                  @blur="touchedFields['address.postcode'] = true"
                />
              </div>
              <div class="grid gap-4 md:grid-cols-2">
                <InputForm
                  v-model="formData.address.state"
                  input-name="state"
                  label="Région"
                  placeholder="Île-de-France"
                  :error-message="
                    showError('address.state') ? getErrorMessage('address.state') : ''
                  "
                  :error-state="showError('address.state')"
                  required
                  @input="clearValidationErrors(validationErrors, 'address.state')"
                  @blur="touchedFields['address.state'] = true"
                />
                <InputForm
                  v-model="formData.address.country"
                  input-name="country"
                  label="Pays"
                  placeholder="France"
                  :error-message="
                    showError('address.country') ? getErrorMessage('address.country') : ''
                  "
                  :error-state="showError('address.country')"
                  required
                  @input="clearValidationErrors(validationErrors, 'address.country')"
                  @blur="touchedFields['address.country'] = true"
                />
              </div>
            </div>
          </div>

          <!-- Image -->
          <div class="border-t pt-3 sm:pt-4">
            <ImageUpload
              v-model="imageFile"
              v-model:preview="imagePreview"
              label="Image de l'événement"
              button-text="Ajouter une image"
              help-text="Format recommandé : JPG ou PNG (max 5 Mo)"
              :error-message="showError('image') ? getErrorMessage('image') : ''"
              :error-state="showError('image')"
            />
          </div>
        </div>

        <div class="mt-4 flex justify-end sm:mt-6">
          <Button class="w-full sm:w-auto" @click="nextStep">Suivant</Button>
        </div>
      </div>

      <!-- Step 2: Tarifs -->
      <div
        v-show="currentStep === 2"
        class="bg-card overflow-hidden rounded-lg border p-3 shadow-sm sm:p-4 md:p-6"
      >
        <h2 class="mb-3 text-lg font-bold sm:mb-4 sm:text-xl">Tarifs de participation</h2>
        <p class="text-muted-foreground mb-3 text-xs sm:mb-4 sm:text-sm">
          Ajoutez différents types de tarifs pour votre événement
        </p>

        <div class="mb-3 space-y-3 sm:mb-4 sm:space-y-4">
          <div
            v-for="(pricing, index) in pricings"
            :key="index"
            class="border-border overflow-hidden rounded-lg border p-3 sm:p-4"
          >
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-medium sm:text-base">Tarif {{ index + 1 }}</span>
              <Button
                v-if="pricings.length > 1"
                variant="ghost"
                size="sm"
                @click="removePricing(index)"
              >
                <Trash2 class="h-4 w-4 text-red-500" />
              </Button>
            </div>
            <div class="grid gap-3 sm:gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-medium sm:text-sm">Titre *</label>
                <input
                  v-model="pricing.title"
                  type="text"
                  required
                  placeholder="Tarif normal, réduit, etc."
                  :class="[
                    'flex h-9 w-full rounded-md border px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:h-10 sm:px-3 sm:py-2',
                    showPricingError(index, 'title')
                      ? 'border-destructive focus-visible:ring-destructive'
                      : 'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring',
                  ]"
                  @input="
                    () => {
                      pricingTouched[index] = true;
                      clearPricingError(index, 'title');
                    }
                  "
                  @blur="pricingTouched[index] = true"
                />
                <p v-if="showPricingError(index, 'title')" class="text-destructive mt-1 text-xs">
                  {{ getPricingErrorMessage(index, 'title') }}
                </p>
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium sm:text-sm">Prix (€) *</label>
                <input
                  v-model.number="pricing.amount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="0.00"
                  :class="[
                    'flex h-9 w-full rounded-md border px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:h-10 sm:px-3 sm:py-2',
                    showPricingError(index, 'amount')
                      ? 'border-destructive focus-visible:ring-destructive'
                      : 'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring',
                  ]"
                  @input="
                    () => {
                      pricingTouched[index] = true;
                      clearPricingError(index, 'amount');
                    }
                  "
                  @blur="pricingTouched[index] = true"
                />
                <p v-if="showPricingError(index, 'amount')" class="text-destructive mt-1 text-xs">
                  {{ getPricingErrorMessage(index, 'amount') }}
                </p>
              </div>
            </div>
            <div class="mt-3 grid gap-3 sm:gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-medium sm:text-sm">Description *</label>
                <input
                  v-model="pricing.description"
                  type="text"
                  required
                  placeholder="Description du tarif"
                  :class="[
                    'flex h-9 w-full rounded-md border px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:h-10 sm:px-3 sm:py-2',
                    showPricingError(index, 'description')
                      ? 'border-destructive focus-visible:ring-destructive'
                      : 'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring',
                  ]"
                  @input="
                    () => {
                      pricingTouched[index] = true;
                      clearPricingError(index, 'description');
                    }
                  "
                  @blur="pricingTouched[index] = true"
                />
                <p
                  v-if="showPricingError(index, 'description')"
                  class="text-destructive mt-1 text-xs"
                >
                  {{ getPricingErrorMessage(index, 'description') }}
                </p>
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium sm:text-sm">Capacité max</label>
                <input
                  v-model.number="pricing.maxCapacity"
                  type="number"
                  min="1"
                  placeholder="Illimité"
                  :class="[
                    'flex h-9 w-full rounded-md border px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:h-10 sm:px-3 sm:py-2',
                    showPricingError(index, 'maxCapacity')
                      ? 'border-destructive focus-visible:ring-destructive'
                      : 'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring',
                  ]"
                  @input="
                    () => {
                      pricingTouched[index] = true;
                      clearPricingError(index, 'maxCapacity');
                    }
                  "
                  @blur="pricingTouched[index] = true"
                />
                <p
                  v-if="showPricingError(index, 'maxCapacity')"
                  class="text-destructive mt-1 text-xs"
                >
                  {{ getPricingErrorMessage(index, 'maxCapacity') }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button variant="outline" class="mb-4 w-full sm:mb-6" @click="addPricing">
          <Plus class="mr-2 h-4 w-4" />
          Ajouter un tarif
        </Button>

        <div class="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button variant="outline" class="w-full sm:w-auto" @click="previousStep">
            Précédent
          </Button>
          <Button class="w-full sm:w-auto" @click="nextStep">Suivant</Button>
        </div>
      </div>

      <!-- Step 3: Confirmation -->
      <div
        v-show="currentStep === 3"
        class="bg-card overflow-hidden rounded-lg border p-3 shadow-sm sm:p-4 md:p-6"
      >
        <h2 class="mb-3 text-lg font-bold sm:mb-4 sm:text-xl">Récapitulatif</h2>

        <div class="space-y-4 sm:space-y-6">
          <div>
            <h3 class="mb-2 text-sm font-medium sm:text-base">Informations générales</h3>
            <div class="text-muted-foreground space-y-1 text-xs break-words sm:text-sm">
              <p>
                <strong>Titre :</strong>
                {{ formData.title }}
              </p>
              <p v-if="formData.description">
                <strong>Description :</strong>
                {{ formData.description }}
              </p>
              <p>
                <strong>Date de début :</strong>
                {{ formatDate(formData.startDate) }}
              </p>
              <p v-if="formData.endDate">
                <strong>Date de fin :</strong>
                {{ formatDate(formData.endDate) }}
              </p>
            </div>
          </div>

          <div>
            <h3 class="mb-2 text-sm font-medium sm:text-base">Adresse</h3>
            <div class="text-muted-foreground text-xs break-words sm:text-sm">
              <p>{{ formData.address.street }}</p>
              <p>{{ formData.address.postcode }} {{ formData.address.city }}</p>
              <p v-if="formData.address.state">{{ formData.address.state }}</p>
              <p>{{ formData.address.country }}</p>
            </div>
          </div>

          <div v-if="pricings.length > 0">
            <h3 class="mb-2 text-sm font-medium sm:text-base">Tarifs ({{ pricings.length }})</h3>
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
            <h3 class="mb-2 text-sm font-medium sm:text-base">Image</h3>
            <img
              :src="imagePreview"
              alt="Aperçu"
              class="h-32 rounded-lg object-cover sm:h-40 md:h-48"
            />
          </div>
        </div>

        <div class="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:justify-between">
          <Button variant="outline" class="w-full sm:w-auto" @click="previousStep">
            Précédent
          </Button>
          <Button :disabled="isLoading" class="w-full sm:w-auto" @click="createEvent">
            {{ isLoading ? 'Création...' : "Créer l'événement" }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeMount, reactive, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { Plus, Trash2 } from 'lucide-vue-next';
  import Header from '@/components/dashboard/Header.vue';
  import Button from '@/components/ui/button/Button.vue';
  import ImageUpload from '@/components/form/ImageUpload.vue';
  import InputForm from '@/components/form/InputForm.vue';
  import TextareaForm from '@/components/form/TextareaForm.vue';
  import { useCrmStore } from '@/stores/crm';
  import Database from '@/utils/database.utils';
  import { Permissions } from '@/enums/permissions';
  import { useCrmAccess } from '@/composables/crm-access';
  import { useCrmPremiumAccess } from '@/composables/crm-premium';
  import {
    eventStep1ValidationSchema,
    eventStep2ValidationSchema,
  } from '@/utils/errors/crm/events';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';
  import { useToast } from 'vue-toastification';

  const router = useRouter();
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const crmPremiumAccess = useCrmPremiumAccess(crmStore.associationPremiumUntil);
  const route = useRoute();
  const toast = useToast();
  const formSubmitted = ref(false);

  const currentStep = ref(1);
  const isLoading = ref(false);

  const steps = [
    { number: 1, title: 'Informations' },
    { number: 2, title: 'Tarifs' },
    { number: 3, title: 'Confirmation' },
  ];

  // États du formulaire - Step 1
  const formData = reactive({
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
    image: undefined as File | undefined,
  });

  // États du formulaire - Step 2
  const pricings = ref([
    {
      title: '',
      description: '',
      amount: undefined as number | undefined,
      maxCapacity: undefined as number | undefined,
    },
  ]);

  // Validation errors - Step 1
  const validationErrors = reactive({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    image: '',
    'address.street': '',
    'address.city': '',
    'address.postcode': '',
    'address.state': '',
    'address.country': '',
  });

  // Validation errors - Step 2
  const pricingErrors = ref<
    Array<{ title?: string; description?: string; amount?: string; maxCapacity?: string }>
  >([{}]);

  // Gestion des champs touchés - Step 1
  const touchedFields = reactive({
    title: false,
    description: false,
    startDate: false,
    endDate: false,
    image: false,
    'address.street': false,
    'address.city': false,
    'address.postcode': false,
    'address.state': false,
    'address.country': false,
  });

  // Gestion des champs touchés - Step 2
  const pricingTouched = ref<boolean[]>([false]);

  const showError = (fieldName: keyof typeof touchedFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!validationErrors[fieldName];

  const getErrorMessage = (fieldName: keyof typeof touchedFields) =>
    touchedFields[fieldName] || formSubmitted.value ? validationErrors[fieldName] || '' : '';

  const validateStep1 = async () => {
    const result = await validateWithYup(eventStep1ValidationSchema as any, formData);

    if (result.isValid) {
      clearValidationErrors(validationErrors);
    } else {
      Object.assign(validationErrors, result.errors);
    }

    return result.isValid;
  };

  const validateStep2 = async () => {
    const result = await validateWithYup(eventStep2ValidationSchema as any, {
      pricings: pricings.value,
    });

    if (result.isValid) {
      // Clear all pricing errors
      pricingErrors.value = pricings.value.map(() => ({}));
      return true;
    } else {
      // Parse errors and assign to pricingErrors
      const newPricingErrors: Array<{
        title?: string;
        description?: string;
        amount?: string;
        maxCapacity?: string;
      }> = pricings.value.map(() => ({}));

      Object.entries(result.errors).forEach(([path, message]) => {
        const match = path.match(/^pricings\[(\d+)\]\.(.+)$/);
        if (match && match[1]) {
          const index = parseInt(match[1]);
          const field = match[2] as keyof (typeof newPricingErrors)[0];
          newPricingErrors[index] = newPricingErrors[index] || {};
          newPricingErrors[index][field] = message;
        }
      });

      pricingErrors.value = newPricingErrors;
      return false;
    }
  };

  const imageFile = ref<File | undefined>(undefined);
  const imagePreview = ref<string>('');

  watch(imageFile, (newValue) => {
    formData.image = newValue;
    touchedFields.image = true;
  });

  // Watcher pour effacer l'erreur d'image quand elle change
  watch(imageFile, () => {
    clearValidationErrors(validationErrors, 'image');
  });

  // Helpers for pricing errors
  const showPricingError = (index: number, field: keyof (typeof pricingErrors.value)[0]) =>
    (pricingTouched.value[index] || formSubmitted.value) && !!pricingErrors.value[index]?.[field];

  const getPricingErrorMessage = (index: number, field: keyof (typeof pricingErrors.value)[0]) =>
    pricingTouched.value[index] || formSubmitted.value
      ? pricingErrors.value[index]?.[field] || ''
      : '';

  const clearPricingError = (index: number, field: keyof (typeof pricingErrors.value)[0]) => {
    if (pricingErrors.value[index]) {
      pricingErrors.value[index][field] = '';
    }
  };

  const addPricing = () => {
    pricings.value.push({
      title: '',
      description: '',
      amount: undefined,
      maxCapacity: undefined,
    });
    pricingErrors.value.push({});
    pricingTouched.value.push(false);
  };

  const removePricing = (index: number) => {
    pricings.value.splice(index, 1);
    pricingErrors.value.splice(index, 1);
    pricingTouched.value.splice(index, 1);
  };

  const nextStep = async () => {
    if (currentStep.value === 1) {
      formSubmitted.value = true;
      if (!(await validateStep1())) {
        toast.error('Veuillez corriger les erreurs du formulaire');
        return;
      }
    } else if (currentStep.value === 2) {
      formSubmitted.value = true;
      // Mark all pricings as touched
      pricingTouched.value = pricingTouched.value.map(() => true);
      if (!(await validateStep2())) {
        toast.error('Veuillez corriger les erreurs des tarifs');
        return;
      }
    }

    if (currentStep.value < 3) {
      formSubmitted.value = false; // Reset pour la prochaine étape
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
    // Final validation avant création
    formSubmitted.value = true;
    const isStep1Valid = await validateStep1();

    // Mark all pricings as touched
    pricingTouched.value = pricingTouched.value.map(() => true);
    const isStep2Valid = await validateStep2();

    if (!isStep1Valid || !isStep2Valid) {
      toast.error("Veuillez corriger toutes les erreurs avant de créer l'événement");
      currentStep.value = !isStep1Valid ? 1 : 2; // Retour à l'étape avec erreur
      return;
    }

    if (!crmStore.currentAssociationId) {
      toast.error('Aucune association sélectionnée');
      return;
    }

    try {
      isLoading.value = true;

      // 1. Créer l'événement
      const eventData = {
        title: formData.title,
        description: formData.description || undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        address: formData.address,
      };

      const response = await Database.create(
        `association/${crmStore.currentAssociationId}/event`,
        eventData
      );
      const createdEvent = response.data || response;

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

      toast.success('Événement créé avec succès !');
      router.push(`/crm/${crmStore.currentAssociationId}/events/${createdEvent.id}`);
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      toast.error("Erreur lors de la création de l'événement. Veuillez réessayer.");
    } finally {
      isLoading.value = false;
    }
  };

  onBeforeMount(async () => {
    const hasPremiumAccess = await crmPremiumAccess.hasAccessToPremiumFeatures(
      Permissions.EVENTS_CREATE
    );

    if (!hasPremiumAccess) {
      router.push({
        name: 'CRMPremiumRequired',
        params: {
          id: route.params.id,
        },
      });
      return;
    }

    if (!crmAccess.canCreateEvent) {
      router.push('/unauthorized');
      return;
    }
  });
</script>
