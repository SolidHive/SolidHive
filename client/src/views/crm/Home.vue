<template>
  <Header />
  <div class="p-6 md:px-12">
    <h1>CRM Home</h1>
    <div v-if="crmStore.currentAssociationId">
      <p>Association ID: {{ crmStore.currentAssociationId }}</p>
      <p>Route actuelle: {{ crmStore.currentRoute }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Header from '@/components/dashboard/Header.vue';
  import { useCrmStore } from '@/stores/crm';

  const crmStore = useCrmStore();
</script>
