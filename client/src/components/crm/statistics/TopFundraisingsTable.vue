<template>
  <div v-if="fundraisings.length > 0" class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="border-border border-b">
          <th
            class="font-paragraph text-muted-foreground pb-2 text-left text-xs font-medium sm:pb-3 sm:text-sm"
          >
            Cagnotte
          </th>
          <th
            class="font-paragraph text-muted-foreground hidden pb-2 text-right text-xs font-medium sm:table-cell sm:pb-3 sm:text-sm"
          >
            Dons
          </th>
          <th
            class="font-paragraph text-muted-foreground pb-2 text-right text-xs font-medium sm:pb-3 sm:text-sm"
          >
            Montant
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(fundraising, index) in fundraisings"
          :key="fundraising.id"
          class="border-border border-b last:border-0"
        >
          <td class="py-3 sm:py-4">
            <div class="flex items-center gap-2 sm:gap-3">
              <div
                :class="[
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold sm:h-8 sm:w-8 sm:text-sm',
                  index === 0
                    ? 'bg-yellow-100 text-yellow-700'
                    : index === 1
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-orange-100 text-orange-700',
                ]"
              >
                {{ index + 1 }}
              </div>
              <div class="min-w-0">
                <p class="font-subtitle text-foreground truncate text-xs sm:text-sm">
                  {{ fundraising.title }}
                </p>
                <p class="font-paragraph text-muted-foreground text-[10px] sm:hidden sm:text-xs">
                  {{ fundraising.donationCount }} dons
                </p>
              </div>
            </div>
          </td>
          <td
            class="font-paragraph text-foreground hidden py-3 text-right text-xs sm:table-cell sm:py-4 sm:text-sm"
          >
            {{ fundraising.donationCount }}
          </td>
          <td
            class="font-title text-foreground py-3 text-right text-xs font-bold whitespace-nowrap sm:py-4 sm:text-sm"
          >
            {{ formatCurrency(fundraising.totalAmount) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else class="text-muted-foreground py-6 text-center text-xs sm:py-8 sm:text-sm">
    Aucune cagnotte pour le moment
  </div>
</template>

<script setup lang="ts">
  interface Fundraising {
    id: string;
    title: string;
    totalAmount: number;
    donationCount: number;
  }

  interface Props {
    fundraisings: Fundraising[];
  }

  defineProps<Props>();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };
</script>
