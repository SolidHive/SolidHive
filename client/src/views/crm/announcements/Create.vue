<template>
  <Create
    :can-create-item="crmAccess.canCreateAnnouncement"
    :create-endpoint="`association/${associationId}/announcement`"
    :form-data="form"
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

        <div class="space-y-2">
          <label class="text-sm font-medium">Titre *</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="Ex: Nouvelle réunion, Événement à venir..."
            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Contenu *</label>
          <textarea
            v-model="form.content"
            placeholder="Décrivez votre annonce..."
            rows="4"
            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div class="flex items-center space-x-2">
          <input
            id="is-active"
            v-model="form.isActive"
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
  import { useCrmAccess } from '@/composables/crm-access';
  import { useCrmStore } from '@/stores/crm';
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import ImageUpload from '@/components/form/ImageUpload.vue';
  import Database from '@/utils/database.utils';

  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const associationId = route.params.id as string;

  const form = ref({
    title: '',
    content: '',
    isActive: true,
  });

  const imageFile = ref<File | null>(null);
  const imagePreview = ref<string>('');

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
