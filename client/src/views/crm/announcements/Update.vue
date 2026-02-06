<template>
  <Update
    :can-update-item="crmAccess.canUpdateAnnouncement"
    :fetch-item="`association/${associationId}/announcement/${id}`"
    :update-endpoint="`association/${associationId}/announcement/${id}`"
    :form-data="apiFormData"
    :on-before-submit="handleBeforeSubmit"
    @after-update="handleAfterUpdate"
  >
    <template #title>Modifier l'annonce</template>
    <template #form>
      <div class="space-y-4 p-4">
        <ImageUpload
          v-model="imageFile"
          v-model:preview="imagePreview"
          label="Image de l'annonce"
          :button-text="imagePreview ? 'Changer l\'image' : 'Choisir une image'"
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
            id="edit-is-active"
            v-model="formData.isActive"
            type="checkbox"
            class="border-input bg-background ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:ring-2 focus-visible:ring-offset-2"
          />
          <label for="edit-is-active" class="text-sm font-medium">Annonce active</label>
        </div>
      </div>
    </template>
    <template #description>Modifiez les informations de l'annonce ci-dessous.</template>
  </Update>
</template>

<script setup lang="ts">
  import { Update as UpdateRaw } from '@/components/dashboard/crud';
  import InputForm from '@/components/form/InputForm.vue';
  import TextareaForm from '@/components/form/TextareaForm.vue';
  import ImageUpload from '@/components/form/ImageUpload.vue';
  import { useCrmAccess } from '@/composables/crm-access';
  import type { Announcement } from '@/interfaces/announcement.interface';
  import { useCrmStore } from '@/stores/crm';
  import Database from '@/utils/database.utils';
  import { computed, onBeforeMount, onMounted, reactive, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { updateAnnouncementValidationSchema } from '@/utils/errors/crm/announcements';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';
  import { useToast } from 'vue-toastification';
  import { useCrmPremiumAccess } from '@/composables/crm-premium';
  import { Permissions } from '@/enums/permissions';

  const Update = UpdateRaw<Announcement>;
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const crmPremiumAccess = useCrmPremiumAccess(crmStore.associationPremiumUntil);
  const router = useRouter();
  const route = useRoute();
  const associationId = route.params.id as string;
  const id = route.params.itemId;
  const toast = useToast();
  const formSubmitted = ref(false);

  if (!id || typeof id !== 'string') {
    console.error('No announcement ID provided in route parameters.');
  }

  // États du formulaire
  const formData = reactive({
    title: '',
    content: '',
    isActive: true,
    image: undefined as File | undefined,
  });

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
    const result = await validateWithYup(updateAnnouncementValidationSchema as any, formData);

    if (result.isValid) {
      clearValidationErrors(validationErrors);
    } else {
      Object.assign(validationErrors, result.errors);
    }

    return result.isValid;
  };

  const imageFile = ref<File | undefined>(undefined);
  const imagePreview = ref<string>('');

  // Données du formulaire pour le composant Update
  const apiFormData = computed(() => ({
    title: formData.title,
    content: formData.content,
    isActive: formData.isActive,
  }));

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

  async function handleAfterUpdate() {
    console.log('handleAfterUpdate called');

    if (imageFile.value && id && typeof id === 'string') {
      try {
        console.log('Uploading image for announcement:', id);
        await Database.updateFile(imageFile.value, {
          relatedTo: 'AssociationAnnouncement',
          relatedBy: id,
          purpose: 'image',
          index: 0,
        });
        console.log('Image uploaded successfully');
      } catch (error) {
        console.error("Erreur lors de l'upload de l'image:", error);
      }
    } else {
      console.log('No image to update', {
        hasImage: !!imageFile.value,
        id,
      });
    }
  }

  async function fetchAnnouncement(): Promise<void> {
    try {
      const response = await Database.getAll(`association/${associationId}/announcement/${id}`);
      if (response) {
        formData.title = response.title || '';
        formData.content = response.content || '';
        formData.isActive = response.isActive ?? true;

        // Charger l'image existante si elle existe
        if (response.image) {
          imagePreview.value = response.image;
        }
      }
    } catch (err) {
      console.error("Erreur lors du chargement de l'annonce:", err);
    }
  }

  onMounted(async () => {
    await fetchAnnouncement();
  });

  onBeforeMount(async () => {
    const hasPremiumAccess = await crmPremiumAccess.hasAccessToPremiumFeatures(
      Permissions.ANNOUNCEMENTS_UPDATE
    );

    if (!hasPremiumAccess) {
      router.push({
        name: 'AboutPremium',
      });
      return;
    }

    if (!crmAccess.canUpdateAnnouncement) {
      router.push('/unauthorized');
      return;
    }
  });
</script>
