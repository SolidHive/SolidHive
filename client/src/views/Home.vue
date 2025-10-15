<template>
  <PageContainer>
    <div class="flex flex-col gap-y-16 overflow-x-hidden">
      <!-- Header Section -->
      <HeaderSection />

      <!-- Associations Section -->
      <AssociationsSection />

      <!-- Features Section -->
      <FeaturesSection />

      <!-- CTA Section -->
      <CtaSection />

      <!-- Stats Section -->
      <StatsSection />

      <!-- Testimonials Section -->
      <TestimonialsSection />

      <!-- FAQ Section -->
      <FaqSection />
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  import PageContainer from '@/components/PageContainer.vue';
  import HeaderSection from '@/components/home/sections/HeaderSection.vue';
  import AssociationsSection from '@/components/home/sections/AssociationsSection.vue';
  import FeaturesSection from '@/components/home/sections/FeaturesSection.vue';
  import CtaSection from '@/components/home/sections/CtaSection.vue';
  import StatsSection from '@/components/home/sections/StatsSection.vue';
  import TestimonialsSection from '@/components/home/sections/TestimonialsSection.vue';
  import FaqSection from '@/components/home/sections/FaqSection.vue';
</script>
