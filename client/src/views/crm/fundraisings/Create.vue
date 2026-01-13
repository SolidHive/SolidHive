<template>
  <Create
    :can-create-item="crmAccess.canCreateFundraising"
    :create-endpoint="`association/${associationId}/fundraising`"
    :form-data="apiFormData"
    :on-before-submit="handleBeforeSubmit"
    @after-create="handleAfterCreate"
  >
    <template #title>Créer une nouvelle cagnotte</template>
    <template #form>
      <div class="space-y-4 p-4">
        <ImageUpload
          v-model="imageFile"
          v-model:preview="imagePreview"
          label="Image de la cagnotte"
          button-text="Choisir une image"
          help-text="Format recommandé : PNG ou JPG (max 5 Mo)"
          height="md"
          :error-message="getErrorMessage('image')"
          :error-state="showError('image')"
        />

        <InputForm
          v-model="formData.title"
          input-name="fundraising-title"
          type="text"
          placeholder="Ex: Aide pour les enfants, Projet solidaire..."
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

        <TextareaForm
          v-model="formData.description"
          input-name="fundraising-description"
          placeholder="Décrivez votre cagnotte..."
          :rows="4"
          :max-length="2000"
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

        <InputForm
          v-model="formData.wantedAmount"
          input-name="fundraising-wanted-amount"
          type="number"
          placeholder="0.00"
          :error-message="getErrorMessage('wantedAmount')"
          :error-state="showError('wantedAmount')"
          @input="clearValidationErrors(validationErrors, 'wantedAmount')"
          @blur="() => (touchedFields.wantedAmount = true)"
        >
          <template #label>
            Montant souhaité (€)
            <span class="text-destructive">*</span>
          </template>
        </InputForm>

        <div class="grid grid-cols-2 gap-4">
          <InputForm
            v-model="formData.startDate"
            input-name="fundraising-start-date"
            type="datetime-local"
            :error-message="getErrorMessage('startDate')"
            :error-state="showError('startDate')"
            @input="clearValidationErrors(validationErrors, 'startDate')"
            @blur="() => (touchedFields.startDate = true)"
          >
            <template #label>
              Date de début
              <span class="text-destructive">*</span>
            </template>
          </InputForm>

          <InputForm
            v-model="formData.endDate"
            input-name="fundraising-end-date"
            type="datetime-local"
            :error-message="getErrorMessage('endDate')"
            :error-state="showError('endDate')"
            @input="clearValidationErrors(validationErrors, 'endDate')"
            @blur="() => (touchedFields.endDate = true)"
          >
            <template #label>
              Date de fin
              <span class="text-destructive">*</span>
            </template>
          </InputForm>
        </div>
      </div>
    </template>
    <template #description>
      Créez une cagnotte pour collecter des fonds pour votre association.
    </template>
  </Create>
</template>

<script setup lang="ts">
  import { Create } from '@/components/dashboard/crud';
  import InputForm from '@/components/form/InputForm.vue';
  import TextareaForm from '@/components/form/TextareaForm.vue';
  import ImageUpload from '@/components/form/ImageUpload.vue';
  import { useCrmAccess } from '@/composables/crm-access';
  import { useCrmStore } from '@/stores/crm';
  import Database from '@/utils/database.utils';
  import { computed, onBeforeMount, reactive, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { createFundraisingValidationSchema } from '@/utils/errors/crm/fundraisings';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';
  import { useToast } from 'vue-toastification';
  import { Permissions } from '@/enums/permissions';
  import { useCrmPremiumAccess } from '@/composables/crm-premium';

  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const crmPremiumAccess = useCrmPremiumAccess(crmStore.associationPremiumUntil);
  const router = useRouter();
  const route = useRoute();
  const associationId = route.params.id as string;
  const toast = useToast();
  const formSubmitted = ref(false);

  // États du formulaire
  const formData = reactive({
    title: '',
    description: '',
    wantedAmount: 0,
    startDate: '',
    endDate: '',
    image: undefined as File | undefined,
  });

  const apiFormData = computed(() => ({
    title: formData.title,
    description: formData.description,
    wantedAmount: formData.wantedAmount,
    startDate: formData.startDate,
    endDate: formData.endDate,
    amount: 0,
  }));

  const validationErrors = reactive({
    title: '',
    description: '',
    wantedAmount: '',
    startDate: '',
    endDate: '',
    image: '',
  });

  // Gestion des champs touchés
  const touchedFields = reactive({
    title: false,
    description: false,
    wantedAmount: false,
    startDate: false,
    endDate: false,
    image: false,
  });

  const showError = (fieldName: keyof typeof touchedFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!validationErrors[fieldName];

  const getErrorMessage = (fieldName: keyof typeof touchedFields) =>
    touchedFields[fieldName] || formSubmitted.value ? validationErrors[fieldName] || '' : '';

  const validateForm = async () => {
    const result = await validateWithYup(createFundraisingValidationSchema as any, formData);

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

  async function handleBeforeSubmit(): Promise<boolean> {
    formSubmitted.value = true;

    if (!(await validateForm())) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return false;
    }

    return true;
  }

  async function handleAfterCreate(createdItem: any): Promise<void> {
    console.log('handleAfterCreate called with:', createdItem);

    if (imageFile.value && createdItem?.data?.id) {
      try {
        console.log('Uploading image for fundraising:', createdItem.data.id);
        await Database.uploadFile(imageFile.value, {
          relatedTo: 'Fundraising',
          relatedBy: createdItem.data.id,
          purpose: 'image',
          index: 0,
        });
        console.log('Image uploaded successfully');
      } catch (error) {
        console.error("Erreur lors de l'upload de l'image:", error);
      }
    } else {
      console.log('No image to upload or missing fundraising id', {
        hasImage: !!imageFile.value,
        createdItem,
      });
    }
  }

  onBeforeMount(async () => {
    const hasPremiumAccess = await crmPremiumAccess.hasAccessToPremiumFeatures(
      Permissions.FUNDRAISINGS_CREATE
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

    if (!crmAccess.canCreateFundraising) {
      router.push('/unauthorized');
      return;
    }
  });
</script>
