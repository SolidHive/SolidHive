<template>
  <Drawer v-model:open="isOpen">
    <DrawerContent>
      <div class="mx-auto w-full max-w-sm">
        <DrawerHeader>
          <DrawerTitle>Supprimer le rôle</DrawerTitle>
          <DrawerDescription>
            Êtes-vous sûr de vouloir supprimer le rôle
            <strong class="capitalize">{{ role?.name }}</strong>
            ?
          </DrawerDescription>
        </DrawerHeader>
        <div class="p-4">
          <p class="text-muted-foreground text-sm">
            Cette action est irréversible. Les membres ayant ce rôle devront se voir attribuer un
            nouveau rôle.
          </p>
        </div>
        <DrawerFooter>
          <button
            :disabled="isLoading"
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
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
  import type { Role } from '@/interfaces/roles.interface';
  import Database from '@/utils/database.utils';
  import { useToast } from 'vue-toastification';

  const props = defineProps<{
    open: boolean;
    role: Role | null;
    associationId: string;
    canRemoveRole: boolean;
  }>();

  const emit = defineEmits<{
    'update:open': [value: boolean];
    'role-deleted': [];
  }>();

  const toast = useToast();
  const isLoading = ref(false);

  const isOpen = computed({
    get: () => props.open,
    set: (value) => emit('update:open', value),
  });

  async function handleDelete() {
    if (!props.canRemoveRole) {
      toast.error("Vous n'avez pas la permission de supprimer ce rôle.");
      return;
    }

    try {
      isLoading.value = true;

      if (!props.role || !props.role.id) {
        console.error('Aucun rôle sélectionné pour la suppression.');
        return;
      }

      await Database.delete(`association/${props.associationId}/roles/${props.role.id}`);

      toast.success('Le rôle a été supprimé avec succès.');

      isOpen.value = false;
      emit('role-deleted');
    } catch (err) {
      toast.error('Erreur lors de la suppression du rôle.');
      console.error('Erreur lors de la suppression du rôle:', err);
    } finally {
      isLoading.value = false;
    }
  }
</script>
