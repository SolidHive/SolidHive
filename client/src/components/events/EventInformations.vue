<template>
  <div>
    <h2 class="font-title text-secondary mb-4 text-2xl sm:text-3xl lg:text-4xl">Informations</h2>
    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <Calendar class="text-secondary mt-1 h-5 w-5 shrink-0" />
        <div>
          <p class="text-muted-foreground text-xs font-medium">Date de début</p>
          <p class="font-paragraph text-sm font-semibold sm:text-base">
            {{ formatDate(startDate) }}
          </p>
        </div>
      </div>

      <div class="flex items-start gap-3">
        <Calendar class="text-secondary mt-1 h-5 w-5 shrink-0" />
        <div>
          <p class="text-muted-foreground text-xs font-medium">Date de fin</p>
          <p class="font-paragraph text-sm font-semibold sm:text-base">{{ formatDate(endDate) }}</p>
        </div>
      </div>

      <div v-if="address" class="flex items-start gap-3">
        <MapPin class="text-secondary mt-1 h-5 w-5 shrink-0" />
        <div>
          <p class="text-muted-foreground text-xs font-medium">Lieu</p>
          <p class="font-paragraph text-sm font-semibold sm:text-base">
            {{ formatAddress(address) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Calendar, MapPin } from 'lucide-vue-next';

  interface Address {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  }

  defineProps<{
    startDate: string;
    endDate: string;
    address?: Address;
  }>();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address: Address) => {
    const parts = [address.street, address.postcode, address.city].filter(Boolean);
    return parts.join(', ');
  };
</script>
