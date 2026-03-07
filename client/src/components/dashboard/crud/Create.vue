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
    onBeforeSubmit?: () => Promise<boolean>;
  }>();

  const emit = defineEmits<{
    afterCreate: [createdItem: any];
    error: [errorDetails: { field?: string; message: string }];
  }>();

  const isLoading = ref(false);
  const hasNavigated = ref(false);

  const handleCreate = async () => {
    try {
      isLoading.value = true;

      // Appeler la validation avant soumission si elle existe
      if (props.onBeforeSubmit) {
        const canProceed = await props.onBeforeSubmit();
        if (!canProceed) {
          return; // Arrêter si la validation échoue
        }
      }

      const createdItem = await Database.create(props.createEndpoint, props.formData || {});

      // Émettre l'événement après création et attendre qu'il soit traité
      emit('afterCreate', createdItem);

      // Attendre un peu pour que l'événement soit traité
      await new Promise((resolve) => setTimeout(resolve, 100));

      returnToView();
    } catch (error) {
      console.error("Erreur lors de la création de l'élément:", error);

      // Analyser l'erreur pour l'émettre
      const errorDetails: { field?: string; message: string } = {
        message: 'Une erreur inconnue est survenue.',
      };
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as any).response;
        let message = 'Une erreur inconnue est survenue.';
        if (response?.data?.message) {
          message = response.data.message;
        } else if (response?.statusText) {
          message = response.statusText;
        } else if (typeof response?.data === 'string') {
          message = response.data;
        }
        if (typeof message !== 'string') {
          message = 'Une erreur inconnue est survenue.';
        }
        errorDetails.message = message;

        // Si c'est une erreur d'unicité sur le nom
        if (errorDetails.message.includes('existe déjà')) {
          errorDetails.field = 'name';
        }
        // Si c'est une erreur d'email non trouvé
        if (
          errorDetails.message.includes('user not found') ||
          errorDetails.message.includes('User not found') ||
          (errorDetails.message.includes('email') &&
            (errorDetails.message.includes('trouvé') || errorDetails.message.includes('existe')))
        ) {
          errorDetails.field = 'email';
          errorDetails.message = 'Aucun utilisateur trouvé avec cet email';
        }
        // Si c'est une erreur d'utilisateur déjà membre
        if (
          errorDetails.message.includes('déjà membre') ||
          errorDetails.message.includes('already member')
        ) {
          errorDetails.field = 'email';
          errorDetails.message = 'Cet utilisateur est déjà membre de cette association';
        }
      }

      emit('error', errorDetails);
    } finally {
      isLoading.value = false;
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !hasNavigated.value) {
      returnToView();
    }
  };

  function returnToView() {
    if (hasNavigated.value) {
      return; // Éviter les doubles redirections
    }

    hasNavigated.value = true;

    try {
      // Supprimer 'Create' du nom de la route pour retourner à la vue liste
      const viewRouteName = (route.name as string).replace('Create', '');

      console.log('Navigation de:', route.name, 'vers:', viewRouteName);

      router.push({
        name: viewRouteName,
        params: route.params,
      });
    } catch (error) {
      console.error('Erreur lors de la navigation:', error);
      // En cas d'erreur, simplement retourner en arrière
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
