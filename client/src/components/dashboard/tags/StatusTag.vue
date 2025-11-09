<template>
  <span
    :class="getStatusBadgeClass(status)"
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
  >
    {{ translate(status) }}
  </span>
</template>
<script setup lang="ts">
  defineProps<{
    status: string;
  }>();
  const translate = (key: string) => {
    const translations: Record<string, string> = {
      accepted: 'accepté',
      pending: 'en attente',
      rejected: 'rejeté',
      draft: 'brouillon',
      additional_request: 'demande supplémentaire',
    };
    return translations[key] || key;
  };
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'additional_request':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
</script>
