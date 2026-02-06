<template>
  <PageContainer>
    <div class="flex flex-col gap-y-16 overflow-x-hidden">
      <!-- Header Section -->
      <HeaderSection />

      <!-- Features Section -->
      <FeaturesSection />

      <!-- Prices Section -->
      <PricesSection />

      <!-- Testimonials Section -->
      <TestimonialsSection />

      <!-- FAQ Section -->
      <FaqSection />
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  import PageContainer from '@/components/PageContainer.vue';
  import HeaderSection from '@/components/about-premium/sections/HeaderSection.vue';

  import FeaturesSection from '@/components/about-premium/sections/FeaturesSection.vue';
  import PricesSection from '@/components/about-premium/sections/PricesSection.vue';
  import TestimonialsSection from '@/components/home/sections/TestimonialsSection.vue';
  import FaqSection from '@/components/home/sections/FaqSection.vue';
</script>
