<template>
  <div>
    <!-- Étape 1: Informations de l'association -->
    <form v-if="currentStepLocal === 1" class="space-y-6" @submit.prevent="handleStep1Submit">
      <!-- Nom de l'association -->
      <InputForm
        v-model="formData.name"
        input-name="association-name"
        type="text"
        placeholder="Association Solidaire"
        :error-message="getErrorMessage('name')"
        :error-state="showAssociationError('name')"
        @input="clearValidationErrors(validationErrors, 'name')"
        @blur="() => (touchedAssociationFields.name = true)"
      >
        <template #label>
          Nom de l'association
          <span class="text-destructive">*</span>
        </template>
        <template #hint>
          <div>Le nom officiel de votre association tel qu'il apparaît sur vos documents.</div>
        </template>
      </InputForm>

      <!-- Description -->
      <TextareaForm
        v-model="formData.description"
        input-name="association-description"
        placeholder="Décrivez votre association, ses missions, ses objectifs..."
        :rows="4"
        :error-message="getErrorMessage('description')"
        :error-state="showAssociationError('description')"
        @input="clearValidationErrors(validationErrors, 'description')"
        @blur="() => (touchedAssociationFields.description = true)"
      >
        <template #label>
          Description
          <span class="text-destructive">*</span>
        </template>
      </TextareaForm>

      <!-- Email de contact -->
      <InputForm
        v-model="formData.contact"
        input-name="association-contact"
        type="email"
        placeholder="contact@association.fr"
        :error-message="getErrorMessage('contact')"
        :error-state="showAssociationError('contact')"
        @input="clearValidationErrors(validationErrors, 'contact')"
        @blur="() => (touchedAssociationFields.contact = true)"
      >
        <template #label>
          Email de contact
          <span class="text-destructive">*</span>
        </template>
        <template #hint>
          <div>
            Adresse email professionnelle de l'association pour être contacté par les bénévoles et
            donateurs.
          </div>
        </template>
      </InputForm>

      <!-- SIRET -->
      <InputForm
        v-model="formData.siret"
        input-name="association-siret"
        type="text"
        placeholder="12345678901234"
        :error-message="getErrorMessage('siret')"
        :error-state="showAssociationError('siret')"
        @input="clearValidationErrors(validationErrors, 'siret')"
        @blur="() => (touchedAssociationFields.siret = true)"
      >
        <template #label>
          SIRET
          <span class="text-destructive">*</span>
        </template>
        <template #hint>
          <div>
            Numéro SIRET de l'association (14 chiffres). Ce numéro permet d'identifier légalement
            votre association.
          </div>
        </template>
      </InputForm>

      <!-- Couleur principale -->
      <div>
        <label class="font-paragraph text-foreground mb-2 block text-sm font-medium">
          Couleur principale
          <span class="text-destructive">*</span>
        </label>
        <div class="flex items-start gap-4">
          <input
            v-model="formData.primaryColor"
            type="color"
            class="border-border h-12 w-12 cursor-pointer rounded border"
            @input="clearValidationErrors(validationErrors, 'primaryColor')"
            @blur="() => (touchedAssociationFields.primaryColor = true)"
          />
          <div class="flex-1">
            <InputForm
              v-model="formData.primaryColor"
              input-name="association-primary-color-text"
              type="text"
              placeholder="#000000"
              maxlength="7"
              :error-message="getErrorMessage('primaryColor')"
              :error-state="showAssociationError('primaryColor')"
              @input="clearValidationErrors(validationErrors, 'primaryColor')"
              @blur="() => (touchedAssociationFields.primaryColor = true)"
            />
          </div>
        </div>
        <p class="font-paragraph text-muted-foreground mt-2 text-xs">
          Format hexadécimal (ex: #FF0000 pour rouge)
        </p>
      </div>

      <!-- Boutons -->
      <div class="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button v-if="showBackButton" type="button" variant="outline" @click="$emit('back')">
          <ChevronLeft class="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div v-else />
        <Button type="submit" variant="default" size="lg" :disabled="isLoading">
          <svg
            v-if="isLoading"
            class="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Continuer
        </Button>
      </div>
    </form>

    <!-- Étape 2: Logo et bannière -->
    <form v-else-if="currentStepLocal === 2" class="space-y-6" @submit.prevent="handleStep2Submit">
      <!-- Upload Logo -->
      <div>
        <label class="font-paragraph text-foreground mb-2 block text-sm font-medium">
          Logo de l'association
          <span class="text-destructive">*</span>
        </label>
        <div class="flex items-center gap-4">
          <div
            :class="[
              'bg-muted flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed',
              fileErrors.logo ? 'border-destructive' : 'border-border',
            ]"
          >
            <Building2 v-if="!logoPreview" class="text-muted-foreground h-10 w-10" />
            <img
              v-else
              :src="logoPreview"
              alt="Logo preview"
              class="h-full w-full rounded-2xl object-cover"
            />
          </div>
          <div class="flex-1">
            <input
              ref="logoInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleLogoUpload"
            />
            <Button type="button" variant="outline" size="sm" @click="logoInput?.click()">
              <Upload class="mr-2 h-4 w-4" />
              Choisir un logo
            </Button>
            <p class="font-paragraph text-muted-foreground mt-2 text-xs">
              Format recommandé : carré, PNG ou JPG (max 5 Mo)
            </p>
            <p v-if="fileErrors.logo" class="font-paragraph text-destructive mt-2 text-sm">
              {{ fileErrors.logo }}
            </p>
          </div>
        </div>
      </div>

      <!-- Upload Bannière -->
      <div>
        <label class="font-paragraph text-foreground mb-2 block text-sm font-medium">
          Bannière de l'association
          <span class="text-destructive">*</span>
        </label>
        <div class="space-y-4">
          <div
            :class="[
              'bg-muted flex h-32 items-center justify-center rounded-2xl border-2 border-dashed',
              fileErrors.background ? 'border-destructive' : 'border-border',
            ]"
          >
            <Image v-if="!backgroundPreview" class="text-muted-foreground h-10 w-10" />
            <img
              v-else
              :src="backgroundPreview"
              alt="Background preview"
              class="h-full w-full rounded-2xl object-cover"
            />
          </div>
          <div>
            <input
              ref="backgroundInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleBackgroundUpload"
            />
            <Button type="button" variant="outline" size="sm" @click="backgroundInput?.click()">
              <Upload class="mr-2 h-4 w-4" />
              Choisir une bannière
            </Button>
            <p class="font-paragraph text-muted-foreground mt-2 text-xs">
              Format recommandé : 16:9, PNG ou JPG (max 10 Mo)
            </p>
            <p v-if="fileErrors.background" class="font-paragraph text-destructive mt-2 text-sm">
              {{ fileErrors.background }}
            </p>
          </div>
        </div>
      </div>

      <!-- Boutons -->
      <div class="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" @click="currentStepLocal = 1">
          <ChevronLeft class="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Button type="submit" variant="default" size="lg" :disabled="isLoading">
          <svg
            v-if="isLoading"
            class="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ isLoading ? 'Création en cours...' : submitButtonText }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import InputForm from '@/components/form/InputForm.vue';
  import TextareaForm from '@/components/form/TextareaForm.vue';
  import { Button } from '@/components/ui/button';
  import { ChevronLeft, Building2, Upload, Image } from 'lucide-vue-next';
  import {
    associationValidationMessages,
    associationValidationSchema,
  } from '@/utils/errors/associations';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';
  import { useToast } from 'vue-toastification';

  // Props
  defineProps<{
    isLoading: boolean;
    showBackButton?: boolean;
    submitButtonText?: string;
  }>();

  // Emits
  const emit = defineEmits<{
    back: [];
    submit: [
      data: {
        associationData: {
          name: string;
          description: string;
          contact: string;
          siret: string;
          primaryColor: string;
        };
        logoFile: File | null;
        backgroundFile: File | null;
      },
    ];
  }>();

  const toast = useToast();
  const currentStepLocal = ref(1);
  const formSubmitted = ref(false);

  // Données du formulaire
  const formData = reactive({
    name: '',
    description: '',
    contact: '',
    siret: '',
    primaryColor: '#000000',
  });

  // Erreurs de validation
  const validationErrors = reactive<Record<string, string>>({});

  // Erreurs des fichiers
  const fileErrors = reactive({
    logo: '',
    background: '',
  });

  // Fichiers
  const logoFile = ref<File | null>(null);
  const backgroundFile = ref<File | null>(null);
  const logoPreview = ref<string>('');
  const backgroundPreview = ref<string>('');
  const logoInput = ref<HTMLInputElement | null>(null);
  const backgroundInput = ref<HTMLInputElement | null>(null);

  // Gestion erreurs pour affichage
  const touchedAssociationFields = reactive({
    name: false,
    description: false,
    contact: false,
    siret: false,
    primaryColor: false,
  });

  const showAssociationError = (
    fieldName: 'name' | 'description' | 'contact' | 'siret' | 'primaryColor'
  ) =>
    (touchedAssociationFields[fieldName] || formSubmitted.value) && !!validationErrors[fieldName];

  const getErrorMessage = (
    fieldName: 'name' | 'description' | 'contact' | 'siret' | 'primaryColor'
  ) =>
    touchedAssociationFields[fieldName] || formSubmitted.value
      ? validationErrors[fieldName] || ''
      : '';

  const validateForm = async () => {
    const result = await validateWithYup(associationValidationSchema, formData);

    if (result.isValid) {
      clearValidationErrors(validationErrors);
    } else {
      Object.assign(validationErrors, result.errors);
    }

    return result.isValid;
  };

  // Gestion uploads
  function handleLogoUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    fileErrors.logo = '';

    if (file) {
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
        fileErrors.logo = associationValidationMessages.format.logo;
        logoFile.value = null;
        logoPreview.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        fileErrors.logo = associationValidationMessages.size.logo;
        logoFile.value = null;
        logoPreview.value = '';
        return;
      }

      logoFile.value = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        logoPreview.value = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  function handleBackgroundUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    fileErrors.background = '';

    if (file) {
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
        fileErrors.background = associationValidationMessages.format.background;
        backgroundFile.value = null;
        backgroundPreview.value = '';
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        fileErrors.background = associationValidationMessages.size.background;
        backgroundFile.value = null;
        backgroundPreview.value = '';
        return;
      }

      backgroundFile.value = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        backgroundPreview.value = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Soumission étape 1
  async function handleStep1Submit() {
    formSubmitted.value = true;

    // Valider le formulaire association
    if (!(await validateForm())) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    // Passer à l'étape 2
    currentStepLocal.value = 2;
  }

  // Soumission étape 2
  async function handleStep2Submit() {
    fileErrors.logo = '';
    fileErrors.background = '';
    let hasError = false;

    if (!logoFile.value) {
      fileErrors.logo = associationValidationMessages.required.logo;
      hasError = true;
    }

    if (!backgroundFile.value) {
      fileErrors.background = associationValidationMessages.required.background;
      hasError = true;
    }

    if (hasError) {
      toast.error('Veuillez ajouter le logo et la bannière de votre association');
      return;
    }

    emit('submit', {
      associationData: {
        name: formData.name.trim(),
        description: formData.description.trim(),
        contact: formData.contact.trim(),
        siret: formData.siret.trim(),
        primaryColor: formData.primaryColor.trim(),
      },
      logoFile: logoFile.value,
      backgroundFile: backgroundFile.value,
    });
  }
</script>
