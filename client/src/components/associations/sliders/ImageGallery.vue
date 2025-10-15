<template>
  <section>
    <h2 class="font-title text-secondary mb-8 text-center text-2xl">Galerie</h2>
    <Carousel
      class="mx-auto w-full bg-transparent"
      :opts="{ slidesToScroll: 1, align: 'start' }"
      @init-api="onInit"
    >
      <CarouselContent>
        <CarouselItem
          v-for="(image, i) in images"
          :key="i"
          class="sm:basis-1/2 lg:basis-1/4 2xl:basis-1/5"
        >
          <div
            class="flex h-48 items-center justify-center overflow-hidden rounded-2xl bg-gray-200 2xl:h-64"
          >
            <img :src="image" :alt="`Image ${i + 1}`" class="h-full w-full object-cover" />
          </div>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
    <!-- Pagination dots -->
    <div v-if="totalSlides > 1" class="mt-6 flex justify-center gap-2">
      <button
        v-for="n in totalSlides"
        :key="n"
        :class="[
          'h-3 w-3 rounded-full transition-colors',
          currentSlide === n - 1 ? 'bg-secondary' : 'hover:bg-secondary/60 bg-gray-300',
        ]"
        aria-label="Aller à la page {{ n }}"
        @click="goToSlide(n - 1)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import type { EmblaCarouselType } from 'embla-carousel';
  import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

  const props = defineProps<{ images?: string[] }>();
  const images = computed(() => props.images || []);

  // Pagination logic & autoplay
  import { onUnmounted } from 'vue';
  const currentSlide = ref(0);
  const totalSlides = ref(0);
  const carouselApi = ref<EmblaCarouselType | null>(null);
  let autoplayInterval: ReturnType<typeof setInterval> | null = null;

  function onInit(api: EmblaCarouselType | undefined) {
    if (!api) return;
    carouselApi.value = api;
    updatePagination();
    api.on('select', onUserInteraction);
    api.on('reInit', updatePagination);
    startAutoplay();
  }

  function updateCurrentSlide() {
    if (carouselApi.value) {
      currentSlide.value = carouselApi.value.selectedScrollSnap();
    }
  }

  function updatePagination() {
    if (carouselApi.value) {
      totalSlides.value = carouselApi.value.scrollSnapList().length;
      updateCurrentSlide();
    }
  }

  function goToSlide(idx: number) {
    if (carouselApi.value) {
      carouselApi.value.scrollTo(idx);
      restartAutoplay();
    }
  }

  function nextSlide() {
    if (!carouselApi.value) return;
    const next = (currentSlide.value + 1) % totalSlides.value;
    carouselApi.value.scrollTo(next);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(() => {
      nextSlide();
    }, 4000);
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  function onUserInteraction() {
    updateCurrentSlide();
    restartAutoplay();
  }

  onUnmounted(() => {
    stopAutoplay();
  });
</script>
