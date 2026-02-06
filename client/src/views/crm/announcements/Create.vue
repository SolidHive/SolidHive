<template>
  <Create
    :can-create-item="crmAccess.canCreateAnnouncement"
    :create-endpoint="`association/${associationId}/announcement`"
    :form-data="apiFormData"
    :on-before-submit="handleBeforeSubmit"
    @after-create="handleAfterCreate"
  >
    <template #title>Créer une nouvelle annonce</template>
    <template #form>
      <div class="space-y-4 p-4">
        <ImageUpload
          v-model="imageFile"
          v-model:preview="imagePreview"
          label="Image de l'annonce"
          button-text="Choisir une image"
          help-text="Format recommandé : PNG ou JPG (max 5 Mo)"
          height="md"
          :error-message="getErrorMessage('image')"
          :error-state="showError('image')"
        />

        <InputForm
          v-model="formData.title"
          input-name="announcement-title"
          type="text"
          placeholder="Ex: Nouvelle réunion, Événement à venir..."
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
          v-model="formData.content"
          input-name="announcement-content"
          placeholder="Décrivez votre annonce..."
          :rows="4"
          :max-length="1000"
          :error-message="getErrorMessage('content')"
          :error-state="showError('content')"
          @input="clearValidationErrors(validationErrors, 'content')"
          @blur="() => (touchedFields.content = true)"
        >
          <template #label>
            Contenu
            <span class="text-destructive">*</span>
          </template>
        </TextareaForm>

        <div class="flex items-center space-x-2">
          <input
            id="is-active"
            v-model="formData.isActive"
            type="checkbox"
            class="border-input bg-background ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:ring-2 focus-visible:ring-offset-2"
          />
          <label for="is-active" class="text-sm font-medium">Annonce active</label>
        </div>
      </div>
    </template>
    <template #description>
      Créez une annonce pour informer les membres de votre association.
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
  import { createAnnouncementValidationSchema } from '@/utils/errors/crm/announcements';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';
  import { useToast } from 'vue-toastification';
  import { useCrmPremiumAccess } from '@/composables/crm-premium';
  import { Permissions } from '@/enums/permissions';

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
    content: '',
    isActive: true,
    image: undefined as File | undefined,
  });

  const apiFormData = computed(() => ({
    title: formData.title,
    content: formData.content,
    isActive: formData.isActive,
  }));

  const validationErrors = reactive({
    title: '',
    content: '',
    isActive: '',
    image: '',
  });

  // Gestion des champs touchés
  const touchedFields = reactive({
    title: false,
    content: false,
    image: false,
  });

  const showError = (fieldName: keyof typeof touchedFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!validationErrors[fieldName];

  const getErrorMessage = (fieldName: keyof typeof touchedFields) =>
    touchedFields[fieldName] || formSubmitted.value ? validationErrors[fieldName] || '' : '';

  const validateForm = async () => {
    const result = await validateWithYup(createAnnouncementValidationSchema as any, formData);

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
        console.log('Uploading image for announcement:', createdItem.data.id);
        await Database.uploadFile(imageFile.value, {
          relatedTo: 'AssociationAnnouncement',
          relatedBy: createdItem.data.id,
          purpose: 'image',
          index: 0,
        });
        console.log('Image uploaded successfully');
      } catch (error) {
        console.error("Erreur lors de l'upload de l'image:", error);
      }
    } else {
      console.log('No image to upload or missing announcement id', {
        hasImage: !!imageFile.value,
        createdItem,
      });
    }
  }

  onBeforeMount(async () => {
    const hasPremiumAccess = await crmPremiumAccess.hasAccessToPremiumFeatures(
      Permissions.ANNOUNCEMENTS_CREATE
    );

    if (!hasPremiumAccess) {
      router.push({
        name: 'AboutPremium',
      });
      return;
    }

    if (!crmAccess.canCreateAnnouncement) {
      router.push('/unauthorized');
      return;
    }
  });
</script>
