<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Modifier l'association</DialogTitle>
        <DialogDescription>
          Modifiez les informations de votre association ci-dessous.
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-4 py-4">
        <!-- Images -->
        <div class="grid gap-4 md:grid-cols-2">
          <ImageUpload
            v-model="localLogoFile"
            v-model:preview="localLogoPreview"
            label="Logo"
            :button-text="localLogoPreview ? 'Changer le logo' : 'Ajouter un logo'"
            help-text="Format recommandé : PNG avec fond transparent (max 5 Mo)"
            height="sm"
          />
          <ImageUpload
            v-model="localImageFile"
            v-model:preview="localImagePreview"
            label="Image de couverture"
            :button-text="localImagePreview ? 'Changer l\'image' : 'Ajouter une image'"
            help-text="Format recommandé : JPG ou PNG (max 5 Mo)"
            height="sm"
          />
        </div>

        <InputForm
          v-model="formData.name"
          input-name="association-name"
          type="text"
          placeholder="Nom de l'association"
          :error-message="getErrorMessage('name')"
          :error-state="showError('name')"
          @input="clearValidationErrors(validationErrors, 'name')"
          @blur="() => (touchedFields.name = true)"
        >
          <template #label>
            Nom
            <span class="text-destructive">*</span>
          </template>
        </InputForm>

        <TextareaForm
          v-model="formData.description"
          input-name="association-description"
          placeholder="Description de l'association"
          :error-message="getErrorMessage('description')"
          :error-state="showError('description')"
          :rows="3"
          :max-length="1000"
          @input="clearValidationErrors(validationErrors, 'description')"
          @blur="() => (touchedFields.description = true)"
        >
          <template #label>Description</template>
        </TextareaForm>

        <TextareaForm
          v-model="formData.aboutText"
          input-name="association-about"
          placeholder="Texte à propos de l'association"
          :error-message="getErrorMessage('aboutText')"
          :error-state="showError('aboutText')"
          :rows="3"
          :max-length="1000"
          @input="clearValidationErrors(validationErrors, 'aboutText')"
          @blur="() => (touchedFields.aboutText = true)"
        >
          <template #label>À propos</template>
        </TextareaForm>

        <InputForm
          v-model="formData.contact"
          input-name="association-contact"
          type="text"
          placeholder="Email ou téléphone"
          :error-message="getErrorMessage('contact')"
          :error-state="showError('contact')"
          @input="clearValidationErrors(validationErrors, 'contact')"
          @blur="() => (touchedFields.contact = true)"
        >
          <template #label>Contact</template>
        </InputForm>

        <div class="flex flex-col space-y-2">
          <label class="text-sm font-medium">Couleur principale</label>
          <input
            v-model="formData.primaryColor"
            type="color"
            class="border-input bg-background ring-offset-background h-10 w-40 rounded-md border px-1"
            @input="clearValidationErrors(validationErrors, 'primaryColor')"
            @blur="() => (touchedFields.primaryColor = true)"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="handleCancel">Annuler</Button>
        <Button :disabled="isLoading" @click="handleSubmit">
          {{ isLoading ? 'Enregistrement...' : 'Enregistrer' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
  import Button from '@/components/ui/button/Button.vue';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
  import ImageUpload from '@/components/form/ImageUpload.vue';
  import InputForm from '@/components/form/InputForm.vue';
  import TextareaForm from '@/components/form/TextareaForm.vue';
  import type { Association } from '@/interfaces';
  import { ref, reactive, watch, computed } from 'vue';
  import { associationValidationSchema } from '@/utils/errors/crm/associations';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';

  const props = defineProps<{
    modelValue: boolean;
    association: Association | null;
    isLoading: boolean;
    logoPreview: string;
    imagePreview: string;
    logoFile: File | undefined;
    imageFile: File | undefined;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'update:logoFile', value: File | undefined): void;
    (e: 'update:imageFile', value: File | undefined): void;
    (e: 'update:logoPreview', value: string): void;
    (e: 'update:imagePreview', value: string): void;
    (
      e: 'submit',
      data: {
        name: string;
        description?: string;
        aboutText?: string;
        contact?: string;

        primaryColor?: string;
      }
    ): void;
  }>();

  const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  });

  const localLogoFile = computed({
    get: () => props.logoFile,
    set: (value) => emit('update:logoFile', value),
  });

  const localImageFile = computed({
    get: () => props.imageFile,
    set: (value) => emit('update:imageFile', value),
  });

  const localLogoPreview = computed({
    get: () => props.logoPreview,
    set: (value) => emit('update:logoPreview', value),
  });

  const localImagePreview = computed({
    get: () => props.imagePreview,
    set: (value) => emit('update:imagePreview', value),
  });

  const formSubmitted = ref(false);

  // Données du formulaire
  const formData = reactive({
    name: '',
    description: '',
    aboutText: '',
    contact: '',
    primaryColor: '#000000',
  });

  // Erreurs de validation
  const validationErrors = reactive<Record<string, string>>({});

  // Champs touchés
  const touchedFields = reactive({
    name: false,
    description: false,
    aboutText: false,
    contact: false,
    primaryColor: false,
  });

  const showError = (fieldName: keyof typeof touchedFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!validationErrors[fieldName];

  const getErrorMessage = (fieldName: keyof typeof touchedFields) =>
    touchedFields[fieldName] || formSubmitted.value ? validationErrors[fieldName] || '' : '';

  // Fonction pour initialiser le formulaire avec les données de l'association
  const initializeForm = () => {
    if (props.association) {
      formData.name = props.association.name || '';
      formData.description = props.association.description || '';
      formData.aboutText = props.association.aboutText || '';
      formData.contact = props.association.contact || '';
      formData.primaryColor = props.association.primaryColor || '#000000';

      // Réinitialiser les erreurs et les champs touchés
      clearValidationErrors(validationErrors);
      Object.keys(touchedFields).forEach((key) => {
        touchedFields[key as keyof typeof touchedFields] = false;
      });
      formSubmitted.value = false;
    }
  };

  // Initialiser le formulaire quand le dialog s'ouvre
  watch(
    () => props.modelValue,
    (isOpen) => {
      if (isOpen) {
        initializeForm();
      }
    }
  );

  const validateForm = async () => {
    const result = await validateWithYup(associationValidationSchema, formData);

    if (result.isValid) {
      clearValidationErrors(validationErrors);
    } else {
      Object.assign(validationErrors, result.errors);
    }

    return result.isValid;
  };

  const handleSubmit = async () => {
    formSubmitted.value = true;

    if (!(await validateForm())) {
      return;
    }

    emit('submit', {
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      aboutText: formData.aboutText?.trim() || undefined,
      contact: formData.contact?.trim() || undefined,
      primaryColor: formData.primaryColor || undefined,
    });
  };

  const handleCancel = () => {
    emit('update:modelValue', false);
  };
</script>
