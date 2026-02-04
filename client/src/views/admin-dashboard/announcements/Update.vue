<template>
  <Update
    :can-update-item="true"
    :fetch-item="`admin/announcements/${id}`"
    :update-endpoint="`admin/announcements/${id}`"
    :form-data="apiFormData"
    :on-before-submit="handleBeforeSubmit"
    @after-update="handleAfterUpdate"
  >
    <template #title>Modifier l'annonce blog</template>
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
          placeholder="Ex: Nouvelle fonctionnalité, Mise à jour importante..."
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
          :rows="6"
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
    <template #description>Modifiez les informations de l'annonce blog ci-dessous.</template>
  </Update>
</template>

<script setup lang="ts">
  import { Update as UpdateRaw } from '@/components/dashboard/crud';
  import InputForm from '@/components/form/InputForm.vue';
  import TextareaForm from '@/components/form/TextareaForm.vue';
  import ImageUpload from '@/components/form/ImageUpload.vue';
  import type { Announcement } from '@/interfaces/announcement.interface';
  import Database from '@/utils/database.utils';
  import { computed, onMounted, reactive, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { updateAnnouncementValidationSchema } from '@/utils/errors/crm/announcements';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';
  import { useToast } from 'vue-toastification';

  const Update = UpdateRaw<Announcement>;
  const router = useRouter();
  const route = useRoute();
  const id = route.params.itemId;
  const toast = useToast();
  const formSubmitted = ref(false);

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

  watch(imageFile, (newValue) => {
    formData.image = newValue;
    touchedFields.image = true;
  });

  async function fetchAnnouncement(): Promise<void> {
    try {
      const response = await Database.getAll(`admin/announcements/${id}`);
      if (response) {
        formData.title = response.title || '';
        formData.content = response.content || '';
        formData.isActive = response.isActive ?? true;

        if (response.image) {
          imagePreview.value = response.image;
        }
      }
    } catch (err) {
      console.error("Erreur lors du chargement de l'annonce:", err);
      toast.error("Erreur lors du chargement de l'annonce");
    }
  }

  const handleBeforeSubmit = async () => {
    formSubmitted.value = true;

    const isValid = await validateForm();

    if (!isValid) {
      return false;
    }

    return true;
  };

  const handleAfterUpdate = async () => {
    if (imageFile.value && id && typeof id === 'string') {
      try {
        await Database.updateFile(imageFile.value, {
          relatedTo: 'Announcement',
          relatedBy: id,
          purpose: 'image',
          index: 0,
        });
        toast.success('Annonce modifiée avec succès avec la nouvelle image');
      } catch (error) {
        console.error("Erreur lors de l'upload de l'image:", error);
        toast.warning("L'annonce a été modifiée mais l'image n'a pas pu être uploadée");
      }
    } else {
      toast.success('Annonce modifiée avec succès');
    }

    router.push({ name: 'AdminDashboardAnnouncements' });
  };

  onMounted(async () => {
    await fetchAnnouncement();
  });
</script>
