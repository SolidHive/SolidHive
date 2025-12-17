<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Configuration Stripe Connect</DialogTitle>
        <DialogDescription>
          Configurez votre compte Stripe Connect pour recevoir des dons et des paiements.
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-4 py-4">
        <div v-if="association?.stripeAccountId" class="space-y-4">
          <div class="bg-muted rounded-lg p-4">
            <div class="mb-2 flex items-center gap-2">
              <span class="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                Connecté
              </span>
              <span
                v-if="association.canReceiveDonations"
                class="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
              >
                Peut recevoir des dons
              </span>
            </div>
            <p class="text-muted-foreground text-sm">
              ID du compte :
              <span class="font-mono">{{ association.stripeAccountId }}</span>
            </p>
          </div>

          <div class="flex gap-2">
            <Button variant="outline" :disabled="isLoading" @click="$emit('check-status')">
              {{ isLoading ? 'Vérification...' : 'Vérifier le statut' }}
            </Button>
            <Button variant="destructive" :disabled="isLoading" @click="$emit('create-account')">
              {{ isLoading ? 'Création...' : 'Remplacer le compte' }}
            </Button>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="bg-muted rounded-lg p-4">
            <p class="text-muted-foreground text-sm">
              Aucun compte Stripe Connect configuré. Créez-en un pour commencer à recevoir des
              paiements.
            </p>
          </div>

          <Button :disabled="isLoading" @click="$emit('create-account')">
            {{ isLoading ? 'Création...' : 'Créer un compte Stripe' }}
          </Button>
        </div>

        <div
          v-if="message"
          class="rounded-lg p-3"
          :class="
            messageType === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-yellow-50 text-yellow-800'
          "
        >
          <p class="text-sm">{{ message }}</p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="isOpen = false">Fermer</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
  import Button from '@/components/ui/button/Button.vue';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
  import type { Association } from '@/interfaces';
  import { computed } from 'vue';

  const props = defineProps<{
    modelValue: boolean;
    association: Association | null;
    isLoading: boolean;
    message: string;
    messageType: 'success' | 'warning';
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'create-account'): void;
    (e: 'check-status'): void;
  }>();

  const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  });
</script>
