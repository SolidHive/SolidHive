<template>
  <Create
    :can-create-item="crmAccess.canCreateAnnouncement"
    :create-endpoint="`association/${associationId}/announcement`"
    :form-data="formData"
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
        />

        <InputForm
          v-model="form.title.$value"
          input-name="announcement-title"
          type="text"
          placeholder="Ex: Nouvelle réunion, Événement à venir..."
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
          v-model="form.content.$value"
          input-name="announcement-content"
          placeholder="Décrivez votre annonce..."
          :rows="4"
          :max-length="1000"
          :error-message="form.content.$error?.message || ''"
          :error-state="showError('content')"
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
            v-model="form.isActive.$value"
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
  import { announcementCrmErrorMessages } from '@/utils/errors/crm/announcements';
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
        .required(announcementCrmErrorMessages.required.title)
        .min(5, announcementCrmErrorMessages.minLength.title)
        .max(100, announcementCrmErrorMessages.maxLength.title)
    ),
    content: field(
      '',
      yup
        .string()
        .required(announcementCrmErrorMessages.required.content)
        .min(10, announcementCrmErrorMessages.minLength.content)
        .max(1000, announcementCrmErrorMessages.maxLength.content)
    ),
    isActive: field(true, yup.boolean()),
  });

  // Gestion des champs touchés
  const touchedFields = reactive({
    title: false,
    content: false,
  });

  const showError = (fieldName: keyof typeof touchedFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!form[fieldName].$error;

  const imageFile = ref<File | null>(null);
  const imagePreview = ref<string>('');

  // Données du formulaire pour le composant Create
  const formData = computed(() => ({
    title: form.title.$value,
    content: form.content.$value,
    isActive: form.isActive.$value,
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
</script>
