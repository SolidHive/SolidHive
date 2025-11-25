<template>
  <Create
    :can-create-item="crmAccess.canCreateFundraising"
    :create-endpoint="`association/${associationId}/fundraising`"
    :form-data="form"
    @after-create="handleAfterCreate"
  >
    <template #title>Créer une nouvelle cagnotte</template>
    <template #form>
      <div class="space-y-4 p-4">
        <ImageUpload
          v-model="imageFile"
          v-model:preview="imagePreview"
          label="Image de la cagnotte"
          button-text="Choisir une image"
          help-text="Format recommandé : PNG ou JPG (max 5 Mo)"
          height="md"
        />

        <div class="space-y-2">
          <label class="text-sm font-medium">Titre *</label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="Ex: Aide pour les enfants, Projet solidaire..."
            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Description *</label>
          <textarea
            v-model="form.description"
            placeholder="Décrivez votre cagnotte..."
            required
            rows="4"
            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Montant souhaité *</label>
            <input
              v-model.number="form.wantedAmount"
              required
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Date de début *</label>
            <input
              v-model="form.startDate"
              type="datetime-local"
              required
              class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">Date de fin *</label>
            <input
              v-model="form.endDate"
              type="datetime-local"
              class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>
        </div>
      </div>
    </template>
    <template #description>
      Créez une cagnotte pour collecter des fonds pour votre association.
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
    description: '',
    amount: 0,
    wantedAmount: 0,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: '',
  });

  const imageFile = ref<File | null>(null);
  const imagePreview = ref<string>('');

  async function handleAfterCreate(createdItem: any) {
    console.log('handleAfterCreate called with:', createdItem);

    if (imageFile.value && createdItem?.data?.id) {
      try {
        console.log('Uploading image for fundraising:', createdItem.data.id);
        await Database.uploadFile(imageFile.value, {
          relatedTo: 'Fundraising',
          relatedBy: createdItem.data.id,
          purpose: 'image',
          index: 0,
        });
        console.log('Image uploaded successfully');
      } catch (error) {
        console.error("Erreur lors de l'upload de l'image:", error);
      }
    } else {
      console.log('No image to upload or missing fundraising id', {
        hasImage: !!imageFile.value,
        createdItem,
      });
    }
  }
</script>
