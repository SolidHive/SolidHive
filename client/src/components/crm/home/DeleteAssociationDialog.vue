<template>
  <Dialog v-model:open="isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Supprimer l'association</DialogTitle>
        <DialogDescription>
          Êtes-vous sûr de vouloir supprimer définitivement cette association ? Cette action est
          irréversible et supprimera toutes les données associées.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="isOpen = false">Annuler</Button>
        <Button variant="destructive" :disabled="isLoading" @click="$emit('confirm')">
          {{ isLoading ? 'Suppression...' : 'Supprimer' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
  import Button from '@/components/ui/button/Button.vue';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
  import { computed } from 'vue';

  const props = defineProps<{
    modelValue: boolean;
    isLoading: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'confirm'): void;
  }>();

  const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  });
</script>
