<template>
  <section class="bg-tertiary px-4 py-16">
    <div class="mx-auto max-w-4xl text-center">
      <h2 class="font-title text-secondary mb-8 text-2xl">
        Envie d'en savoir plus ? Prenez contact !
      </h2>
      <Button variant="secondary" class="shadow-lg hover:shadow-xl" @click="goToContact">
        Prendre contact
      </Button>
    </div>
  </section>
</template>

<script setup lang="ts">
  import Button from '@/components/ui/button/Button.vue';

  const emit = defineEmits<{
    'change-tab': [tab: string];
  }>();

  const goToContact = () => {
    emit('change-tab', 'contact');
  };
</script>
