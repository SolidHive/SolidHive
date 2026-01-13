<template>
  <Update
    :can-update-item="crmAccess.canUpdateFundraising"
    :fetch-item="`association/${associationId}/fundraising/${id}`"
    :update-endpoint="`association/${associationId}/fundraising/${id}`"
    :form-data="formData"
    :on-before-submit="handleBeforeSubmit"
    @after-update="handleAfterUpdate"
  >
    <template #title>Modifier la cagnotte</template>
    <template #form>
      <div class="space-y-4 p-4">
        <ImageUpload
          v-model="imageFile"
          v-model:preview="imagePreview"
          label="Image de la cagnotte"
          :button-text="imagePreview ? 'Changer l\'image' : 'Choisir une image'"
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
    <template #description>Modifiez les informations de la cagnotte ci-dessous.</template>
  </Update>
</template>

<script setup lang="ts">
  import { Update as UpdateRaw } from '@/components/dashboard/crud';
  import InputForm from '@/components/form/InputForm.vue';
  import TextareaForm from '@/components/form/TextareaForm.vue';
  import ImageUpload from '@/components/form/ImageUpload.vue';
  import { useCrmAccess } from '@/composables/crm-access';
  import type { Fundraising } from '@/interfaces';
  import { useCrmStore } from '@/stores/crm';
  import Database from '@/utils/database.utils';
  import { fundraisingCrmErrorMessages } from '@/utils/errors/crm/fundraisings';
  import { computed, onBeforeMount, onMounted, reactive, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { defineForm, field, isValidForm } from 'vue-yup-form';
  import * as yup from 'yup';
  import { useToast } from 'vue-toastification';
  import { Permissions } from '@/enums/permissions';
  import { useCrmPremiumAccess } from '@/composables/crm-premium';

  const Update = UpdateRaw<Fundraising>;
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const crmPremiumAccess = useCrmPremiumAccess(crmStore.associationPremiumUntil);
  const router = useRouter();
  const associationId = route.params.id as string;
  const id = route.params.itemId;
  const toast = useToast();
  const formSubmitted = ref(false);

  if (!id || typeof id !== 'string') {
    console.error('No fundraising ID provided in route parameters.');
  }

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
    startDate: field('', yup.string().required(fundraisingCrmErrorMessages.required.startDate)),
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

  // Données du formulaire pour le composant Update
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

  async function handleAfterUpdate() {
    console.log('handleAfterUpdate called');

    if (imageFile.value && id && typeof id === 'string') {
      try {
        console.log('Updating image for fundraising:', id);
        await Database.updateFile(imageFile.value, {
          relatedTo: 'Fundraising',
          relatedBy: id,
          purpose: 'image',
          index: 0,
        });
        console.log('Image updated successfully');
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'image:", error);
      }
    } else {
      console.log('No image to update', {
        hasImage: !!imageFile.value,
        id,
      });
    }
  }

  async function fetchFundraising(): Promise<void> {
    try {
      const response = await Database.getAll(`association/${associationId}/fundraising/${id}`);
      if (response) {
        form.title.$value = response.title || '';
        form.description.$value = response.description || '';
        form.wantedAmount.$value = response.wantedAmount || 0;
        form.startDate.$value = response.startDate
          ? new Date(response.startDate).toISOString().slice(0, 16)
          : '';
        form.endDate.$value = response.endDate
          ? new Date(response.endDate).toISOString().slice(0, 16)
          : '';

        // Charger l'image existante si elle existe
        if (response.image) {
          imagePreview.value = response.image;
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la cagnotte:', err);
    }
  }

  // Réinitialiser les erreurs lors du chargement
  watch(
    () => form.title.$value,
    () => {
      if (formSubmitted.value) {
        formSubmitted.value = false;
        Object.keys(touchedFields).forEach((key) => {
          touchedFields[key as keyof typeof touchedFields] = false;
        });
      }
    },
    { once: true }
  );

  onMounted(async () => {
    await fetchFundraising();
  });

  onBeforeMount(async () => {
    const hasPremiumAccess = await crmPremiumAccess.hasAccessToPremiumFeatures(
      Permissions.FUNDRAISINGS_UPDATE
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

    if (!crmAccess.canUpdateFundraising) {
      router.push('/unauthorized');
      return;
    }
  });
</script>
