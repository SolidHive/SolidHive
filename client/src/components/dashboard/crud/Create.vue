<template>
  <Sheet :default-open="true" @update:open="handleOpenChange">
    <SheetContent class="flex h-full max-h-screen flex-col overflow-hidden">
      <div class="grow overflow-auto pr-2">
        <SheetHeader>
          <SheetTitle>
            <slot name="title">Créer</slot>
          </SheetTitle>
          <SheetDescription>
            <slot name="description" />
          </SheetDescription>
        </SheetHeader>
        <slot name="form" />
      </div>
      <SheetFooter class="flex-none">
        <Button variant="primary" :disabled="isLoading" @click="handleCreate">
          <slot name="create-button">
            {{ isLoading ? 'Création...' : 'Créer' }}
          </slot>
        </Button>
        <SheetClose as-child>
          <Button variant="outline">Annuler</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
  import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetClose,
    SheetFooter,
    SheetTitle,
  } from '@/components/ui/sheet';
  import { onBeforeMount, ref } from 'vue';
  import router from '@/routes';
  import Database from '@/utils/database.utils';
  import Button from '@/components/ui/button/Button.vue';
  import { useRoute } from 'vue-router';

  const route = useRoute();

  const props = defineProps<{
    canCreateItem: boolean;
    createEndpoint: string;
    formData?: Record<string, any>;
  }>();

  const emit = defineEmits<{
    afterCreate: [createdItem: any];
  }>();

  const isLoading = ref(false);

  const handleCreate = async () => {
    try {
      isLoading.value = true;

      const createdItem = await Database.create(props.createEndpoint, props.formData || {});

      // Émettre l'événement après création
      emit('afterCreate', createdItem);

      returnToView();
    } catch (error) {
      console.error("Erreur lors de la création de l'élément:", error);
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
      router.push({ name: (route.name as string).replace('Create', '') });
    } catch (error) {
      console.error('Erreur lors de la navigation:', error);
      router.back();
    }
  }

  onBeforeMount(async () => {
    if (!props.canCreateItem) {
      router.push('/unauthorized');
      return;
    }
  });
</script>
