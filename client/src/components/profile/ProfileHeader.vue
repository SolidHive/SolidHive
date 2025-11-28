<template>
  <div class="bg-card border-border mb-6 rounded-3xl border p-4 shadow-sm sm:p-6">
    <div
      class="flex min-w-0 flex-col items-start gap-4 md:flex-row md:items-center md:justify-between md:gap-6"
    >
      <!-- Avatar + Info inline -->
      <div class="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <div
          class="bg-secondary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-md sm:h-16 sm:w-16"
        >
          <UserIcon class="h-6 w-6 text-white sm:h-8 sm:w-8" :stroke-width="2" />
        </div>

        <div class="min-w-0 flex-1">
          <h1
            v-if="profile"
            class="font-title text-foreground mb-1 text-xl break-words sm:text-2xl"
          >
            {{ profile.name }} {{ profile.firstname }}
          </h1>
          <div class="flex flex-wrap items-center gap-2 text-sm">
            <span v-if="profile" class="font-paragraph text-muted-foreground break-words">
              Membre depuis {{ formatDate(profile.createdAt, true) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex shrink-0 gap-2">
        <Button variant="default" size="sm" class="shrink-0">
          <Edit class="mr-1.5 h-4 w-4" />
          <span class="hidden sm:inline">Modifier</span>
        </Button>
        <Button variant="outline" size="sm" class="aspect-square w-9 shrink-0 p-0">
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
