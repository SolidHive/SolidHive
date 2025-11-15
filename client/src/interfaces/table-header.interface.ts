import type { NestedKeyOf } from '@/types/nested-key-of.type';

export interface TableHeader<T> {
  text: string;
  sortKey?: NestedKeyOf<T>;
}
