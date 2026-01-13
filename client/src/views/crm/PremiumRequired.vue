<template>
  <div class="flex min-h-[calc(100vh-200px)] items-center justify-center p-4">
    <Dialog :open="true" @update:open="handleClose">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600"
          >
            <svg
              class="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
          <DialogTitle class="text-center text-2xl">Fonctionnalité Premium</DialogTitle>
          <DialogDescription class="text-center">
            Cette fonctionnalité nécessite un abonnement premium
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div class="flex items-start gap-3">
              <div class="mt-0.5 flex-shrink-0">
                <svg class="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-amber-900">Accès limité</h3>
                <p class="mt-1 text-sm text-amber-800">
                  Votre association n'a pas souscrit à la version premium de SolidHive. Cette
                  fonctionnalité est réservée aux associations premium.
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <h4 class="text-sm font-semibold">Avantages de la version Premium :</h4>
            <ul class="text-muted-foreground space-y-2 text-sm">
              <li class="flex items-start gap-2">
                <svg
                  class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>Accès à toutes les fonctionnalités avancées du CRM</span>
              </li>
              <li class="flex items-start gap-2">
                <svg
                  class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>Support prioritaire</span>
              </li>
              <li class="flex items-start gap-2">
                <svg
                  class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>Statistiques et analyses détaillées</span>
              </li>
              <li class="flex items-start gap-2">
                <svg
                  class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>Gestion illimitée des membres et événements</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter class="flex-col gap-2 sm:flex-row">
          <Button variant="outline" class="w-full sm:w-auto" @click="goBack">Retour</Button>
          <Button
            class="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 sm:w-auto"
            @click="contactSupport"
          >
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            Passer à Premium
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  import { useRouter, useRoute } from 'vue-router';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
  import { Button } from '@/components/ui/button';

  const router = useRouter();
  const route = useRoute();

  const goBack = () => {
    router.push({ name: 'CRMHome', params: { id: route.params.id } });
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      router.push({ name: 'CRMHome', params: { id: route.params.id } });
    }
  };

  const contactSupport = () => {
    // Rediriger vers une page de contact ou d'upgrade
    // Pour l'instant, on peut juste ouvrir une fenêtre mailto ou rediriger vers une page de contact
    window.location.href = 'mailto:contact@solidhive.com?subject=Abonnement Premium';
  };
</script>
