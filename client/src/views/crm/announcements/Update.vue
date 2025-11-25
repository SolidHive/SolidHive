<template>
  <Update
    :can-update-item="crmAccess.canUpdateAnnouncement"
    :fetch-item="`association/${associationId}/announcement/${id}`"
    :update-endpoint="`association/${associationId}/announcement/${id}`"
    :form-data="form"
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
            id="edit-is-active"
            v-model="form.isActive"
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
  import { useCrmAccess } from '@/composables/crm-access';
  import type { Announcement } from '@/interfaces/announcement.interface';
  import { useCrmStore } from '@/stores/crm';
  import Database from '@/utils/database.utils';
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import ImageUpload from '@/components/form/ImageUpload.vue';

  const Update = UpdateRaw<Announcement>;
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const associationId = route.params.id as string;
  const id = route.params.itemId;

  if (!id || typeof id !== 'string') {
    console.error('No announcement ID provided in route parameters.');
  }

  const form = ref({
    title: '',
    content: '',
    isActive: true,
  });

  const imageFile = ref<File | null>(null);
  const imagePreview = ref<string>('');

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
        form.value.title = response.title || '';
        form.value.content = response.content || '';
        form.value.isActive = response.isActive ?? true;

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
</script>
