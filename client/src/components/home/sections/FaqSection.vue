<template>
  <section>
    <h2 class="font-title text-secondary mb-8 text-center text-2xl sm:text-3xl md:text-4xl">
      {{ t('home.faq.title') }}
    </h2>
    <Accordion type="single" collapsible class="mx-auto max-w-2xl">
      <AccordionItem v-for="(faq, i) in faqs" :key="i" :value="String(i)">
        <AccordionTrigger>
          {{ faq.question }}
        </AccordionTrigger>
        <AccordionContent>
          {{ faq.answer }}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
  } from '@/components/ui/accordion';

  const { t, tm } = useI18n();

  const faqs = computed(() => tm('home.faq.items') as Array<{ question: string; answer: string }>);
</script>
