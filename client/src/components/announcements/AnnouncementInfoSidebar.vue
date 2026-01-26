<template>
  <div class="bg-card rounded-xl border p-4 shadow-sm sm:p-6">
    <h3 class="font-title mb-4 text-lg sm:text-xl">Informations</h3>
    <div class="space-y-3">
      <div>
        <p class="text-muted-foreground text-sm">Publiée le</p>
        <p class="text-base font-medium">
          {{ formatDate(createdAt) }}
        </p>
      </div>
      <div v-if="updatedAt && updatedAt !== createdAt">
        <p class="text-muted-foreground text-sm">Mise à jour le</p>
        <p class="text-base font-medium">
          {{ formatDate(updatedAt) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    createdAt?: string | Date;
    updatedAt?: string | Date;
  }>();

  const formatDate = (date?: string | Date) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
</script>
