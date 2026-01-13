<template>
  <Header />
  <div class="p-6 md:px-12">
    <div v-if="loading" class="flex justify-center py-12">
      <LoadingOverlay message="Chargement de l'événement..." />
    </div>

    <div v-else class="mx-auto max-w-4xl">
      <div class="mb-6 flex items-start justify-between">
        <div>
          <h1 class="text-3xl font-bold">Modifier l'événement</h1>
          <p class="text-muted-foreground mt-1">{{ form.title.$value }}</p>
        </div>
        <Button
          variant="outline"
          @click="router.push(`/crm/${crmStore.currentAssociationId}/events/${eventId}`)"
        >
          Annuler
        </Button>
      </div>

      <!-- Formulaire -->
      <div class="bg-card space-y-6 rounded-lg border p-6 shadow-sm">
        <div>
          <h2 class="mb-4 text-xl font-bold">Informations de l'événement</h2>
          <div class="space-y-4">
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

            <div class="grid gap-4 md:grid-cols-2">
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
            <div class="border-t pt-4">
              <h3 class="mb-3 font-medium">Adresse</h3>
              <div class="space-y-4">
                <InputForm
                  v-model="form.address.street.$value"
                  input-name="street"
                  label="Rue"
                  placeholder="123 rue de la Paix"
                  :error-message="
                    showError('address.street') ? getFieldError('address.street') : ''
                  "
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
                    :error-message="
                      showError('address.state') ? getFieldError('address.state') : ''
                    "
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
            <div class="border-t pt-4">
              <h3 class="mb-3 font-medium">Image</h3>
              <ImageUpload v-model:file="imageFile" v-model:preview="imagePreview" />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 border-t pt-6">
          <Button
            variant="outline"
            @click="router.push(`/crm/${crmStore.currentAssociationId}/events/${eventId}`)"
          >
            Annuler
          </Button>
          <Button :disabled="!isFormValid || isLoading" @click="updateEvent">
            {{ isLoading ? 'Enregistrement...' : 'Enregistrer les modifications' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeMount, onMounted, reactive, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import * as yup from 'yup';
  import { defineForm, field, isValidForm } from 'vue-yup-form';
  import Header from '@/components/dashboard/Header.vue';
  import Button from '@/components/ui/button/Button.vue';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
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
  const route = useRoute();
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const crmPremiumAccess = useCrmPremiumAccess(crmStore.associationPremiumUntil);
  const eventId = route.params.eventId as string;

  const loading = ref(true);
  const isLoading = ref(false);
  const formSubmitted = ref(false);

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
          const startDate = this.parent.startDate;
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

  const handleBeforeSubmit = () => {
    formSubmitted.value = true;
    if (!isValidForm(form)) {
      return false;
    }
    return true;
  };

  const isFormValid = computed(() => {
    return isValidForm(form);
  });

  watch(loading, (newVal) => {
    if (!newVal) {
      Object.keys(touchedFields).forEach((key) => (touchedFields[key] = false));
      formSubmitted.value = false;
    }
  });

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const loadEvent = async () => {
    if (!crmStore.currentAssociationId) return;

    try {
      loading.value = true;
      const response = await Database.getOne(
        `association/${crmStore.currentAssociationId}/event`,
        eventId
      );
      const event = response;

      form.title.$value = event.title;
      form.description.$value = event.description || '';
      form.startDate.$value = formatDateForInput(event.startDate);
      form.endDate.$value = event.endDate ? formatDateForInput(event.endDate) : '';
      form.address.street.$value = event.address?.street || '';
      form.address.city.$value = event.address?.city || '';
      form.address.postcode.$value = event.address?.postcode || '';
      form.address.state.$value = event.address?.state || '';
      form.address.country.$value = event.address?.country || 'France';

      // Initialiser la preview avec l'image actuelle
      imagePreview.value = event.image || '';
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      loading.value = false;
    }
  };

  const updateEvent = async () => {
    if (!handleBeforeSubmit()) {
      console.error('Validation échouée');
      return;
    }

    if (!crmStore.currentAssociationId) return;

    try {
      isLoading.value = true;

      const eventData = {
        title: formData.value.title,
        description: formData.value.description || undefined,
        startDate: new Date(formData.value.startDate).toISOString(),
        endDate: formData.value.endDate
          ? new Date(formData.value.endDate).toISOString()
          : undefined,
        address: formData.value.address,
      };

      await Database.update(
        `association/${crmStore.currentAssociationId}/event`,
        eventId,
        eventData
      );

      // Uploader la nouvelle image si présente
      if (imageFile.value) {
        await Database.updateFile(imageFile.value, {
          relatedTo: 'Event',
          relatedBy: eventId,
          purpose: 'image',
          index: 0,
        });
      }

      console.log('Événement modifié avec succès !');
      router.push(`/crm/${crmStore.currentAssociationId}/events/${eventId}`);
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error);
      console.error(
        error.response?.data?.message || "Erreur lors de la modification de l'événement"
      );
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    loadEvent();
  });

  onBeforeMount(async () => {
    const hasPremiumAccess = await crmPremiumAccess.hasAccessToPremiumFeatures(
      Permissions.EVENTS_UPDATE
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

    if (!crmAccess.canUpdateEvent) {
      router.push('/unauthorized');
      return;
    }
  });
</script>
