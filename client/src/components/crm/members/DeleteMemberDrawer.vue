<template>
  <Drawer v-if="canRemoveMember" v-model:open="isOpen">
    <DrawerContent>
      <div class="mx-auto w-full max-w-sm">
        <DrawerHeader>
          <DrawerTitle>Supprimer le membre</DrawerTitle>
          <DrawerDescription>
            Êtes-vous sûr de vouloir supprimer {{ member?.user.name }}
            {{ member?.user.firstname }} de l'association ?
          </DrawerDescription>
        </DrawerHeader>
        <div class="p-4">
          <p class="text-muted-foreground text-sm">
            Cette action est irréversible. Le membre ne pourra plus accéder aux ressources de
            l'association.
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
  import type { Member } from '@/interfaces/member.interface';
  import Database from '@/utils/database.utils';
  import { useToast } from 'vue-toastification';

  const props = defineProps<{
    open: boolean;
    member: Member | null;
    associationId: string | string[];
    canRemoveMember: boolean;
  }>();

  const emit = defineEmits<{
    'update:open': [value: boolean];
    'member-deleted': [];
  }>();

  const toast = useToast();
  const isLoading = ref(false);

  const isOpen = computed({
    get: () => props.open,
    set: (value) => emit('update:open', value),
  });

  async function handleDelete() {
    try {
      isLoading.value = true;

      if (!props.member || !props.member.id) {
        console.error('Aucun membre sélectionné pour la suppression.');
        return;
      }

      await Database.delete(`association/${props.associationId}/user/${props.member.id}`);

      toast.success('Le membre a été supprimé avec succès.');

      isOpen.value = false;
      emit('member-deleted');
    } catch (err) {
      toast.error('Erreur lors de la suppression du membre.');
      console.error('Erreur lors de la suppression du membre:', err);
    } finally {
      isLoading.value = false;
    }
  }
</script>
