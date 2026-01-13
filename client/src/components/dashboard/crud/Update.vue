<template>
  <Sheet v-if="item" :default-open="true" @update:open="handleOpenChange">
    <SheetContent class="flex h-full max-h-screen flex-col overflow-hidden">
      <div class="grow overflow-auto pr-2">
        <SheetHeader>
          <SheetTitle>
            <slot name="title">Modifier</slot>
          </SheetTitle>
          <SheetDescription>
            <slot name="description" />
          </SheetDescription>
        </SheetHeader>
        <slot name="form" :item="item" :is-loading="isLoading" />
      </div>
      <SheetFooter>
        <Button variant="primary" :disabled="isLoading" @click="handleUpdate">
          <slot name="update-button">
            {{ isLoading ? 'Mise à jour...' : 'Mettre à jour' }}
          </slot>
        </Button>
        <SheetClose as-child>
          <Button variant="outline">Annuler</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts" generic="T extends HasId">
  import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetClose,
    SheetFooter,
    SheetTitle,
  } from '@/components/ui/sheet';
  import { onBeforeMount, onMounted, ref, type Ref } from 'vue';
  import router from '@/routes';
  import Database from '@/utils/database.utils';
  import Button from '@/components/ui/button/Button.vue';
  import type { HasId } from '@/interfaces/has_id.interface';
  import { useRoute } from 'vue-router';

  const props = defineProps<{
    canUpdateItem: boolean;
    fetchItem: string | T;
    updateEndpoint: string;
    formData?: Record<string, any>;
    onBeforeSubmit?: () => Promise<boolean>;
  }>();

  const emit = defineEmits<{
    afterUpdate: [updatedItem: any];
    error: [errorDetails: { field?: string; message: string }];
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

  const handleUpdate = async () => {
    try {
      isLoading.value = true;

      // Appeler la validation avant soumission si elle existe
      if (props.onBeforeSubmit) {
        const canProceed = await props.onBeforeSubmit();
        if (!canProceed) {
          return; // Arrêter si la validation échoue
        }
      }

      const updatedItem = await Database.patch(props.updateEndpoint, props.formData || {});

      // Émettre l'événement après mise à jour et attendre qu'il soit traité
      await emit('afterUpdate', updatedItem);

      returnToView();
    } catch (error) {
      console.error("Erreur lors de la modification de l'élément:", error);

      // Analyser l'erreur pour l'émettre
      const errorDetails: { field?: string; message: string } = {
        message: 'Une erreur inconnue est survenue.',
      };
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as any).response;
        if (response?.data?.message) {
          errorDetails.message = response.data.message;
          // Si c'est une erreur d'unicité sur le nom
          if (errorDetails.message.includes('existe déjà')) {
            errorDetails.field = 'name';
          }
        }
      }

      emit('error', errorDetails);
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
      router.push({ name: (route.name as string).replace('Update', '') });
    } catch (error) {
      console.error('Erreur lors de la navigation:', error);
      router.back();
    }
  }

  onBeforeMount(async () => {
    if (!props.canUpdateItem) {
      router.push('/unauthorized');
      return;
    }
  });

  onMounted(() => {
    fetchItem();
  });
</script>
