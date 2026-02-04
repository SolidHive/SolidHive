import { cva, type VariantProps } from 'class-variance-authority';

export const skeletonVariants = cva('animate-pulse rounded-md bg-muted', {
  variants: {
    variant: {
      default: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type SkeletonVariants = VariantProps<typeof skeletonVariants>;

export { default as Skeleton } from './Skeleton.vue';
