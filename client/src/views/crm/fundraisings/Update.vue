<template>
  <Update
    :can-update-item="crmAccess.canUpdateFundraising"
    :fetch-item="`association/${associationId}/fundraising/${id}`"
    :update-endpoint="`association/${associationId}/fundraising/${id}`"
    :form-data="form"
    @after-update="handleAfterUpdate"
  >
    <template #title>Modifier la cagnotte</template>
    <template #form>
      <div class="space-y-4 p-4">
        <ImageUpload
          v-model="imageFile"
          v-model:preview="imagePreview"
          label="Image de la cagnotte"
          :button-text="imagePreview ? 'Changer l\'image' : 'Choisir une image'"
          help-text="Format recommandé : PNG ou JPG (max 5 Mo)"
          height="md"
        />

        <div class="space-y-2">
          <label class="text-sm font-medium">Titre *</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="Ex: Aide pour les enfants, Projet solidaire..."
            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Description</label>
          <textarea
            v-model="form.description"
            placeholder="Décrivez votre cagnotte..."
            rows="4"
            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Montant souhaité *</label>
            <input
              v-model.number="form.wantedAmount"
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
              class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">Date de fin</label>
            <input
              v-model="form.endDate"
              type="datetime-local"
              class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </template>
    <template #description>Modifiez les informations de la cagnotte ci-dessous.</template>
  </Update>
</template>

<script setup lang="ts">
  import { Update as UpdateRaw } from '@/components/dashboard/crud';
  import { useCrmAccess } from '@/composables/crm-access';
  import type { Fundraising } from '@/interfaces';
  import { useCrmStore } from '@/stores/crm';
  import Database from '@/utils/database.utils';
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import ImageUpload from '@/components/form/ImageUpload.vue';

  const Update = UpdateRaw<Fundraising>;
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const associationId = route.params.id as string;
  const id = route.params.itemId;

  if (!id || typeof id !== 'string') {
    console.error('No fundraising ID provided in route parameters.');
  }

  const form = ref({
    title: '',
    description: '',
    amount: 0,
    wantedAmount: 0,
    startDate: '',
    endDate: '',
  });

  const imageFile = ref<File | null>(null);
  const imagePreview = ref<string>('');

  async function handleAfterUpdate() {
    console.log('handleAfterUpdate called');

    if (imageFile.value && id && typeof id === 'string') {
      try {
        console.log('Updating image for fundraising:', id);
        await Database.updateFile(imageFile.value, {
          relatedTo: 'Fundraising',
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

  async function fetchFundraising(): Promise<void> {
    try {
      const response = await Database.getAll(`association/${associationId}/fundraising/${id}`);
      if (response) {
        form.value.title = response.title || '';
        form.value.description = response.description || '';
        form.value.amount = response.amount || 0;
        form.value.wantedAmount = response.wantedAmount || 0;
        form.value.startDate = response.startDate
          ? new Date(response.startDate).toISOString().slice(0, 16)
          : '';
        form.value.endDate = response.endDate
          ? new Date(response.endDate).toISOString().slice(0, 16)
          : '';

        // Charger l'image existante si elle existe
        if (response.image) {
          imagePreview.value = response.image;
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la cagnotte:', err);
    }
  }

  onMounted(async () => {
    await fetchFundraising();
  });
</script>
