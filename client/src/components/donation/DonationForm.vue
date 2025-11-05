<template>
  <div>
    <div v-if="loading" class="py-12 text-center">
      <LoadingOverlay message="Chargement..." />
    </div>

    <div v-else class="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-9">
      <!-- Left column: Donation input and tax info -->
      <div class="space-y-4 sm:space-y-6 xl:col-span-4">
        <DonationCard
          :total-amount="totalAmount"
          :solid-hive-percentage="solidHivePercentage"
          @update:total-amount="totalAmount = $event"
          @update:solid-hive-percentage="solidHivePercentage = $event"
        />

        <TaxReductionInfo />
      </div>

      <!-- Right column: Summary -->
      <div class="xl:col-span-5">
        <DonationSummaryCard
          :association="association!"
          :total-amount="totalAmount"
          :solid-hive-percentage="solidHivePercentage"
          :is-loading="submitting"
          @payment="handleSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import DonationCard from './DonationCard.vue';
  import TaxReductionInfo from './TaxReductionInfo.vue';
  import DonationSummaryCard from './DonationSummaryCard.vue';
  import type { Association } from '@/interfaces/association.interface';

  interface Props {
    association: Association | null;
    loading: boolean;
    submitting: boolean;
  }

  interface Emits {
    (e: 'submit', data: DonationFormData): void;
    (e: 'cancel'): void;
  }

  const { association, loading, submitting } = defineProps<Props>();
  const emit = defineEmits<Emits>();

  interface DonationFormData {
    amount: number;
    message?: string;
    supportSolidHive: boolean;
    solidHivePercentage?: number;
  }

  // Reactive data
  const totalAmount = ref<number>(0);
  const solidHivePercentage = ref<number>(5);
  const message = ref('');

  // Computed properties
  const finalAmount = computed(() => {
    return totalAmount.value;
  });

  const handleSubmit = () => {
    if (!finalAmount.value || finalAmount.value < 1) {
      return;
    }

    emit('submit', {
      amount: totalAmount.value,
      message: message.value || undefined,
      supportSolidHive: true,
      solidHivePercentage: solidHivePercentage.value,
    });
  };

  // Exposer les valeurs calculées pour le parent
  defineExpose({
    finalAmount,
    totalAmount,
  });
</script>
