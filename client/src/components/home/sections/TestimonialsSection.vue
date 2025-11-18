<template>
  <section>
    <h2 class="font-title text-secondary mb-8 text-center text-2xl sm:text-3xl md:text-4xl">
      {{ t('home.testimonials.title') }}
    </h2>
    <Carousel
      class="mx-auto w-full max-w-7xl bg-transparent"
      :opts="{ slidesToScroll: 1, align: 'start' }"
      @init-api="onInit"
    >
      <CarouselContent>
        <CarouselItem
          v-for="(testimonial, i) in testimonials"
          :key="i"
          class="sm:basis-1/2 lg:basis-1/3"
        >
          <div class="flex h-full flex-col items-start gap-3 rounded-2xl bg-white p-6 shadow-lg">
            <img
              :src="testimonial.photo"
              :alt="testimonial.name"
              class="border-secondary mb-1 h-9 w-9 rounded-full border-2 object-cover"
            />
            <div class="font-title text-secondary text-sm sm:text-lg">
              {{ testimonial.name }}
            </div>
            <div class="font-paragraph text-left text-xs sm:text-base">
              "{{ testimonial.text }}"
            </div>
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
        :aria-label="t('home.testimonials.goToPage', { n })"
        @click="goToSlide(n - 1)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { EmblaCarouselType } from 'embla-carousel';
  import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

  const { t, tm } = useI18n();

  const photoUrls = [
    'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=128&q=80',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=128&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=128&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=128&q=80',
    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=128&q=80',
    'https://images.unsplash.com/photo-1519340333755-c190485c36c8?auto=format&fit=facearea&w=128&q=80',
  ];

  const testimonials = computed(() => {
    const items = tm('home.testimonials.items') as Array<{ name: string; text: string }>;
    return items.map((item, index) => ({
      ...item,
      photo: photoUrls[index],
    }));
  });

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
