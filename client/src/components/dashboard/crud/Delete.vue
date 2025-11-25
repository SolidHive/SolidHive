<template>
  <Dialog v-if="item" :default-open="true" @update:open="handleOpenChange">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          <slot name="title">Supprimer</slot>
        </DialogTitle>
        <DialogDescription>
          <slot name="description" v-bind="item">
            Cette action est irréversible. La ressource sera supprimée.
          </slot>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">Annuler</Button>
        </DialogClose>
        <Button variant="destructive" :disabled="isLoading" @click="handleDelete">
          {{ isLoading ? 'Suppression...' : 'Supprimer' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts" generic="T extends HasId">
  import { Button } from '@/components/ui/button';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogClose,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
  import type { HasId } from '@/interfaces/has_id.interface';
  import router from '@/routes';
  import Database from '@/utils/database.utils';
  import { onBeforeMount, onMounted, ref, type Ref } from 'vue';
  import { useRoute } from 'vue-router';

  const props = defineProps<{
    fetchItem: string | T;
    deleteEndpoint: string;
    canRemoveItem: boolean;
  }>();

  const route = useRoute();

  const item = ref<T | null>(null) as Ref<T | null>;
  const isLoading = ref(false);

  const fetchItem = async () => {
    if (typeof props.fetchItem !== 'string') {
      item.value = props.fetchItem;
      return;
    }

    try {
      isLoading.value = true;

      const response = await Database.getAll(props.fetchItem);

      item.value = response as T;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'élément:", error);
      item.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  const handleDelete = async () => {
    try {
      isLoading.value = true;

      await Database.delete(props.deleteEndpoint);

      returnToView();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'élément:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      returnToView();
    }
  };

  function returnToView() {
    try {
      router.push({ name: (route.name as string).replace('Delete', '') });
    } catch (error) {
      console.error('Erreur lors de la navigation:', error);
      router.back();
    }
  }

  onBeforeMount(async () => {
    if (!props.canRemoveItem) {
      router.push('/unauthorized');
      return;
    }
  });

  onMounted(() => {
    fetchItem();
  });
</script>
