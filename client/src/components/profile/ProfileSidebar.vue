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

      <div v-else class="bg-muted/30 flex h-32 items-center justify-center rounded-2xl">
        <LoadingOverlay :show="true" message="Chargement de votre profil..." />
      </div>
    </div>

    <!-- Associations Favorites -->
    <ProfileFavorites
      :favorite-associations="favoriteAssociations || []"
      :is-loading="isLoadingFavorites"
      @remove-favorite="emit('removeFavorite', $event)"
    />

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

        <Dialog v-model:open="showDeleteDialog">
          <DialogTrigger as-child>
            <Button
              variant="outline"
              size="sm"
              class="border-destructive/30 text-destructive hover:bg-destructive w-full hover:text-white"
            >
              <Trash2 class="mr-2 h-4 w-4" />
              Supprimer le compte
            </Button>
          </DialogTrigger>

          <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Supprimer votre compte</DialogTitle>
              <DialogDescription>
                Cette action est irréversible. Votre compte sera anonymisé et vos données
                personnelles supprimées.
              </DialogDescription>
            </DialogHeader>

            <form class="space-y-4" @submit.prevent="handleDeleteAccount">
              <!-- Champ email caché pour l'accessibilité -->
              <input
                type="email"
                :value="profile?.email"
                autocomplete="username"
                class="hidden"
                aria-hidden="true"
              />

              <InputForm
                v-model="deleteForm.password"
                input-name="password"
                type="password"
                required
                :disabled="isDeletingAccount"
                placeholder="Votre mot de passe"
                :error-state="showError('password')"
                :error-message="getErrorMessage('password')"
                @input="clearValidationErrors(validationErrors, 'password')"
                @blur="() => (touchedFields.password = true)"
              >
                <template #label>
                  Mot de passe actuel
                  <span class="text-destructive">*</span>
                </template>
              </InputForm>

              <TextareaForm
                v-model="deleteForm.reason"
                input-name="reason"
                :disabled="isDeletingAccount"
                placeholder="Pourquoi souhaitez-vous supprimer votre compte ?"
                :error-state="showError('reason')"
                :error-message="getErrorMessage('reason')"
                @input="clearValidationErrors(validationErrors, 'reason')"
                @blur="() => (touchedFields.reason = true)"
              >
                <template #label>Raison de la suppression (optionnel)</template>
              </TextareaForm>

              <DialogFooter>
                <DialogClose as-child>
                  <Button type="button" variant="outline">Annuler</Button>
                </DialogClose>
                <button
                  type="submit"
                  :disabled="isDeletingAccount"
                  class="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  {{ isDeletingAccount ? 'Suppression...' : 'Supprimer définitivement' }}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { Button } from '@/components/ui/button';
  import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from '@/components/ui/dialog';
  import { LogOut, Trash2 } from 'lucide-vue-next';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import InputForm from '@/components/form/InputForm.vue';
  import TextareaForm from '@/components/form/TextareaForm.vue';
  import ProfileFavorites from '@/components/profile/ProfileFavorites.vue';
  import type { User, Association } from '@/interfaces';
  import { useToast } from 'vue-toastification';
  import Database from '@/utils/database.utils';
  import { useAuthStore } from '@/stores/auth';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';
  import { getApiErrorMessage } from '@/utils/error.utils';
  import { deleteAccountValidationSchema } from '@/utils/errors/auth/users';

  interface Props {
    profile: User | null;
    isLoggingOut: boolean;
    favoriteAssociations?: Association[];
    isLoadingFavorites: boolean;
  }

  defineProps<Props>();

  const emit = defineEmits<{
    logout: [];
    removeFavorite: [associationId: string];
    accountDeleted: [];
  }>();

  const toast = useToast();
  const authStore = useAuthStore();

  // États pour la modal de suppression
  const showDeleteDialog = ref(false);
  const isDeletingAccount = ref(false);
  const formSubmitted = ref(false);

  // Formulaire de suppression
  const deleteForm = reactive({
    password: '',
    reason: '',
  });

  // Erreurs de validation
  const validationErrors = reactive<Record<string, string>>({});

  // Champs touchés
  const touchedFields = reactive({
    password: false,
    reason: false,
  });

  // Fonctions d'erreur
  const showError = (fieldName: 'password' | 'reason') =>
    (touchedFields[fieldName] || formSubmitted.value) && !!validationErrors[fieldName];

  const getErrorMessage = (fieldName: 'password' | 'reason') =>
    touchedFields[fieldName] || formSubmitted.value ? validationErrors[fieldName] || '' : '';

  const validateForm = async () => {
    const result = await validateWithYup(deleteAccountValidationSchema, deleteForm);

    if (result.isValid) {
      clearValidationErrors(validationErrors);
    } else {
      Object.assign(validationErrors, result.errors);
    }

    return result.isValid;
  };

  // Gestionnaire de suppression de compte
  const handleDeleteAccount = async () => {
    formSubmitted.value = true;

    // Marquer tous les champs comme touchés pour afficher les erreurs
    touchedFields.password = true;
    touchedFields.reason = true;

    if (!(await validateForm())) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    isDeletingAccount.value = true;

    try {
      await Database.delete('users/me', {
        password: deleteForm.password,
        reason: deleteForm.reason.trim() || undefined,
      });

      // Fermer la modal
      showDeleteDialog.value = false;

      // Reset du formulaire
      deleteForm.password = '';
      deleteForm.reason = '';

      // Déconnecter l'utilisateur
      await authStore.logout();

      // Émettre l'événement pour que le parent gère la redirection
      emit('accountDeleted');
    } catch (error: any) {
      console.error('Erreur suppression compte:', error);
      const errorMessage = getApiErrorMessage(error);
      toast.error(
        typeof errorMessage === 'string' ? errorMessage : 'Erreur lors de la suppression du compte'
      );
    } finally {
      isDeletingAccount.value = false;
    }
  };

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
