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
            :error-state="showError('logoFile')"
            :error-message="getErrorMessage('logoFile')"
            @change="touchedFields.logoFile = true"
          />
          <ImageUpload
            v-model="localImageFile"
            v-model:preview="localImagePreview"
            label="Image de couverture"
            :button-text="localImagePreview ? 'Changer l\'image' : 'Ajouter une image'"
            help-text="Format recommandé : JPG ou PNG (max 5 Mo)"
            height="sm"
            :error-state="showError('imageFile')"
            :error-message="getErrorMessage('imageFile')"
            @change="touchedFields.imageFile = true"
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

        <!-- Image à propos -->
        <ImageUpload
          v-model="localAboutImageFile"
          v-model:preview="localAboutImagePreview"
          label="Image à propos"
          :button-text="
            localAboutImagePreview ? 'Changer l\'image à propos' : 'Ajouter une image à propos'
          "
          help-text="Format recommandé : JPG ou PNG (max 5 Mo)"
          height="sm"
          :error-state="showError('aboutImageFile')"
          :error-message="getErrorMessage('aboutImageFile')"
        />

        <!-- Galerie d'images -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium">Galerie d'images</label>
            <div>
              <input
                ref="multipleFileInput"
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="handleMultipleFileSelect"
                @input="clearValidationErrors(validationErrors, 'galleryImages')"
              />
              <Button type="button" variant="outline" size="sm" @click="triggerMultipleFileInput">
                <Plus class="mr-2 h-4 w-4" />
                Ajouter des images
              </Button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div
              v-for="(galleryImage, index) in galleryImages"
              :key="galleryImage.url || galleryImage.preview || `empty-${index}`"
              class="group relative"
            >
              <div
                class="bg-muted aspect-square overflow-hidden rounded-lg border-2"
                :class="galleryImage.url || galleryImage.preview ? 'border-solid' : 'border-dashed'"
              >
                <img
                  v-if="galleryImage.preview || galleryImage.url"
                  :src="galleryImage.preview || galleryImage.url"
                  alt="Image de galerie"
                  class="h-full w-full object-cover"
                />
              </div>

              <div
                class="absolute top-2 right-2 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  class="h-7 w-7 p-0 shadow-lg sm:h-8 sm:w-8"
                  @click.stop="removeGalleryImage(index)"
                >
                  <X class="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>

              <div v-if="galleryImage.file" class="mt-2 text-center">
                <span class="text-xs text-green-600">Nouvelle</span>
              </div>
            </div>
          </div>

          <p class="text-muted-foreground text-xs">
            Images de la galerie pour présenter votre association (max 10 Mo par image)
          </p>

          <p v-if="showError('galleryImages')" class="text-destructive mt-1 text-xs">
            {{ getErrorMessage('galleryImages') }}
          </p>
        </div>

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
  import { ref, reactive, watch, computed, nextTick } from 'vue';
  import { associationValidationSchema } from '@/utils/errors/crm/associations';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';
  import { Plus, X } from 'lucide-vue-next';

  const props = defineProps<{
    modelValue: boolean;
    association: Association | null;
    isLoading: boolean;
    logoPreview: string;
    imagePreview: string;
    logoFile: File | null | undefined;
    imageFile: File | null | undefined;
    aboutImagePreview: string;
    aboutImageFile: File | null | undefined;
    galleryImages: Array<{
      index?: number;
      url?: string;
      file?: File;
      preview?: string;
      isNew?: boolean;
    }>;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'update:logoFile', value: File | null | undefined): void;
    (e: 'update:imageFile', value: File | null | undefined): void;
    (e: 'update:aboutImageFile', value: File | null | undefined): void;
    (e: 'update:logoPreview', value: string): void;
    (e: 'update:imagePreview', value: string): void;
    (e: 'update:aboutImagePreview', value: string): void;
    (
      e: 'update:galleryImages',
      value: Array<{ index?: number; url?: string; file?: File; preview?: string; isNew?: boolean }>
    ): void;
    (
      e: 'submit',
      data: {
        name: string;
        description?: string;
        aboutText?: string;
        contact?: string;
        primaryColor?: string;
        galleryFiles?: { file: File; replaceIndex?: number }[];
        imagesToDelete?: number[];
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

  const localAboutImageFile = computed({
    get: () => props.aboutImageFile,
    set: (value) => emit('update:aboutImageFile', value),
  });

  const localAboutImagePreview = computed({
    get: () => props.aboutImagePreview,
    set: (value) => emit('update:aboutImagePreview', value),
  });

  const galleryImages = computed({
    get: () => props.galleryImages,
    set: (value) => emit('update:galleryImages', value),
  });

  const multipleFileInput = ref<HTMLInputElement>();
  const initialGalleryImages = ref<Array<{ index: number; url?: string }>>([]);

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
    logoFile: false,
    imageFile: false,
    aboutImageFile: false,
    galleryImages: false,
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
    async (isOpen) => {
      if (isOpen) {
        initializeForm();
        await nextTick();
        initialGalleryImages.value = (props.galleryImages || [])
          .filter((img) => img.index !== undefined)
          .map((img) => ({
            index: img.index!,
            url: img.url,
          }));
      }
    }
  );

  watch(localLogoFile, () => {
    touchedFields.logoFile = true;
  });

  watch(localImageFile, () => {
    touchedFields.imageFile = true;
  });

  watch(localAboutImageFile, () => {
    touchedFields.aboutImageFile = true;
  });

  const validateForm = async () => {
    const dataToValidate = {
      ...formData,
      logoFile: localLogoFile.value || undefined,
      imageFile: localImageFile.value || undefined,
      aboutImageFile: localAboutImageFile.value || undefined,
      galleryImages: galleryImages.value,
    };

    const result = await validateWithYup(associationValidationSchema, dataToValidate);

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

    const galleryFiles = galleryImages.value
      .filter((img) => img.file)
      .map((img) => ({ file: img.file! }));

    const currentImageIndexes = galleryImages.value
      .filter((img) => img.index !== undefined)
      .map((img) => img.index!);

    const imagesToDelete = initialGalleryImages.value
      .filter((initialImg) => !currentImageIndexes.includes(initialImg.index))
      .map((img) => img.index);

    emit('submit', {
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      aboutText: formData.aboutText?.trim() || undefined,
      contact: formData.contact?.trim() || undefined,
      primaryColor: formData.primaryColor || undefined,
      galleryFiles: galleryFiles.length > 0 ? galleryFiles : undefined,
      imagesToDelete: imagesToDelete.length > 0 ? imagesToDelete : undefined,
    });
  };

  const handleCancel = () => {
    emit('update:modelValue', false);
  };

  const triggerMultipleFileInput = () => {
    multipleFileInput.value?.click();
  };

  const handleMultipleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      const newImages = Array.from(files).map((file) => {
        const reader = new FileReader();
        return new Promise<{ file: File; preview: string; isNew: boolean }>((resolve) => {
          reader.onload = (e) => {
            resolve({
              file,
              preview: e.target?.result as string,
              isNew: true,
            });
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(newImages).then(async (images) => {
        galleryImages.value = [...galleryImages.value, ...images];
        touchedFields.galleryImages = true;
        await validateForm();
      });
    }

    target.value = '';
  };

  const removeGalleryImage = async (index: number) => {
    const newGalleryImages = galleryImages.value.filter((_, i) => i !== index);
    galleryImages.value = newGalleryImages;
  };
</script>
