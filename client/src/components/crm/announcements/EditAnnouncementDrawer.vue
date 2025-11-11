<template>
  <Drawer v-if="canUpdateAnnouncement" v-model:open="isOpen">
    <DrawerContent>
      <div class="overflow-auto">
        <div class="mx-auto w-full max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>Modifier l'annonce</DrawerTitle>
            <DrawerDescription>
              Modifiez les informations de l'annonce
              <strong>{{ announcement?.title }}</strong>
              .
            </DrawerDescription>
          </DrawerHeader>
          <div class="space-y-4 p-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Titre *</label>
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
                    {{ hasExistingImage ? "Changer l'image" : 'Choisir une image' }}
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
                id="edit-is-active"
                v-model="announcementForm.isActive"
                type="checkbox"
                class="border-input bg-background ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:ring-2 focus-visible:ring-offset-2"
              />
              <label for="edit-is-active" class="text-sm font-medium">Annonce active</label>
            </div>
          </div>
          <DrawerFooter>
            <button
              :disabled="!announcementForm.title || !announcementForm.content || isLoading"
              class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              @click="handleEdit"
            >
              {{ isLoading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
            <DrawerClose as-child>
              <button
                class="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
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
  import { ref, computed, watch } from 'vue';
  import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
  } from '@/components/ui/drawer';
  import type { Announcement } from '@/interfaces/announcement.interface';
  import Database from '@/utils/database.utils';
  import { useToast } from 'vue-toastification';
  import { Upload, Image as ImageIcon } from 'lucide-vue-next';

  const props = defineProps<{
    open: boolean;
    announcement: Announcement | null;
    associationId: string;
    canUpdateAnnouncement: boolean;
  }>();

  const emit = defineEmits<{
    'update:open': [value: boolean];
    'announcement-updated': [];
  }>();

  const toast = useToast();
  const isLoading = ref(false);
  const imageFile = ref<File | null>(null);
  const imagePreview = ref<string>('');
  const imageInput = ref<HTMLInputElement | null>(null);
  const imageError = ref<string>('');
  const hasExistingImage = ref<boolean>(false);

  const announcementForm = ref({
    title: '',
    content: '',
    isActive: true,
  });

  const isOpen = computed({
    get: () => props.open,
    set: (value) => emit('update:open', value),
  });

  watch(
    () => props.announcement,
    async (newAnnouncement) => {
      if (newAnnouncement) {
        announcementForm.value.title = newAnnouncement.title;
        announcementForm.value.content = newAnnouncement.content;
        announcementForm.value.isActive = newAnnouncement.isActive;

        // Charger l'image existante si elle existe
        hasExistingImage.value = false;
        imagePreview.value = '';
        imageFile.value = null;

        try {
          const imageUrl = `/files/Announcement/${newAnnouncement.id}?index=0`;
          const response = await fetch(imageUrl);
          if (response.ok) {
            const blob = await response.blob();
            imagePreview.value = URL.createObjectURL(blob);
            hasExistingImage.value = true;
          }
        } catch {
          console.log('Aucune image existante');
        }
      }
    },
    { immediate: true }
  );

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

  async function handleEdit() {
    if (!props.canUpdateAnnouncement) {
      toast.error("Vous n'avez pas la permission de modifier cette annonce.");
      return;
    }

    if (!props.announcement) return;

    try {
      isLoading.value = true;

      // 1. Mettre à jour l'annonce
      await Database.update(
        `association/${props.associationId}/announcement`,
        props.announcement.id,
        {
          title: announcementForm.value.title,
          content: announcementForm.value.content,
          isActive: announcementForm.value.isActive,
        }
      );

      // 2. Si une nouvelle image est présente, l'uploader
      if (imageFile.value) {
        await Database.uploadFile('/files', imageFile.value, {
          relatedTo: 'Announcement',
          relatedBy: props.announcement.id,
          purpose: 'image',
          index: '0',
          isPrivate: 'false',
        });
      }

      toast.success('Annonce modifiée avec succès !');
      isOpen.value = false;
      emit('announcement-updated');
    } catch (err: any) {
      console.error("Erreur lors de la modification de l'annonce:", err);
      const errorMessage =
        err?.response?.data?.message || "Erreur lors de la modification de l'annonce.";
      toast.error(errorMessage);
    } finally {
      isLoading.value = false;
    }
  }
</script>
