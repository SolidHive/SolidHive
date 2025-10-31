<template>
  <div class="bg-background flex min-h-screen items-center justify-center px-4 py-6">
    <div class="bg-card border-border w-full max-w-md rounded-[20px] border p-8 shadow-lg">
      <div class="relative z-10">
        <transition name="fade" mode="out-in">
          <div v-if="!resetSuccess && !tokenInvalid" key="form">
            <h1 class="font-title text-primary mb-2 text-center text-3xl">Nouveau mot de passe</h1>
            <p class="font-paragraph text-muted-foreground mb-6 text-center">
              Créez un nouveau mot de passe sécurisé
            </p>

            <form class="space-y-5" @submit.prevent="handleSubmit">
              <InputForm
                v-model="form.password.$value"
                label-value="Nouveau mot de passe"
                input-name="password"
                type="password"
                placeholder="Votre nouveau mot de passe"
                :error-message="showError('password') ? form.password.$error?.message : ''"
                :error-state="showError('password')"
                @blur="touchedFields.password = true"
              >
                <template #hint>
                  <div>
                    Le mot de passe doit contenir au moins 10 caractères, une majuscule, une
                    minuscule, un chiffre et un symbole.
                  </div>
                </template>
              </InputForm>

              <div
                class="mt-8 flex flex-col-reverse items-center justify-between gap-y-4 sm:flex-row"
              >
                <div
                  class="font-paragraph text-muted-foreground w-full text-center text-sm sm:w-auto sm:text-left"
                >
                  Revenir à la
                  <router-link
                    to="/login"
                    class="text-secondary hover:text-secondary/80 font-medium transition-colors"
                  >
                    page de connexion
                  </router-link>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  class="w-full sm:w-auto"
                  :disabled="isLoading"
                >
                  <Loader2 v-if="isLoading" class="mr-2 -ml-1 h-4 w-4 animate-spin" />
                  {{ isLoading ? 'Réinitialisation...' : 'Réinitialiser' }}
                </Button>
              </div>
            </form>
          </div>

          <div v-else-if="resetSuccess" key="success" class="py-4 text-center">
            <div
              class="bg-accent/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            >
              <Check class="text-accent h-8 w-8" :stroke-width="2" />
            </div>
            <h2 class="font-subtitle text-foreground mb-2 text-2xl">Mot de passe modifié</h2>
            <p class="font-paragraph text-muted-foreground mb-6">
              Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter
              avec votre nouveau mot de passe.
            </p>

            <div class="flex justify-center">
              <Button variant="default" size="lg" as-child>
                <router-link to="/login">Se connecter</router-link>
              </Button>
            </div>
          </div>

          <div v-else key="invalid" class="py-4 text-center">
            <div
              class="bg-destructive/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            >
              <X class="text-destructive h-8 w-8" :stroke-width="2" />
            </div>
            <h2 class="font-subtitle text-foreground mb-2 text-2xl">Lien invalide</h2>
            <p class="font-paragraph text-muted-foreground mb-6">
              Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau
              lien.
            </p>

            <div class="flex justify-center">
              <Button variant="default" size="lg" as-child>
                <router-link to="/forgot-password">Demander un nouveau lien</router-link>
              </Button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
  <LoadingOverlay :show="isLoading" message="Réinitialisation en cours..." />
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { useToast } from 'vue-toastification';
  import Database from '../../utils/database.utils';
  import InputForm from '../../components/form/InputForm.vue';
  import LoadingOverlay from '../../components/LoadingOverlay.vue';
  import { Button } from '../../components/ui/button';
  import { defineForm, field, isValidForm } from 'vue-yup-form';
  import * as yup from 'yup';
  import { userErrorMessages } from '../../utils/errors/auth/users';
  import { Loader2, Check, X } from 'lucide-vue-next';

  // États
  const isLoading = ref(false);
  const resetSuccess = ref(false);
  const tokenInvalid = ref(false);
  const errorMessage = ref('');
  const formSubmitted = ref(false);
  const token = ref('');

  const touchedFields = reactive({
    password: false,
  });

  // Services
  const route = useRoute();
  const toast = useToast();

  const form = defineForm({
    password: field(
      '',
      yup
        .string()
        .required(userErrorMessages.required.password)
        .matches(userErrorMessages.patterns.password, userErrorMessages.password.invalid)
    ),
  });

  type FormFields = 'password';

  const showError = (fieldName: FormFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!form[fieldName].$error;

  // Vérifier le token au chargement
  onMounted(() => {
    token.value = route.query.token as string;

    if (!token.value) {
      tokenInvalid.value = true;
      toast.error('Lien de réinitialisation invalide');
    }
  });

  // Gestion du formulaire
  async function handleSubmit() {
    formSubmitted.value = true;
    errorMessage.value = '';

    if (!(await isValidForm(form))) return;

    isLoading.value = true;

    try {
      await Database.create('security/action', {
        actionType: 'RESET_PASSWORD',
        token: token.value,
        newPassword: form.password.$value,
      });

      resetSuccess.value = true;
      toast.success('Mot de passe réinitialisé avec succès');
    } catch (error: unknown) {
      const apiError = error as {
        response?: { data?: { message?: string }; status?: number };
      };

      if (
        apiError.response?.status === 400 &&
        apiError.response.data?.message?.includes('expiré')
      ) {
        tokenInvalid.value = true;
        toast.error('Le lien de réinitialisation a expiré');
      } else {
        errorMessage.value =
          apiError.response?.data?.message || 'Une erreur est survenue lors de la réinitialisation';
        toast.error(errorMessage.value);
      }
    } finally {
      isLoading.value = false;
    }
  }
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
