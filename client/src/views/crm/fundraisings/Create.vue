<template>
  <Create
    :can-create-item="crmAccess.canCreateFundraising"
    :create-endpoint="`association/${associationId}/fundraising`"
    :form-data="formData"
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
        />

        <InputForm
          v-model="form.title.$value"
          input-name="fundraising-title"
          type="text"
          placeholder="Ex: Aide pour les enfants, Projet solidaire..."
          :error-message="form.title.$error?.message || ''"
          :error-state="showError('title')"
          @blur="() => (touchedFields.title = true)"
        >
          <template #label>
            Titre
            <span class="text-destructive">*</span>
          </template>
        </InputForm>

        <TextareaForm
          v-model="form.description.$value"
          input-name="fundraising-description"
          placeholder="Décrivez votre cagnotte..."
          :rows="4"
          :max-length="2000"
          :error-message="form.description.$error?.message || ''"
          :error-state="showError('description')"
          @blur="() => (touchedFields.description = true)"
        >
          <template #label>
            Description
            <span class="text-destructive">*</span>
          </template>
        </TextareaForm>

        <InputForm
          v-model="form.wantedAmount.$value"
          input-name="fundraising-wanted-amount"
          type="number"
          placeholder="0.00"
          :error-message="form.wantedAmount.$error?.message || ''"
          :error-state="showError('wantedAmount')"
          @blur="() => (touchedFields.wantedAmount = true)"
        >
          <template #label>
            Montant souhaité (€)
            <span class="text-destructive">*</span>
          </template>
        </InputForm>

        <div class="grid grid-cols-2 gap-4">
          <InputForm
            v-model="form.startDate.$value"
            input-name="fundraising-start-date"
            type="datetime-local"
            :error-message="form.startDate.$error?.message || ''"
            :error-state="showError('startDate')"
            @blur="() => (touchedFields.startDate = true)"
          >
            <template #label>
              Date de début
              <span class="text-destructive">*</span>
            </template>
          </InputForm>

          <InputForm
            v-model="form.endDate.$value"
            input-name="fundraising-end-date"
            type="datetime-local"
            :error-message="form.endDate.$error?.message || ''"
            :error-state="showError('endDate')"
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
  import { fundraisingCrmErrorMessages } from '@/utils/errors/crm/fundraisings';
  import { computed, reactive, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { defineForm, field, isValidForm } from 'vue-yup-form';
  import * as yup from 'yup';
  import { useToast } from 'vue-toastification';

  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const associationId = route.params.id as string;
  const toast = useToast();
  const formSubmitted = ref(false);

  // Schéma de validation avec yup
  const form = defineForm({
    title: field(
      '',
      yup
        .string()
        .required(fundraisingCrmErrorMessages.required.title)
        .min(5, fundraisingCrmErrorMessages.minLength.title)
        .max(100, fundraisingCrmErrorMessages.maxLength.title)
    ),
    description: field(
      '',
      yup
        .string()
        .required(fundraisingCrmErrorMessages.required.description)
        .min(20, fundraisingCrmErrorMessages.minLength.description)
        .max(2000, fundraisingCrmErrorMessages.maxLength.description)
    ),
    wantedAmount: field(
      0,
      yup
        .number()
        .required(fundraisingCrmErrorMessages.required.wantedAmount)
        .min(0.01, fundraisingCrmErrorMessages.min.wantedAmount)
        .typeError(fundraisingCrmErrorMessages.required.wantedAmount)
    ),
    startDate: field(
      new Date().toISOString().slice(0, 16),
      yup.string().required(fundraisingCrmErrorMessages.required.startDate)
    ),
    endDate: field(
      '',
      yup
        .string()
        .required(fundraisingCrmErrorMessages.required.endDate)
        .test(
          'is-after-start',
          fundraisingCrmErrorMessages.date.endDateBeforeStart,
          function (value) {
            const { startDate } = this.parent;
            if (!value || !startDate) return true;
            return new Date(value) > new Date(startDate);
          }
        )
    ),
  });

  // Gestion des champs touchés
  const touchedFields = reactive({
    title: false,
    description: false,
    wantedAmount: false,
    startDate: false,
    endDate: false,
  });

  const showError = (fieldName: keyof typeof touchedFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!form[fieldName].$error;

  const imageFile = ref<File | null>(null);
  const imagePreview = ref<string>('');

  // Données du formulaire pour le composant Create
  const formData = computed(() => ({
    title: form.title.$value,
    description: form.description.$value,
    amount: 0,
    wantedAmount: form.wantedAmount.$value,
    startDate: form.startDate.$value,
    endDate: form.endDate.$value,
  }));

  async function handleBeforeSubmit(): Promise<boolean> {
    formSubmitted.value = true;

    if (!(await isValidForm(form))) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return false;
    }

    return true;
  }

  async function handleAfterCreate(createdItem: any) {
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
</script>
