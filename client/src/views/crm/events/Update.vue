<template>
  <Header>
    <template #header>Modifier l'événement</template>
  </Header>

  <div class="px-2 py-4 sm:p-6 md:px-12">
    <div v-if="loading" class="flex justify-center py-12">
      <LoadingOverlay message="Chargement de l'événement..." />
    </div>

    <div v-else class="mx-auto max-w-4xl">
      <div class="mb-4 sm:mb-6">
        <p class="text-primary line-clamp-2 font-semibold break-words sm:text-lg lg:text-2xl">
          {{ formData.title }}
        </p>
      </div>

      <!-- Formulaire -->
      <div class="bg-card space-y-4 rounded-lg border p-3 shadow-sm sm:space-y-6 sm:p-6">
        <div>
          <h2 class="mb-3 text-lg font-bold sm:mb-4 sm:text-xl">Informations de l'événement</h2>
          <div class="space-y-4">
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

            <div class="grid gap-4 sm:grid-cols-2">
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
                @input="clearValidationErrors(validationErrors, 'endDate')"
                @blur="touchedFields.endDate = true"
              />
            </div>

            <!-- Adresse -->
            <div class="border-t pt-3 sm:pt-4">
              <h3 class="mb-2 text-sm font-medium sm:mb-3 sm:text-base">Adresse</h3>
              <div class="space-y-4">
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
                    :error-message="
                      showError('address.city') ? getErrorMessage('address.city') : ''
                    "
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
                button-text="Changer l'image"
                help-text="Format recommandé : JPG ou PNG (max 5 Mo)"
                :error-message="showError('image') ? getErrorMessage('image') : ''"
                :error-state="showError('image')"
              />
            </div>
          </div>
        </div>

        <div
          class="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end sm:gap-3 sm:pt-6"
        >
          <Button
            variant="outline"
            class="w-full sm:w-auto"
            @click="router.push(`/crm/${crmStore.currentAssociationId}/events/${eventId}`)"
          >
            Annuler
          </Button>
          <Button :disabled="isLoading" class="w-full sm:w-auto" @click="updateEvent">
            {{ isLoading ? 'Enregistrement...' : 'Enregistrer les modifications' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeMount, onMounted, reactive, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import Header from '@/components/dashboard/Header.vue';
  import Button from '@/components/ui/button/Button.vue';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import ImageUpload from '@/components/form/ImageUpload.vue';
  import InputForm from '@/components/form/InputForm.vue';
  import TextareaForm from '@/components/form/TextareaForm.vue';
  import { useCrmStore } from '@/stores/crm';
  import Database from '@/utils/database.utils';
  import { Permissions } from '@/enums/permissions';
  import { useCrmAccess } from '@/composables/crm-access';
  import { useCrmPremiumAccess } from '@/composables/crm-premium';
  import { eventUpdateValidationSchema } from '@/utils/errors/crm/events';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';
  import { useToast } from 'vue-toastification';

  const router = useRouter();
  const route = useRoute();
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const crmPremiumAccess = useCrmPremiumAccess(crmStore.associationPremiumUntil);
  const toast = useToast();
  const eventId = route.params.eventId as string;

  const loading = ref(true);
  const isLoading = ref(false);
  const formSubmitted = ref(false);

  // États du formulaire
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

  // Validation errors
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

  // Gestion des champs touchés
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

  const showError = (fieldName: keyof typeof touchedFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!validationErrors[fieldName];

  const getErrorMessage = (fieldName: keyof typeof touchedFields) =>
    touchedFields[fieldName] || formSubmitted.value ? validationErrors[fieldName] || '' : '';

  const validateForm = async () => {
    const result = await validateWithYup(eventUpdateValidationSchema as any, formData);

    if (result.isValid) {
      clearValidationErrors(validationErrors);
    } else {
      Object.assign(validationErrors, result.errors);
    }

    return result.isValid;
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

      formData.title = event.title;
      formData.description = event.description || '';
      formData.startDate = formatDateForInput(event.startDate);
      formData.endDate = event.endDate ? formatDateForInput(event.endDate) : '';
      formData.address.street = event.address?.street || '';
      formData.address.city = event.address?.city || '';
      formData.address.postcode = event.address?.postcode || '';
      formData.address.state = event.address?.state || '';
      formData.address.country = event.address?.country || 'France';

      // Initialiser la preview avec l'image actuelle
      imagePreview.value = event.image || '';
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error("Erreur lors du chargement de l'événement");
    } finally {
      loading.value = false;
    }
  };

  const updateEvent = async () => {
    formSubmitted.value = true;

    if (!(await validateForm())) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    if (!crmStore.currentAssociationId) return;

    try {
      isLoading.value = true;

      const eventData = {
        title: formData.title,
        description: formData.description || undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        address: formData.address,
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

      toast.success('Événement modifié avec succès !');
      router.push(`/crm/${crmStore.currentAssociationId}/events/${eventId}`);
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error);
      toast.error("Erreur lors de la modification de l'événement");
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
