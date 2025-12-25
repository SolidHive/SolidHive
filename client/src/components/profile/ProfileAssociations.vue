<template>
  <div class="bg-card border-border rounded-3xl border p-4 shadow-sm sm:p-6">
    <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="font-subtitle text-foreground text-lg">Mes Associations</h2>
      <Button
        v-if="hasNoAssociations"
        variant="default"
        size="sm"
        @click="$emit('createAssociation')"
      >
        <Plus class="mr-1.5 h-4 w-4" />
        Créer
      </Button>
    </div>

    <!-- Liste associations -->
    <LoadingOverlay v-if="isLoading" :show="true" message="Chargement de vos associations..." />

    <div v-else-if="associations.length > 0" class="space-y-3">
      <div
        v-for="userAssoc in associations"
        :key="userAssoc.id"
        class="border-border hover:border-primary/30 bg-muted/20 group rounded-2xl border p-3 transition-all hover:shadow-sm sm:p-4"
      >
        <div class="mb-2 flex items-start justify-between gap-2">
          <h3
            class="font-subtitle text-foreground group-hover:text-primary min-w-0 flex-1 truncate text-sm transition-colors sm:text-base"
          >
            {{ userAssoc.association.name }}
          </h3>
          <span
            :class="getStatusBadgeClass(userAssoc)"
            class="font-paragraph shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium"
          >
            {{ getStatusText(userAssoc) }}
          </span>
        </div>

        <p
          v-if="userAssoc.association.description"
          class="font-paragraph text-muted-foreground mb-3 line-clamp-1 text-sm"
        >
          {{ userAssoc.association.description }}
        </p>

        <div class="flex items-center justify-between">
          <span
            v-if="userAssoc.role"
            class="font-paragraph text-muted-foreground flex items-center gap-1.5 text-xs"
          >
            <Shield class="h-3.5 w-3.5" />
            {{ userAssoc.role.name }}
          </span>

          <Button
            v-if="userAssoc.status === 'accepted'"
            variant="ghost"
            size="sm"
            as-child
            class="h-8"
          >
            <router-link :to="`/crm/${userAssoc.association.id}/home`">Gérer →</router-link>
          </Button>

          <span
            v-else-if="userAssoc.status === 'pending'"
            class="font-paragraph text-muted-foreground text-xs italic"
          >
            Invitation en attente
          </span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="bg-muted/20 rounded-2xl py-10 text-center">
      <Building2 class="text-muted-foreground mx-auto mb-3 h-10 w-10" :stroke-width="1.5" />
      <p class="font-paragraph text-muted-foreground mb-4 text-sm">
        Vous ne faites partie d'aucune association
      </p>
      <div class="flex flex-col items-center gap-2">
        <Button variant="default" size="sm" @click="$emit('createAssociation')">
          Créer une association
        </Button>
        <Button variant="outline" size="sm" as-child>
          <router-link to="/associations">Explorer les associations</router-link>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Button } from '@/components/ui/button';
  import { Plus, Shield, Building2 } from 'lucide-vue-next';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import type { UserAssociation } from '@/interfaces';

  interface Props {
    associations: UserAssociation[];
    isLoading: boolean;
  }

  const props = defineProps<Props>();

  defineEmits<{
    createAssociation: [];
  }>();

  const hasNoAssociations = computed(() => props.associations.length === 0);

  function getStatusBadgeClass(userAssoc: UserAssociation): string {
    // Si l'utilisateur n'a pas accepté l'invitation
    if (userAssoc.status === 'pending') {
      return 'bg-amber-500/10 text-amber-700 border border-amber-500/20';
    }
    // Si l'utilisateur a accepté mais l'association n'est pas validée
    if (userAssoc.status === 'accepted' && userAssoc.association.status === 'pending') {
      return 'bg-amber-500/10 text-amber-700 border border-amber-500/20';
    }
    // Si tout est accepté
    if (userAssoc.status === 'accepted' && userAssoc.association.status === 'accepted') {
      return 'bg-secondary/10 text-secondary border border-secondary/20';
    }
    return 'bg-muted/50 text-muted-foreground';
  }

  function getStatusText(userAssoc: UserAssociation): string {
    // Si l'utilisateur n'a pas accepté l'invitation
    if (userAssoc.status === 'pending') {
      return 'Invitation en attente';
    }
    // Si l'utilisateur a accepté mais l'association n'est pas validée
    if (userAssoc.status === 'accepted' && userAssoc.association.status === 'pending') {
      return 'En attente de validation';
    }
    // Si tout est accepté
    if (userAssoc.status === 'accepted' && userAssoc.association.status === 'accepted') {
      return 'Validé';
    }
    return userAssoc.status;
  }
</script>
