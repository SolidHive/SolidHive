<template>
  <div class="bg-background flex min-h-screen items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="bg-card rounded-[20px] border p-8 shadow-xl sm:p-10">
        <!-- Header -->
        <div class="mb-10 text-center">
          <h1 class="font-title text-primary mb-3 text-4xl sm:text-5xl">Mot de passe oublié</h1>
          <p class="font-paragraph text-muted-foreground text-lg">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <transition name="fade" mode="out-in">
          <div v-if="!requestSent" key="form">
            <form class="space-y-6" @submit.prevent="handleSubmit">
              <InputForm
                v-model="form.email.$value"
                label-value="Email"
                input-name="email"
                type="email"
                placeholder="votre@email.com"
                :error-message="showError('email') ? form.email.$error?.message : ''"
                :error-state="showError('email')"
                @blur="touchedFields.email = true"
              >
                <template #hint>
                  <div class="text-xs text-gray-500">
                    Saisissez l'adresse email associée à votre compte
                  </div>
                </template>
              </InputForm>

              <div
                class="bg-accent/5 border-accent/20 text-foreground font-paragraph flex items-start rounded-[12px] border p-4"
              >
                <div class="text-accent mt-0.5 mr-3 flex-shrink-0">
                  <Info class="h-5 w-5" />
                </div>
                <div class="text-sm">
                  <p>
                    Un lien de réinitialisation sera envoyé à cette adresse email. Ce lien expirera
                    après 1h.
                  </p>
                </div>
              </div>

              <div
                class="mt-8 flex flex-col-reverse items-center justify-between gap-4 sm:flex-row"
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
                  {{ isLoading ? 'Envoi en cours...' : 'Envoyer le lien' }}
                </Button>
              </div>
            </form>
          </div>

          <div v-else key="success" class="py-6 text-center">
            <div
              class="bg-accent/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="text-accent h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <h2 class="font-subtitle text-foreground mb-3 text-2xl">Email envoyé !</h2>
            <p class="font-paragraph text-muted-foreground mb-6">
              Si l'adresse email existe dans notre système, vous recevrez un lien pour réinitialiser
              votre mot de passe.
            </p>

            <div class="bg-accent/5 border-border mb-6 rounded-[12px] border p-4">
              <h3 class="font-subtitle text-foreground mb-2 font-semibold">Prochaines étapes</h3>
              <ol
                class="font-paragraph text-muted-foreground list-decimal space-y-1 pl-5 text-left text-sm"
              >
                <li>Vérifiez votre boîte de réception et vos spams</li>
                <li>Cliquez sur le lien reçu par email</li>
                <li>Créez un nouveau mot de passe sécurisé</li>
              </ol>
            </div>

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

              <Button variant="default" size="lg" class="w-full sm:w-auto" @click="resetForm">
                Réessayer
              </Button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
  <LoadingOverlay :show="isLoading" message="Envoi en cours..." />
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { useToast } from 'vue-toastification';
  import Database from '@/utils/database.utils';
  import InputForm from '@/components/form/InputForm.vue';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import { Button } from '@/components/ui/button';
  import { defineForm, field, isValidForm } from 'vue-yup-form';
  import { forgotPasswordValidationSchema } from '@/utils/errors/auth/users';
  import { Info, Loader2 } from 'lucide-vue-next';

  // États
  const isLoading = ref(false);
  const requestSent = ref(false);
  const formSubmitted = ref(false);

  const touchedFields = reactive({
    email: false,
  });

  // Services
  const toast = useToast();

  // Validation du formulaire
  const form = defineForm({
    email: field('', forgotPasswordValidationSchema.email),
  });

  type FormFields = 'email';

  const showError = (fieldName: FormFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!form[fieldName].$error;

  async function handleSubmit() {
    formSubmitted.value = true;

    if (!(await isValidForm(form))) return;

    isLoading.value = true;

    try {
      await Database.create('security/action', {
        actionType: 'RESET_PASSWORD',
        email: form.email.$value.trim(),
      });

      requestSent.value = true;
      toast.success('Instructions envoyées par email');
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
      requestSent.value = true;
    } finally {
      isLoading.value = false;
    }
  }

  function resetForm() {
    form.email.$value = '';
    formSubmitted.value = false;
    touchedFields.email = false;
    requestSent.value = false;
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
