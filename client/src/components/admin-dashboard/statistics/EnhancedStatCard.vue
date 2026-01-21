<template>
  <Card :class="cn('relative overflow-hidden transition-all hover:shadow-lg', className)">
    <CardContent class="p-3 sm:p-4 md:p-6">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0 flex-1 space-y-1 sm:space-y-2">
          <p class="text-muted-foreground truncate text-xs font-medium sm:text-sm">{{ title }}</p>
          <div class="flex flex-wrap items-baseline gap-1 sm:gap-2">
            <p class="text-xl font-bold break-all sm:text-2xl md:text-3xl">{{ displayValue }}</p>
            <span
              v-if="trend"
              :class="
                cn(
                  'flex items-center text-xs font-medium whitespace-nowrap sm:text-sm',
                  trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
                )
              "
            >
              <component :is="trendIcon" class="mr-0.5 h-3 w-3 sm:mr-1 sm:h-4 sm:w-4" />
              {{ Math.abs(trend).toFixed(1) }}%
            </span>
          </div>
          <p v-if="description" class="text-muted-foreground truncate text-[10px] sm:text-xs">
            {{ description }}
          </p>
        </div>
        <div
          :class="
            cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12',
              iconBgColor
            )
          "
        >
          <component :is="icon" :class="cn('h-5 w-5 sm:h-6 sm:w-6', iconColor)" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
  import { computed, type Component } from 'vue';
  import { Card, CardContent } from '@/components/ui/card';
  import { ArrowUp, ArrowDown, Minus } from 'lucide-vue-next';
  import { cn } from '@/lib/utils';

  interface Props {
    title: string;
    value: number | string;
    icon: Component;
    description?: string;
    trend?: number;
    showProgress?: boolean;
    progressValue?: number;
    className?: string;
    iconBgColor?: string;
    iconColor?: string;
    progressColor?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    description: undefined,
    trend: undefined,
    className: undefined,
    iconBgColor: 'bg-primary/10',
    iconColor: 'text-primary',
    progressColor: '#f26639',
    showProgress: false,
    progressValue: 0,
  });

  const displayValue = computed(() => {
    if (typeof props.value === 'number') {
      return props.value.toLocaleString('fr-FR');
    }
    return props.value;
  });

  const trendIcon = computed(() => {
    if (!props.trend) return Minus;
    return props.trend > 0 ? ArrowUp : ArrowDown;
  });
</script>
