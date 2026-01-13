<template>
  <Header />
  <div class="px-2 py-4 sm:p-6 md:px-12">
    <div class="mx-auto max-w-4xl">
      <div class="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 class="text-xl font-bold sm:text-2xl md:text-3xl">Créer un événement</h1>
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
            v-model="form.title.$value"
            input-name="title"
            label="Titre"
            placeholder="Nom de l'événement"
            :error-message="showError('title') ? getFieldError('title') : ''"
            :error-state="showError('title')"
            required
            @blur="touchedFields.title = true"
          />

          <TextareaForm
            v-model="form.description.$value"
            input-name="description"
            label="Description"
            placeholder="Description de l'événement"
            :rows="4"
            :max-length="1000"
            :error-message="showError('description') ? getFieldError('description') : ''"
            :error-state="showError('description')"
            @blur="touchedFields.description = true"
          />

          <div class="grid gap-3 sm:gap-4 md:grid-cols-2">
            <InputForm
              v-model="form.startDate.$value"
              input-name="startDate"
              label="Date de début"
              type="datetime-local"
              :error-message="showError('startDate') ? getFieldError('startDate') : ''"
              :error-state="showError('startDate')"
              required
              @blur="touchedFields.startDate = true"
            />
            <InputForm
              v-model="form.endDate.$value"
              input-name="endDate"
              label="Date de fin"
              type="datetime-local"
              :error-message="showError('endDate') ? getFieldError('endDate') : ''"
              :error-state="showError('endDate')"
              @blur="touchedFields.endDate = true"
            />
          </div>

          <!-- Adresse -->
          <div class="border-t pt-3 sm:pt-4">
            <h3 class="mb-2 text-sm font-medium sm:mb-3 sm:text-base">Adresse</h3>
            <div class="space-y-3 sm:space-y-4">
              <InputForm
                v-model="form.address.street.$value"
                input-name="street"
                label="Rue"
                placeholder="123 rue de la Paix"
                :error-message="showError('address.street') ? getFieldError('address.street') : ''"
                :error-state="showError('address.street')"
                required
                @blur="touchedFields['address.street'] = true"
              />
              <div class="grid gap-4 md:grid-cols-2">
                <InputForm
                  v-model="form.address.city.$value"
                  input-name="city"
                  label="Ville"
                  placeholder="Paris"
                  :error-message="showError('address.city') ? getFieldError('address.city') : ''"
                  :error-state="showError('address.city')"
                  required
                  @blur="touchedFields['address.city'] = true"
                />
                <InputForm
                  v-model="form.address.postcode.$value"
                  input-name="postcode"
                  label="Code postal"
                  placeholder="75001"
                  :error-message="
                    showError('address.postcode') ? getFieldError('address.postcode') : ''
                  "
                  :error-state="showError('address.postcode')"
                  required
                  @blur="touchedFields['address.postcode'] = true"
                />
              </div>
              <div class="grid gap-4 md:grid-cols-2">
                <InputForm
                  v-model="form.address.state.$value"
                  input-name="state"
                  label="Région"
                  placeholder="Île-de-France"
                  :error-message="showError('address.state') ? getFieldError('address.state') : ''"
                  :error-state="showError('address.state')"
                  @blur="touchedFields['address.state'] = true"
                />
                <InputForm
                  v-model="form.address.country.$value"
                  input-name="country"
                  label="Pays"
                  placeholder="France"
                  :error-message="
                    showError('address.country') ? getFieldError('address.country') : ''
                  "
                  :error-state="showError('address.country')"
                  required
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
            />
          </div>
        </div>

        <div class="mt-4 flex justify-end sm:mt-6">
          <Button :disabled="!isStep1Valid" class="w-full sm:w-auto" @click="nextStep">
            Suivant
          </Button>
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
                  class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:h-10 sm:px-3 sm:py-2"
                />
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
                  class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:h-10 sm:px-3 sm:py-2"
                />
              </div>
            </div>
            <div class="mt-3 grid gap-3 sm:gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-medium sm:text-sm">Description</label>
                <input
                  v-model="pricing.description"
                  type="text"
                  placeholder="Description du tarif"
                  class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:h-10 sm:px-3 sm:py-2"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium sm:text-sm">Capacité max</label>
                <input
                  v-model.number="pricing.maxCapacity"
                  type="number"
                  min="1"
                  placeholder="Illimité"
                  class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:h-10 sm:px-3 sm:py-2"
                />
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
          <Button :disabled="!isStep2Valid" class="w-full sm:w-auto" @click="nextStep">
            Suivant
          </Button>
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
  import { computed, onBeforeMount, reactive, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { Plus, Trash2 } from 'lucide-vue-next';
  import * as yup from 'yup';
  import { defineForm, field, isValidForm } from 'vue-yup-form';
  import Header from '@/components/dashboard/Header.vue';
  import Button from '@/components/ui/button/Button.vue';
  import ImageUpload from '@/components/form/ImageUpload.vue';
  import InputForm from '@/components/form/InputForm.vue';
  import TextareaForm from '@/components/form/TextareaForm.vue';
  import { useCrmStore } from '@/stores/crm';
  import Database from '@/utils/database.utils';
  import { eventCrmErrorMessages } from '@/utils/errors/crm/events';
  import { Permissions } from '@/enums/permissions';
  import { useCrmAccess } from '@/composables/crm-access';
  import { useCrmPremiumAccess } from '@/composables/crm-premium';

  const router = useRouter();
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const crmPremiumAccess = useCrmPremiumAccess(crmStore.associationPremiumUntil);
  const route = useRoute();

  const currentStep = ref(1);
  const isLoading = ref(false);
  const formSubmitted = ref(false);

  const steps = [
    { number: 1, title: 'Informations' },
    { number: 2, title: 'Tarifs' },
    { number: 3, title: 'Confirmation' },
  ];

  const form = defineForm({
    title: field(
      '',
      yup
        .string()
        .required(eventCrmErrorMessages.required.title)
        .min(5, eventCrmErrorMessages.minLength.title)
        .max(100, eventCrmErrorMessages.maxLength.title)
    ),
    description: field(
      '',
      yup
        .string()
        .min(10, eventCrmErrorMessages.minLength.description)
        .max(1000, eventCrmErrorMessages.maxLength.description)
    ),
    startDate: field('', yup.string().required(eventCrmErrorMessages.required.startDate)),
    endDate: field(
      '',
      yup
        .string()
        .test('is-after-start', eventCrmErrorMessages.date.endAfterStart, function (value) {
          if (!value) return true;
          const startDate = this.parent?.startDate;
          if (!startDate) return true;
          return new Date(value) > new Date(startDate);
        })
    ),
    address: {
      street: field(
        '',
        yup
          .string()
          .required(eventCrmErrorMessages.required.street)
          .min(3, eventCrmErrorMessages.minLength.street)
      ),
      city: field(
        '',
        yup
          .string()
          .required(eventCrmErrorMessages.required.city)
          .min(2, eventCrmErrorMessages.minLength.city)
      ),
      postcode: field('', yup.string().required(eventCrmErrorMessages.required.postcode)),
      state: field('', yup.string()),
      country: field('France', yup.string().required(eventCrmErrorMessages.required.country)),
    },
  });

  const touchedFields = reactive<Record<string, boolean>>({
    title: false,
    description: false,
    startDate: false,
    endDate: false,
    'address.street': false,
    'address.city': false,
    'address.postcode': false,
    'address.state': false,
    'address.country': false,
  });

  const getFieldError = (fieldName: string) => {
    const parts = fieldName.split('.');
    let field: any = form;
    for (const part of parts) {
      field = field[part];
      if (!field) return '';
    }
    return field.$error?.message || '';
  };

  const showError = (fieldName: string) => {
    return (touchedFields[fieldName] || formSubmitted.value) && !!getFieldError(fieldName);
  };

  const formData = computed(() => ({
    title: form.title.$value,
    description: form.description.$value,
    startDate: form.startDate.$value,
    endDate: form.endDate.$value,
    address: {
      street: form.address.street.$value,
      city: form.address.city.$value,
      postcode: form.address.postcode.$value,
      state: form.address.state.$value,
      country: form.address.country.$value,
    },
  }));

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

  const handleBeforeSubmit = () => {
    formSubmitted.value = true;
    if (!isValidForm(form)) {
      return false;
    }
    return true;
  };

  const isStep1Valid = computed(() => {
    return isValidForm(form);
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
    if (currentStep.value === 1 && !handleBeforeSubmit()) {
      return;
    }
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
    if (!handleBeforeSubmit()) {
      console.error('Validation échouée');
      return;
    }

    if (!crmStore.currentAssociationId) {
      console.error('Aucune association sélectionnée');
      return;
    }

    try {
      isLoading.value = true;

      // 1. Créer l'événement
      const eventData = {
        title: formData.value.title,
        description: formData.value.description || undefined,
        startDate: new Date(formData.value.startDate).toISOString(),
        endDate: formData.value.endDate
          ? new Date(formData.value.endDate).toISOString()
          : undefined,
        address: formData.value.address,
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
