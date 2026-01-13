<template>
  <Update
    :can-update-item="crmAccess.canUpdateAnnouncement"
    :fetch-item="`association/${associationId}/announcement/${id}`"
    :update-endpoint="`association/${associationId}/announcement/${id}`"
    :form-data="formData"
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
            id="edit-is-active"
            v-model="form.isActive.$value"
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
  import { announcementCrmErrorMessages } from '@/utils/errors/crm/announcements';
  import { computed, onBeforeMount, onMounted, reactive, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { defineForm, field, isValidForm } from 'vue-yup-form';
  import * as yup from 'yup';
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

  // Données du formulaire pour le composant Update
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

  async function handleAfterUpdate() {
    console.log('handleAfterUpdate called');

    if (imageFile.value && id && typeof id === 'string') {
      try {
        console.log('Updating image for announcement:', id);
        await Database.updateFile(imageFile.value, {
          relatedTo: 'Announcement',
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

  async function fetchAnnouncement(): Promise<void> {
    try {
      const response = await Database.getAll(`association/${associationId}/announcement/${id}`);
      if (response) {
        form.title.$value = response.title || '';
        form.content.$value = response.content || '';
        form.isActive.$value = response.isActive ?? true;

        // Charger l'image existante si elle existe
        if (response.image) {
          imagePreview.value = response.image;
        }
      }
    } catch (err) {
      console.error("Erreur lors du chargement de l'annonce:", err);
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
    await fetchAnnouncement();
  });

  onBeforeMount(async () => {
    const hasPremiumAccess = await crmPremiumAccess.hasAccessToPremiumFeatures(
      Permissions.ANNOUNCEMENTS_UPDATE
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

    if (!crmAccess.canUpdateAnnouncement) {
      router.push('/unauthorized');
      return;
    }
  });
</script>
