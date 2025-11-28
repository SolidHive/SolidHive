<template>
  <div class="bg-card border-border rounded-3xl border p-4 shadow-sm sm:p-6">
    <h2 class="font-subtitle text-foreground mb-5 text-lg">Informations personnelles</h2>

    <div v-if="profile" class="grid gap-4 sm:grid-cols-2">
      <!-- Nom -->
      <div class="group">
        <label
          class="font-paragraph text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
        >
          Nom
        </label>
        <p
          class="font-paragraph text-foreground bg-muted/50 group-hover:bg-muted rounded-xl px-4 py-2.5 transition-colors"
        >
          {{ profile.name || 'Non renseigné' }}
        </p>
      </div>

      <!-- Prénom -->
      <div class="group">
        <label
          class="font-paragraph text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
        >
          Prénom
        </label>
        <p
          class="font-paragraph text-foreground bg-muted/50 group-hover:bg-muted rounded-xl px-4 py-2.5 transition-colors"
        >
          {{ profile.firstname || 'Non renseigné' }}
        </p>
      </div>

      <!-- Email -->
      <div class="group sm:col-span-2">
        <label
          class="font-paragraph text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
        >
          Email
        </label>
        <p
          class="font-paragraph text-foreground bg-muted/50 group-hover:bg-muted flex items-center gap-2 rounded-xl px-4 py-2.5 transition-colors"
        >
          <Mail class="text-muted-foreground h-4 w-4" />
          {{ profile.email }}
        </p>
      </div>

      <!-- Téléphone -->
      <div class="group">
        <label
          class="font-paragraph text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
        >
          Téléphone
        </label>
        <p
          class="font-paragraph text-foreground bg-muted/50 group-hover:bg-muted rounded-xl px-4 py-2.5 transition-colors"
        >
          {{ profile.phone || 'Non renseigné' }}
        </p>
      </div>
    </div>

    <div v-else class="bg-muted/30 flex h-32 items-center justify-center rounded-2xl">
      <LoadingOverlay :show="true" message="Chargement de votre profil..." />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Mail } from 'lucide-vue-next';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import type { User } from '@/interfaces';

  interface Props {
    profile: User | null;
  }

  defineProps<Props>();
</script>
