<template>
  <Header />
  <div class="p-6 md:px-12">
    <div v-if="loading" class="flex justify-center py-12">
      <LoadingOverlay message="Chargement de l'événement..." />
    </div>

    <div v-else class="mx-auto max-w-4xl">
      <div class="mb-6 flex items-start justify-between">
        <div>
          <h1 class="text-3xl font-bold">Modifier l'événement</h1>
          <p class="text-muted-foreground mt-1">{{ form.title }}</p>
        </div>
        <Button
          variant="outline"
          @click="router.push(`/crm/${crmStore.currentAssociationId}/events/${eventId}`)"
        >
          Annuler
        </Button>
      </div>

      <!-- Formulaire -->
      <div class="bg-card space-y-6 rounded-lg border p-6 shadow-sm">
        <div>
          <h2 class="mb-4 text-xl font-bold">Informations de l'événement</h2>
          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium">Titre *</label>
              <input
                v-model="form.title"
                type="text"
                required
                placeholder="Nom de l'événement"
                class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium">Description</label>
              <textarea
                v-model="form.description"
                rows="4"
                placeholder="Description de l'événement"
                class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              />
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium">Date de début *</label>
                <input
                  v-model="form.startDate"
                  type="datetime-local"
                  required
                  class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium">Date de fin</label>
                <input
                  v-model="form.endDate"
                  type="datetime-local"
                  class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                />
              </div>
            </div>

            <!-- Adresse -->
            <div class="border-t pt-4">
              <h3 class="mb-3 font-medium">Adresse</h3>
              <div class="space-y-4">
                <div>
                  <label class="mb-1 block text-sm font-medium">Rue *</label>
                  <input
                    v-model="form.address.street"
                    type="text"
                    required
                    placeholder="123 rue de la Paix"
                    class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  />
                </div>
                <div class="grid gap-4 md:grid-cols-2">
                  <div>
                    <label class="mb-1 block text-sm font-medium">Ville *</label>
                    <input
                      v-model="form.address.city"
                      type="text"
                      required
                      placeholder="Paris"
                      class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    />
                  </div>
                  <div>
                    <label class="mb-1 block text-sm font-medium">Code postal *</label>
                    <input
                      v-model="form.address.postcode"
                      type="text"
                      required
                      placeholder="75001"
                      class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    />
                  </div>
                </div>
                <div class="grid gap-4 md:grid-cols-2">
                  <div>
                    <label class="mb-1 block text-sm font-medium">Région</label>
                    <input
                      v-model="form.address.state"
                      type="text"
                      placeholder="Île-de-France"
                      class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    />
                  </div>
                  <div>
                    <label class="mb-1 block text-sm font-medium">Pays *</label>
                    <input
                      v-model="form.address.country"
                      type="text"
                      required
                      placeholder="France"
                      class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Image -->
            <div class="border-t pt-4">
              <h3 class="mb-3 font-medium">Image</h3>
              <ImageUpload v-model:file="imageFile" v-model:preview="imagePreview" />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 border-t pt-6">
          <Button
            variant="outline"
            @click="router.push(`/crm/${crmStore.currentAssociationId}/events/${eventId}`)"
          >
            Annuler
          </Button>
          <Button :disabled="!isFormValid || isLoading" @click="updateEvent">
            {{ isLoading ? 'Enregistrement...' : 'Enregistrer les modifications' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import Header from '@/components/dashboard/Header.vue';
  import Button from '@/components/ui/button/Button.vue';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import ImageUpload from '@/components/form/ImageUpload.vue';
  import { useCrmStore } from '@/stores/crm';
  import Database from '@/utils/database.utils';

  const router = useRouter();
  const route = useRoute();
  const crmStore = useCrmStore();
  const eventId = route.params.eventId as string;

  const loading = ref(true);
  const isLoading = ref(false);

  const form = ref({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    address: {
      street: '',
      city: '',
      postcode: '',
      state: '',
      country: 'France',
    },
  });

  const imageFile = ref<File | null>(null);
  const imagePreview = ref<string>('');

  const isFormValid = computed(() => {
    return (
      form.value.title.length >= 3 &&
      form.value.startDate &&
      form.value.address.street &&
      form.value.address.city &&
      form.value.address.postcode &&
      form.value.address.country
    );
  });

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const loadEvent = async () => {
    if (!crmStore.currentAssociationId) return;

    try {
      loading.value = true;
      const response = await Database.getOne(
        `association/${crmStore.currentAssociationId}/event`,
        eventId
      );
      const event = response;

      form.value = {
        title: event.title,
        description: event.description || '',
        startDate: formatDateForInput(event.startDate),
        endDate: event.endDate ? formatDateForInput(event.endDate) : '',
        address: {
          street: event.address?.street || '',
          city: event.address?.city || '',
          postcode: event.address?.postcode || '',
          state: event.address?.state || '',
          country: event.address?.country || 'France',
        },
      };

      // Initialiser la preview avec l'image actuelle
      imagePreview.value = event.image || '';
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      loading.value = false;
    }
  };

  const updateEvent = async () => {
    if (!crmStore.currentAssociationId || !isFormValid.value) return;

    try {
      isLoading.value = true;

      const eventData = {
        title: form.value.title,
        description: form.value.description || undefined,
        startDate: new Date(form.value.startDate).toISOString(),
        endDate: form.value.endDate ? new Date(form.value.endDate).toISOString() : undefined,
        address: form.value.address,
      };

      await Database.update(
        `association/${crmStore.currentAssociationId}/event`,
        eventId,
        eventData
      );

      // Uploader la nouvelle image si présente
      if (imageFile.value) {
        await Database.updateFile(imageFile.value, {
          relatedTo: 'Event',
          relatedBy: eventId,
          purpose: 'image',
          index: 0,
        });
      }

      console.log('Événement modifié avec succès !');
      router.push(`/crm/${crmStore.currentAssociationId}/events/${eventId}`);
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error);
      console.error(
        error.response?.data?.message || "Erreur lors de la modification de l'événement"
      );
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    loadEvent();
  });
</script>
