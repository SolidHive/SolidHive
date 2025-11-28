<template>
  <div class="bg-card border-border mb-6 rounded-3xl border p-4 shadow-sm sm:p-6">
    <div class="flex items-center gap-3 sm:gap-4">
      <Button variant="ghost" size="sm" as-child class="shrink-0">
        <router-link to="/profile">
          <ArrowLeft class="h-4 w-4" />
        </router-link>
      </Button>
      <div class="min-w-0 flex-1">
        <h1 class="font-title text-foreground truncate text-xl sm:text-2xl">Mes dons</h1>
        <p class="font-paragraph text-muted-foreground text-sm">
          Historique de vos contributions aux associations et cagnottes
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/components/ui/button';
  import { ArrowLeft } from 'lucide-vue-next';
</script>
