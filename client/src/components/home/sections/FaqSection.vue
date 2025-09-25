<template>
  <section>
    <h2 class="font-title text-secondary mb-8 text-center text-2xl sm:text-3xl md:text-4xl">
      On répond à toutes vos questions
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
  import { ref } from 'vue';
  import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
  } from '@/components/ui/accordion';

  const faqs = ref([
    {
      question: 'Comment fonctionne SolidHive ?',
      answer:
        "SolidHive met en relation des bénévoles, des donateurs et des associations pour faciliter l'engagement solidaire. Vous pouvez rechercher des projets, postuler ou soutenir en quelques clics.",
    },
    {
      question: "Est-ce que l'inscription est gratuite ?",
      answer:
        "Oui, l'inscription sur SolidHive est entièrement gratuite pour les bénévoles et les associations.",
    },
    {
      question: 'Comment puis-je contacter une association ?',
      answer:
        'Une fois inscrit, vous pouvez contacter les associations directement via la plateforme grâce à la messagerie intégrée.',
    },
    {
      question: 'Puis-je proposer mon association sur SolidHive ?',
      answer:
        'Bien sûr ! Il suffit de créer un compte association et de remplir le formulaire de présentation.',
    },
  ]);
</script>
