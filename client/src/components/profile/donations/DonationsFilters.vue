<template>
  <div class="bg-card border-border mb-6 rounded-3xl border p-4 shadow-sm sm:p-6">
    <div class="flex gap-2 overflow-x-auto pb-2">
      <Button
        :variant="donationType === 'all' ? 'default' : 'outline'"
        size="sm"
        @click="$emit('type-change', 'all')"
      >
        Tous les dons
      </Button>
      <Button
        :variant="donationType === 'associations' ? 'default' : 'outline'"
        size="sm"
        @click="$emit('type-change', 'associations')"
      >
        Dons aux associations
      </Button>
      <Button
        :variant="donationType === 'cagnottes' ? 'default' : 'outline'"
        size="sm"
        @click="$emit('type-change', 'cagnottes')"
      >
        Dons aux cagnottes
      </Button>
      <Button
        :variant="donationType === 'evenements' ? 'default' : 'outline'"
        size="sm"
        @click="$emit('type-change', 'evenements')"
      >
        Inscriptions événements
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/components/ui/button';

  interface Props {
    donationType: 'all' | 'associations' | 'cagnottes' | 'evenements';
  }

  defineProps<Props>();

  defineEmits<{
    'type-change': [type: 'all' | 'associations' | 'cagnottes' | 'evenements'];
  }>();
</script>
