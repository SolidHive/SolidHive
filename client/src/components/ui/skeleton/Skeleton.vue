<script setup lang="ts">
  import type { PrimitiveProps } from 'reka-ui';
  import type { HTMLAttributes } from 'vue';
  import type { SkeletonVariants } from '.';
  import { Primitive } from 'reka-ui';
  import { cn } from '@/lib/utils';
  import { skeletonVariants } from '.';

  interface Props extends PrimitiveProps {
    variant?: SkeletonVariants['variant'];
    class?: HTMLAttributes['class'];
  }

  const props = withDefaults(defineProps<Props>(), {
    as: 'div',
    variant: 'default',
    class: '',
  });
</script>

<template>
  <Primitive
    data-slot="skeleton"
    :as="as"
    :as-child="asChild"
    :class="cn(skeletonVariants({ variant }), props.class)"
  >
    <slot />
  </Primitive>
</template>
