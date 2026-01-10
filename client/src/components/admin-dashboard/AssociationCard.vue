<template>
  <Card class="flex h-full flex-col">
    <CardHeader class="p-2 sm:p-4 md:p-6">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <CardTitle class="min-w-0 flex-1 text-sm break-words sm:text-base md:text-lg">
          {{ association.name }}
        </CardTitle>
        <StatusTag :status="association.status" class="w-fit shrink-0 text-xs" />
      </div>
      <CardDescription v-if="association.description" class="line-clamp-2 text-xs sm:text-sm">
        {{ association.description }}
      </CardDescription>
    </CardHeader>
    <CardContent class="flex-grow space-y-2 p-2 pt-0 sm:p-4 sm:pt-0 md:px-6">
      <div class="grid gap-2 overflow-hidden text-xs sm:text-sm">
        <div class="flex flex-col gap-1">
          <span class="text-muted-foreground shrink-0 font-medium">Contact:</span>
          <span class="break-all">{{ association.contact || 'N/A' }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-muted-foreground shrink-0 font-medium">SIRET:</span>
          <span class="break-all">{{ association.siret }}</span>
        </div>
        <div v-if="association.createdBy" class="flex flex-col gap-1">
          <span class="text-muted-foreground shrink-0 font-medium">Créé par:</span>
          <span class="break-words capitalize">
            {{ association.createdBy.firstname }} {{ association.createdBy.name }}
          </span>
        </div>
      </div>
    </CardContent>
    <CardFooter class="p-2 sm:p-4 md:p-6">
      <Button
        class="w-full"
        variant="outline"
        size="sm"
        @click="$emit('view-details', association.id)"
      >
        <Eye class="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
        <span class="text-xs sm:text-sm">Voir les détails</span>
      </Button>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { Button } from '@/components/ui/button';
  import StatusTag from '@/components/dashboard/tags/StatusTag.vue';
  import { Eye } from 'lucide-vue-next';
  import type { Association } from '@/interfaces/association.interface';

  defineProps<{
    association: Association;
  }>();

  defineEmits<{
    (e: 'view-details', id: string): void;
  }>();
</script>
