<template>
  <div class="bg-card rounded-xl p-4 shadow-xl sm:p-6">
    <!-- Header centré avec fond secondary -->
    <div class="bg-secondary mb-4 rounded-xl p-2 text-center sm:mb-6 sm:p-3">
      <div class="flex items-center justify-center gap-2">
        <HandHeart class="text-secondary-foreground h-5 w-5 sm:h-6 sm:w-6" />
        <h2 class="font-title text-secondary-foreground text-base font-black sm:text-lg">
          Mon don
        </h2>
      </div>
    </div>

    <div class="space-y-3 sm:space-y-4">
      <!-- Montant total du don -->
      <div>
        <label
          for="total-amount"
          class="font-paragraph text-foreground mb-2 block text-xs font-medium sm:text-sm"
        >
          Montant total du don
        </label>
        <div class="relative">
          <input
            id="total-amount"
            :value="props.totalAmount"
            type="number"
            min="1"
            max="100000"
            step="0.01"
            placeholder="Montant"
            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring font-paragraph w-full rounded-lg border px-3 py-2 pr-10 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:px-4 sm:py-3 sm:pr-12 sm:text-base"
            @input="onTotalAmountInput"
          />
          <span
            class="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium sm:right-4 sm:text-base"
          >
            €
          </span>
        </div>
      </div>

      <!-- Pourcentage pour SolidHive -->
      <div class="space-y-2 rounded-lg sm:space-y-3">
        <div class="space-y-2">
          <label
            for="solidhive-percentage"
            class="font-paragraph text-foreground block text-xs font-medium sm:text-sm"
          >
            Pourcentage pour SolidHive (modifiable)
          </label>
          <div class="relative">
            <input
              id="solidhive-percentage"
              :value="solidHivePercentage"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="5"
              class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring font-paragraph w-full rounded-lg border px-3 py-2 pr-10 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:px-4 sm:py-3 sm:pr-12 sm:text-base"
              @input="onSolidHivePercentageInput"
            />
            <span
              class="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium sm:right-4 sm:text-base"
            >
              %
            </span>
          </div>
          <p class="text-muted-foreground text-xs sm:text-sm">
            Montant : {{ computedSolidHiveAmount.toFixed(2) }}€
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { HandHeart } from 'lucide-vue-next';

  interface Props {
    totalAmount?: number;
    solidHivePercentage?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    totalAmount: 0,
    solidHivePercentage: 5,
  });

  const emit = defineEmits<{
    'update:totalAmount': [value: number];
    'update:solidHivePercentage': [value: number];
  }>();

  // Reactive data
  const solidHivePercentage = ref<number>(props.solidHivePercentage);

  // Computed
  const computedSolidHiveAmount = computed(() => {
    return (props.totalAmount * solidHivePercentage.value) / 100;
  });

  const onTotalAmountInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    let value = parseFloat(input.value) || 0;

    // Limiter entre 1 et 100000
    value = Math.max(1, Math.min(100000, value));

    emit('update:totalAmount', value);
  };

  const onSolidHivePercentageInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    let value = parseFloat(input.value) || 0;

    // Limiter entre 0 et 100
    value = Math.max(0, Math.min(100, value));

    solidHivePercentage.value = value;
    emit('update:solidHivePercentage', value);
  };
</script>
