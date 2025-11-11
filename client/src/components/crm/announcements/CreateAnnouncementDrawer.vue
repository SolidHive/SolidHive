<template>
  <Drawer v-if="canCreateAnnouncement" v-model:open="isOpen">
    <DrawerContent>
      <div class="overflow-auto">
        <div class="mx-auto w-full max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>Créer une nouvelle annonce</DrawerTitle>
            <DrawerDescription>
              Créez une annonce pour informer les membres de votre association.
            </DrawerDescription>
          </DrawerHeader>
          <div class="space-y-4 overflow-y-auto p-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Titre</label>
              <input
                v-model="announcementForm.title"
                type="text"
                placeholder="Ex: Nouvelle réunion, Événement à venir..."
                class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Contenu</label>
              <textarea
                v-model="announcementForm.content"
                placeholder="Décrivez votre annonce..."
                rows="4"
                class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <!-- Upload Image -->
            <div class="space-y-2">
              <label class="text-sm font-medium">Image de l'annonce</label>
              <div class="flex items-center gap-4">
                <div
                  class="bg-muted border-border flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed"
                >
                  <ImageIcon v-if="!imagePreview" class="text-muted-foreground h-10 w-10" />
                  <img
                    v-else
                    :src="imagePreview"
                    alt="Image preview"
                    class="h-full w-full rounded-lg object-cover"
                  />
                </div>
                <div class="flex-1">
                  <input
                    ref="imageInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleImageUpload"
                  />
                  <button
                    type="button"
                    class="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors"
                    @click="imageInput?.click()"
                  >
                    <Upload class="mr-2 h-4 w-4" />
                    Choisir une image
                  </button>
                  <p class="text-muted-foreground mt-2 text-xs">
                    Format : PNG, JPG, WEBP (max 5 Mo)
                  </p>
                  <p v-if="imageError" class="text-destructive mt-2 text-sm">
                    {{ imageError }}
                  </p>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <input
                id="is-active"
                v-model="announcementForm.isActive"
                type="checkbox"
                class="border-input bg-background ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:ring-2 focus-visible:ring-offset-2"
              />
              <label for="is-active" class="text-sm font-medium">Annonce active</label>
            </div>
          </div>
          <DrawerFooter>
            <button
              :disabled="!announcementForm.title || !announcementForm.content || isLoading"
              class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              @click="handleCreate"
            >
              {{ isLoading ? 'Création...' : "Créer l'annonce" }}
            </button>
            <DrawerClose as-child>
              <button
                class="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                @click="resetForm"
              >
                Annuler
              </button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
  } from '@/components/ui/drawer';
  import Database from '@/utils/database.utils';
  import { useToast } from 'vue-toastification';
  import { Upload, Image as ImageIcon } from 'lucide-vue-next';

  const props = defineProps<{
    open: boolean;
    associationId: string;
    canCreateAnnouncement: boolean;
  }>();

  const emit = defineEmits<{
    'update:open': [value: boolean];
    'announcement-created': [];
  }>();

  const toast = useToast();
  const isLoading = ref(false);
  const imageFile = ref<File | null>(null);
  const imagePreview = ref<string>('');
  const imageInput = ref<HTMLInputElement | null>(null);
  const imageError = ref<string>('');

  const announcementForm = ref({
    title: '',
    content: '',
    isActive: true,
  });

  const isOpen = computed({
    get: () => props.open,
    set: (value) => emit('update:open', value),
  });

  function handleImageUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    imageError.value = '';

    if (file) {
      // Validation du type de fichier
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
        imageError.value = 'Format invalide. Utilisez PNG, JPG, GIF ou WEBP.';
        imageFile.value = null;
        imagePreview.value = '';
        return;
      }

      // Validation de la taille (5 Mo max)
      if (file.size > 5 * 1024 * 1024) {
        imageError.value = "L'image ne doit pas dépasser 5 Mo.";
        imageFile.value = null;
        imagePreview.value = '';
        return;
      }

      imageFile.value = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.value = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleCreate() {
    if (!props.canCreateAnnouncement) {
      toast.error("Vous n'avez pas la permission de créer une annonce.");
      return;
    }

    try {
      isLoading.value = true;

      // 1. Créer l'annonce
      const response = await Database.create(`association/${props.associationId}/announcement`, {
        title: announcementForm.value.title,
        content: announcementForm.value.content,
        isActive: announcementForm.value.isActive,
      });

      console.log('Annonce créée:', response);
      // 2. Si une image est présente, l'uploader
      if (imageFile.value && response.data?.id) {
        const announcementId = response.data.id;

        await Database.uploadFile('/files', imageFile.value, {
          relatedTo: 'AssociationAnnouncement',
          relatedBy: announcementId,
          purpose: 'image',
          index: '0',
        });
      }

      toast.success('Annonce créée avec succès !');
      isOpen.value = false;
      resetForm();
      emit('announcement-created');
    } catch (err: any) {
      console.error("Erreur lors de la création de l'annonce:", err);
      const errorMessage =
        err?.response?.data?.message || "Erreur lors de la création de l'annonce.";
      toast.error(errorMessage);
    } finally {
      isLoading.value = false;
    }
  }

  function resetForm() {
    announcementForm.value = {
      title: '',
      content: '',
      isActive: true,
    };
    imageFile.value = null;
    imagePreview.value = '';
    imageError.value = '';
  }
</script>
