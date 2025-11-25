<template>
  <div class="max-w-full overflow-x-auto rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <slot name="header"></slot>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <slot name="table-row"></slot>
      </TableBody>
    </Table>
  </div>
</template>

<script setup lang="ts" generic="T extends HasId">
  import type { HasId } from '@/interfaces/has_id.interface';
  import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';

  defineProps<{
    items: T[];
    canDeleteItems: boolean;
    canUpdateItems: boolean;
    canModifySpecificItem: (item: T) => boolean;
  }>();

  defineEmits<{
    edit: [item: T];
    delete: [item: T];
  }>();
</script>
