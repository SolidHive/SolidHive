<template>
  <div class="space-y-6">
    <SectionTitle>Récapitulatif</SectionTitle>

    <FormSection>
      <template #title>Événement</template>
      <div class="space-y-2">
        <p class="font-title text-secondary text-xl">{{ event?.title }}</p>
        <div class="text-secondary flex items-center gap-2 text-sm">
          <Calendar class="h-4 w-4" />
          <span>{{ formatDate(event?.startDate) }}</span>
        </div>
        <div class="text-secondary flex items-center gap-2 text-sm">
          <MapPin class="h-4 w-4" />
          <span>{{ formatAddress(event?.address) }}</span>
        </div>
      </div>
    </FormSection>

    <FormSection>
      <template #title>Billets sélectionnés</template>
      <div class="space-y-3">
        <div
          v-for="(quantity, pricingId) in selectedTickets"
          :key="pricingId"
          class="flex items-center justify-between border-b border-gray-200 pb-3 last:border-b-0"
        >
          <div>
            <p class="font-paragraph text-secondary font-medium">
              {{ getPricingTitle(pricingId) }}
            </p>
            <p class="text-secondary text-sm">
              {{ quantity }} × {{ formatCurrency(getPricingAmount(pricingId)) }}
            </p>
          </div>
          <p class="font-title text-secondary text-lg font-bold">
            {{ formatCurrency(getPricingAmount(pricingId) * quantity) }}
          </p>
        </div>
      </div>
      <div class="bg-secondary mt-4 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <span class="font-paragraph text-secondary-foreground text-lg font-bold">Total</span>
          <span class="font-title text-secondary-foreground text-2xl font-black">
            {{ formatCurrency(total) }}
          </span>
        </div>
      </div>
    </FormSection>

    <FormSection>
      <template #title>Coordonnées de facturation</template>
      <div class="text-secondary space-y-1 text-sm">
        <p class="font-medium">{{ contact.firstName }} {{ contact.lastName }}</p>
        <p>{{ contact.email }}</p>
        <p>{{ contact.phone }}</p>
        <p>{{ contact.address }}</p>
        <p>{{ contact.postcode }} {{ contact.city }}</p>
      </div>
    </FormSection>

    <FormSection>
      <template #title>Participants</template>
      <div class="space-y-3">
        <div
          v-for="(participant, index) in participants"
          :key="index"
          class="border-b border-gray-200 pb-3 last:border-b-0"
        >
          <p class="text-secondary font-medium">
            {{ index + 1 }}. {{ participant.firstName }} {{ participant.lastName }}
          </p>
          <p class="text-secondary text-sm">{{ participant.email }}</p>
        </div>
      </div>
    </FormSection>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Calendar, MapPin } from 'lucide-vue-next';
  import SectionTitle from './common/SectionTitle.vue';
  import FormSection from './common/FormSection.vue';
  import {
    formatCurrency,
    formatDate,
    formatAddress,
    getPricingInfo,
  } from '@/utils/eventRegistration.utils';
  import type { Event, EventPricing, Participant, ContactInfo } from '@/interfaces';

  const props = defineProps<{
    event?: Event;
    pricings?: EventPricing[];
    selectedTickets: Record<string, number>;
    participants: Participant[];
    contact: ContactInfo;
  }>();

  const getPricingAmount = (pricingId: string) => {
    return getPricingInfo(props.pricings, pricingId).amount;
  };

  const getPricingTitle = (pricingId: string) => {
    return getPricingInfo(props.pricings, pricingId).title;
  };

  const total = computed(() => {
    let sum = 0;
    for (const [pricingId, quantity] of Object.entries(props.selectedTickets)) {
      sum += getPricingAmount(pricingId) * quantity;
    }
    return sum;
  });
</script>
