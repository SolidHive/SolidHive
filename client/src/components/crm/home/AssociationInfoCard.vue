<template>
  <div class="bg-card rounded-lg border p-6 shadow-sm">
    <div class="space-y-6">
      <!-- Logo et Image de couverture -->
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="text-sm font-medium">Logo</label>
          <div
            class="bg-muted mt-2 flex h-32 items-center justify-center rounded-lg border-2 border-dashed"
          >
            <img
              v-if="association.logo"
              :key="imageKey"
              :src="association.logo"
              alt="Logo"
              class="h-full w-full rounded-lg object-contain p-2"
            />
            <span v-else class="text-muted-foreground text-sm">Aucun logo</span>
          </div>
        </div>
        <div>
          <label class="text-sm font-medium">Image de couverture</label>
          <div
            class="bg-muted mt-2 flex h-32 items-center justify-center rounded-lg border-2 border-dashed"
          >
            <img
              v-if="association.image"
              :key="imageKey"
              :src="association.image"
              alt="Image de couverture"
              class="h-full w-full rounded-lg object-cover"
            />
            <span v-else class="text-muted-foreground text-sm">Aucune image</span>
          </div>
        </div>
      </div>

      <!-- Informations principales -->
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="text-muted-foreground text-sm">Nom de l'association</label>
          <p class="mt-1 font-medium">{{ association.name }}</p>
        </div>
        <div>
          <label class="text-muted-foreground text-sm">Statut</label>
          <p class="mt-1 font-medium capitalize">{{ getStatusLabel(association.status) }}</p>
        </div>
      </div>

      <div v-if="association.description">
        <label class="text-muted-foreground text-sm">Description</label>
        <p class="mt-1 break-all">{{ association.description }}</p>
      </div>

      <div v-if="association.contact">
        <label class="text-muted-foreground text-sm">Contact</label>
        <p class="mt-1">{{ association.contact }}</p>
      </div>

      <div v-if="association.aboutText">
        <label class="text-muted-foreground text-sm">À propos</label>
        <p class="mt-1">{{ association.aboutText }}</p>
      </div>

      <div v-if="association.siret">
        <label class="text-muted-foreground text-sm">SIRET</label>
        <p class="mt-1 font-mono">{{ association.siret }}</p>
      </div>

      <div v-if="association.additionalRequest" class="rounded-lg bg-yellow-50 p-4">
        <label class="text-sm font-medium text-yellow-900">
          Demande d'informations supplémentaires
        </label>
        <p class="mt-1 text-sm text-yellow-800">{{ association.additionalRequest }}</p>
      </div>

      <!-- Couleur -->
      <div v-if="association.primaryColor">
        <label class="text-muted-foreground text-sm">Couleur principale</label>
        <div class="mt-1 flex items-center gap-2">
          <div
            class="h-8 w-8 rounded border"
            :style="{ backgroundColor: association.primaryColor }"
          />
          <span class="font-mono text-sm">{{ association.primaryColor }}</span>
        </div>
      </div>

      <!-- Stripe -->
      <div v-if="association.stripeAccountId || showStripeForOwner">
        <label class="text-muted-foreground text-sm">Stripe Connect</label>
        <div v-if="association.stripeAccountId" class="mt-1 flex items-center gap-2">
          <span class="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Connecté</span>
          <span
            v-if="association.canReceiveDonations"
            class="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
          >
            Peut recevoir des dons
          </span>
          <span class="text-muted-foreground font-mono text-xs">
            {{ association.stripeAccountId }}
          </span>
        </div>
        <div v-else class="mt-1">
          <p class="text-muted-foreground mb-2 text-sm">Aucun compte Stripe Connect configuré</p>
        </div>
        <div v-if="showStripeForOwner" class="mt-3">
          <Button variant="outline" size="sm" @click="$emit('manage-stripe')">
            <CreditCard class="mr-2 h-4 w-4" />
            {{ association.stripeAccountId ? 'Gérer le compte Stripe' : 'Configurer Stripe' }}
          </Button>
        </div>
      </div>

      <!-- Actions -->
      <div class="border-t pt-4">
        <div class="flex flex-wrap gap-3">
          <Button v-if="canUpdate" variant="default" @click="$emit('edit')">
            <Pencil class="mr-2 h-4 w-4" />
            Modifier l'association
          </Button>
          <Button v-if="canDelete" variant="destructive" @click="$emit('delete')">
            <Trash2 class="mr-2 h-4 w-4" />
            Supprimer l'association
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import Button from '@/components/ui/button/Button.vue';
  import type { Association } from '@/interfaces';
  import { Pencil, Trash2, CreditCard } from 'lucide-vue-next';

  defineProps<{
    association: Association;
    imageKey: number;
    canUpdate: boolean;
    canDelete: boolean;
    showStripeForOwner: boolean;
  }>();

  defineEmits<{
    (e: 'edit'): void;
    (e: 'delete'): void;
    (e: 'manage-stripe'): void;
  }>();

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: 'En attente',
      approved: 'Approuvée',
      rejected: 'Rejetée',
      active: 'Active',
      inactive: 'Inactive',
    };
    return statusMap[status] || status;
  };
</script>
