<template>
  <section v-if="association" class="relative w-full pt-0">
    <div
      class="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] flex min-h-[80vh] w-screen items-center overflow-hidden"
    >
      <img
        :src="association.image"
        :alt="association.name"
        class="absolute inset-0 z-0 h-full w-full object-cover object-center"
      />
      <div class="absolute inset-0 z-10">
        <div
          class="absolute inset-0 h-full w-full"
          :style="association.primaryColor ? `background:${association.primaryColor}66` : ''"
        ></div>
        <div class="absolute inset-0 h-full w-full bg-black/50"></div>
      </div>
      <div
        class="relative z-20 flex h-full w-full flex-col items-start justify-center p-4 sm:px-8 md:px-16 lg:px-24"
      >
        <BackHomeButton @click="goHome" />
        <div
          v-if="association.logo"
          class="mb-6 flex h-18 w-18 items-center justify-center rounded-full bg-white md:h-24 md:w-24 2xl:h-28 2xl:w-28"
        >
          <img
            :src="association.logo"
            :alt="association.name + ' logo'"
            class="h-12 w-12 object-contain md:h-16 md:w-16 2xl:h-18 2xl:w-18"
          />
        </div>
        <!-- Titre -->
        <h1 class="font-title mb-6 text-3xl text-white uppercase lg:text-4xl 2xl:text-6xl">
          {{ association.name }}
        </h1>
        <!-- Description -->
        <p
          class="font-paragraph text-md mb-6 max-w-2xl text-white drop-shadow sm:text-lg lg:text-xl 2xl:text-2xl"
        >
          {{ association.description }}
        </p>
        <!-- Bouton don -->
        <Button
          v-if="canReceiveDonations"
          class="bg-accent hover:bg-accent/90 w-full px-8 text-white transition-colors sm:w-auto"
          @click="$emit('don')"
        >
          Faire un don
        </Button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Button } from '@/components/ui/button';
  import BackHomeButton from '@/components/ui/BackHomeButton.vue';
  import { useRouter } from 'vue-router';
  import { usePaymentsStore } from '@/stores/payments';
  import type { Association } from '@/interfaces/association.interface';

  const router = useRouter();
  const paymentsStore = usePaymentsStore();

  function goHome() {
    router.push('/');
  }

  const props = defineProps<{
    association: Association;
  }>();

  const canReceiveDonations = computed(() =>
    paymentsStore.canAssociationReceiveDonations(props.association)
  );

  defineEmits(['don']);
</script>
