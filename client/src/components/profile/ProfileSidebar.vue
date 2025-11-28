<template>
  <div class="space-y-6">
    <!-- Compte -->
    <div class="bg-card border-border rounded-3xl border p-4 shadow-sm sm:p-6">
      <h2 class="font-subtitle text-foreground mb-5 text-lg">Compte</h2>

      <div v-if="profile" class="space-y-4">
        <div>
          <label
            class="font-paragraph text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
          >
            Date d'inscription
          </label>
          <p class="font-paragraph text-foreground bg-muted/50 rounded-xl px-4 py-2.5 text-sm">
            {{ formatDate(profile.createdAt) }}
          </p>
        </div>

        <div>
          <label
            class="font-paragraph text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
          >
            Dernière connexion
          </label>
          <p class="font-paragraph text-foreground bg-muted/50 rounded-xl px-4 py-2.5 text-sm">
            {{ formatDate(new Date().toISOString()) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Actions dangereuses -->
    <div class="bg-card border-border rounded-3xl border p-4 shadow-sm sm:p-6">
      <h2 class="font-subtitle text-foreground mb-4 text-base sm:text-lg">Actions</h2>

      <div class="space-y-2">
        <Button
          variant="outline"
          size="sm"
          class="w-full"
          :disabled="isLoggingOut"
          @click="$emit('logout')"
        >
          <LogOut class="mr-2 h-4 w-4" />
          {{ isLoggingOut ? 'Déconnexion...' : 'Se déconnecter' }}
        </Button>

        <Button
          variant="outline"
          size="sm"
          class="border-destructive/30 text-destructive hover:bg-destructive w-full hover:text-white"
        >
          <Trash2 class="mr-2 h-4 w-4" />
          Supprimer le compte
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/components/ui/button';
  import { LogOut, Trash2 } from 'lucide-vue-next';
  import type { User } from '@/interfaces';

  interface Props {
    profile: User | null;
    isLoggingOut: boolean;
  }

  defineProps<Props>();

  defineEmits<{
    logout: [];
  }>();

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
</script>
