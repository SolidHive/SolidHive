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
        <BackButton />
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
        <!-- Boutons -->
        <div class="flex flex-col gap-4 sm:flex-row sm:gap-4">
          <Button
            v-if="canReceiveDonations"
            class="bg-accent hover:bg-accent/90 w-full px-8 text-white transition-colors sm:w-auto"
            @click="$emit('don')"
          >
            Faire un don
          </Button>
          <Button
            class="bg-secondary hover:bg-secondary/90 w-full px-8 text-white transition-colors sm:w-auto"
            @click="sharePage"
          >
            {{ isCopied ? 'Copié' : 'Partager' }}
            <Check v-if="isCopied" class="mr-2" />
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { Button } from '@/components/ui/button';
  import BackButton from '@/components/ui/BackButton.vue';
  import { usePaymentsStore } from '@/stores/payments';
  import { Check } from 'lucide-vue-next';
  import type { Association } from '@/interfaces/association.interface';

  const paymentsStore = usePaymentsStore();

  const props = defineProps<{
    association: Association;
  }>();

  const canReceiveDonations = computed(() =>
    paymentsStore.canAssociationReceiveDonations(props.association)
  );

  const isCopied = ref(false);

  const sharePage = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      isCopied.value = true;
      setTimeout(() => {
        isCopied.value = false;
      }, 2000);
    } catch (err) {
      console.error('Error copying link:', err);
    }
  };

  defineEmits(['don']);
</script>
