<template>
  <div class="bg-card border-border mb-6 rounded-3xl border p-6 shadow-sm">
    <div class="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
      <!-- Avatar + Info inline -->
      <div class="flex items-center gap-4">
        <div
          class="bg-secondary flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-md"
        >
          <UserIcon class="h-8 w-8 text-white" :stroke-width="2" />
        </div>

        <div>
          <h1 v-if="profile" class="font-title text-foreground mb-1 text-2xl">
            {{ profile.name }} {{ profile.firstname }}
          </h1>
          <div class="flex flex-wrap items-center gap-2 text-sm">
            <span v-if="profile" class="font-paragraph text-muted-foreground">
              Membre depuis {{ formatDate(profile.createdAt, true) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <Button variant="default" size="sm">
          <Edit class="mr-1.5 h-4 w-4" />
          Modifier
        </Button>
        <Button variant="outline" size="sm" class="aspect-square w-9 p-0">
          <Settings class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/components/ui/button';
  import { User as UserIcon, Edit, Settings } from 'lucide-vue-next';
  import type { User } from '@/interfaces';

  interface Props {
    profile: User | null;
  }

  defineProps<Props>();

  function formatDate(dateString: string, shortFormat = false): string {
    const date = new Date(dateString);

    if (shortFormat) {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    }

    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
</script>
