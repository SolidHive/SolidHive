<template>
  <Drawer v-if="canRemoveAnnouncement" v-model:open="isOpen">
    <DrawerContent>
      <div class="mx-auto w-full max-w-sm">
        <DrawerHeader>
          <DrawerTitle>Supprimer l'annonce</DrawerTitle>
          <DrawerDescription>
            Êtes-vous sûr de vouloir supprimer l'annonce
            <strong>{{ announcement?.title }}</strong>
            ?
          </DrawerDescription>
        </DrawerHeader>
        <div class="p-4">
          <p class="text-muted-foreground text-sm">
            Cette action est irréversible. L'annonce sera définitivement supprimée.
          </p>
        </div>
        <DrawerFooter>
          <button
            :disabled="isLoading"
            class="inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            @click="handleDelete"
          >
            {{ isLoading ? 'Suppression...' : 'Supprimer' }}
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
  import type { Announcement } from '@/interfaces/announcement.interface';
  import Database from '@/utils/database.utils';
  import { useToast } from 'vue-toastification';

  const props = defineProps<{
    open: boolean;
    announcement: Announcement | null;
    associationId: string;
    canRemoveAnnouncement: boolean;
  }>();

  const emit = defineEmits<{
    'update:open': [value: boolean];
    'announcement-deleted': [];
  }>();

  const toast = useToast();
  const isLoading = ref(false);

  const isOpen = computed({
    get: () => props.open,
    set: (value) => emit('update:open', value),
  });

  async function handleDelete() {
    if (!props.canRemoveAnnouncement) {
      toast.error("Vous n'avez pas la permission de supprimer cette annonce.");
      return;
    }

    if (!props.announcement) return;

    try {
      isLoading.value = true;

      await Database.delete(
        `association/${props.associationId}/announcement/${props.announcement.id}`
      );

      toast.success('Annonce supprimée avec succès !');
      isOpen.value = false;
      emit('announcement-deleted');
    } catch (err: any) {
      console.error("Erreur lors de la suppression de l'annonce:", err);
      const errorMessage =
        err?.response?.data?.message || "Erreur lors de la suppression de l'annonce.";
      toast.error(errorMessage);
    } finally {
      isLoading.value = false;
    }
  }
</script>
