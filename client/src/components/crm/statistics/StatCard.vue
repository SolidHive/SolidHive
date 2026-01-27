<template>
  <div
    class="bg-card border-border group rounded-2xl border p-3 transition-all hover:shadow-md sm:p-4"
  >
    <div class="flex items-center justify-between gap-2 sm:gap-3">
      <div class="min-w-0 flex-1">
        <p class="font-paragraph text-muted-foreground mb-1 truncate text-xs sm:text-sm">
          {{ title }}
        </p>
        <p class="font-title text-foreground truncate text-lg font-bold sm:text-xl md:text-2xl">
          {{ value }}
        </p>
        <p v-if="subtitle" class="font-paragraph text-muted-foreground mt-1 truncate text-xs">
          {{ subtitle }}
        </p>
        <div v-if="growth !== undefined" class="mt-2 flex items-center gap-1">
          <TrendingUp v-if="growth > 0" class="text-success h-3 w-3 sm:h-4 sm:w-4" />
          <TrendingDown v-else-if="growth < 0" class="text-destructive h-3 w-3 sm:h-4 sm:w-4" />
          <Minus v-else class="text-muted-foreground h-3 w-3 sm:h-4 sm:w-4" />
          <span
            :class="[
              'text-xs font-medium',
              growth > 0
                ? 'text-success'
                : growth < 0
                  ? 'text-destructive'
                  : 'text-muted-foreground',
            ]"
          >
            {{ growth > 0 ? '+' : '' }}{{ growth.toFixed(1) }}%
          </span>
        </div>
      </div>
      <div
        :class="[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors sm:h-12 sm:w-12',
          colorClasses[color],
        ]"
      >
        <component :is="iconComponent" class="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import {
    Heart,
    Euro,
    Users,
    TrendingUp,
    TrendingDown,
    Minus,
    Target,
    Calendar,
    Ticket,
    UserCheck,
  } from 'lucide-vue-next';

  interface Props {
    title: string;
    value: string | number;
    icon: string;
    color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'custom';
    growth?: number;
    subtitle?: string;
    customColor?: string;
  }

  const props = defineProps<Props>();

  const iconMap: Record<string, any> = {
    Heart,
    Euro,
    Users,
    TrendingUp,
    Target,
    Calendar,
    Ticket,
    UserCheck,
  };

  const iconComponent = computed(() => iconMap[props.icon] || Heart);

  const colorClasses: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-green-500/10 text-green-600',
    warning: 'bg-orange-500/10 text-orange-600',
    custom: props.customColor
      ? `bg-[${props.customColor}]/10 text-[${props.customColor}]`
      : 'bg-primary/10 text-primary',
  };
</script>
