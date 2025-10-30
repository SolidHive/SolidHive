<template>
  <div class="bg-background flex min-h-screen items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="bg-card rounded-[20px] border p-8 shadow-xl sm:p-10">
        <!-- Header -->
        <div class="mb-10 text-center">
          <h1 class="font-title text-primary mb-3 text-4xl sm:text-5xl">Connexion</h1>
          <p class="font-paragraph text-muted-foreground text-lg">
            Accédez à votre espace personnel
          </p>
        </div>

        <form class="space-y-6" @submit.prevent="handleLogin">
          <InputForm
            v-model="form.email.$value"
            label-value="Email"
            input-name="email"
            type="email"
            placeholder="votre@email.com"
            :error-message="showError('email') ? form.email.$error?.message : ''"
            :error-state="showError('email')"
            @blur="touchedFields.email = true"
          />

          <InputForm
            v-model="form.password.$value"
            label-value="Mot de passe"
            input-name="password"
            type="password"
            placeholder="Votre mot de passe"
            :error-message="showError('password') ? form.password.$error?.message : ''"
            :error-state="showError('password')"
            @blur="touchedFields.password = true"
          >
            <template #hint>
              <div>
                Le mot de passe doit contenir au moins 10 caractères, une majuscule, une minuscule,
                un chiffre et un symbole.
              </div>
            </template>
          </InputForm>

          <div class="-mt-2 flex justify-end">
            <router-link
              to="/forgot-password"
              class="font-paragraph text-secondary hover:text-secondary/80 text-sm transition-colors"
            >
              Mot de passe oublié?
            </router-link>
          </div>

          <div class="mt-8 flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
            <div
              class="font-paragraph text-muted-foreground w-full text-center text-sm sm:w-auto sm:text-left"
            >
              Pas encore de compte?
              <router-link
                to="/register"
                class="text-secondary hover:text-secondary/80 font-medium transition-colors"
              >
                S'inscrire
              </router-link>
            </div>

            <Button
              type="submit"
              variant="default"
              size="lg"
              class="w-full sm:w-auto"
              :disabled="isLoading"
            >
              <svg
                v-if="isLoading"
                class="-ml-1 mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <LoadingOverlay :show="isLoading" message="Connexion en cours..." />
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { useToast } from 'vue-toastification';
  import { useAuthStore } from '../../stores/auth';
  import LoadingOverlay from '../../components/LoadingOverlay.vue';
  import InputForm from '../../components/form/InputForm.vue';
  import { Button } from '../../components/ui/button';
  import { defineForm, field, isValidForm } from 'vue-yup-form';
  import * as yup from 'yup';
  import { userErrorMessages } from '../../utils/errors/auth/users';
  import { associationErrorMessages } from '../../utils/errors/auth/associations';
  import {
    hasPendingAssociation,
    getPendingAssociation,
    getPendingFile,
    clearPendingAssociation,
  } from '../../utils/localStorage.utils';

  const authStore = useAuthStore();
  const router = useRouter();
  const toast = useToast();

  const isLoading = ref(false);
  const formError = ref('');
  const formSubmitted = ref(false);

  const touchedFields = reactive({
    email: false,
    password: false,
  });

  type FormFields = 'email' | 'password';

  const showError = (fieldName: FormFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!form[fieldName].$error;

  const form = defineForm({
    email: field(
      '',
      yup.string().required(userErrorMessages.required.email).email(userErrorMessages.format.email)
    ),

    password: field(
      '',
      yup
        .string()
        .required(userErrorMessages.required.password)
        .matches(userErrorMessages.patterns.password, userErrorMessages.password.invalid)
    ),
  });

  /**
   * Récupère le message d'erreur basé sur le statut HTTP
   */
  function getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (
        error as {
          response: { status: number; data?: { message?: string } };
        }
      ).response;
      const status = response.status;
      const message = response.data?.message;

      return status in userErrorMessages.apiErrors
        ? message || userErrorMessages.apiErrors[status as keyof typeof userErrorMessages.apiErrors]
        : userErrorMessages.apiErrors.unknown;
    }

    return userErrorMessages.apiErrors.unknown;
  }

  async function handleLogin() {
    formSubmitted.value = true;
    formError.value = '';

    if (!(await isValidForm(form))) return;

    isLoading.value = true;

    try {
      authStore.error = null;

      const result = await authStore.login({
        email: form.email.$value.trim(),
        password: form.password.$value,
      });

      if (result) {
        toast.success('Connexion réussie !');

        // Vérifier s'il y a une association en attente de création
        await checkAndCreatePendingAssociation();

        router.push('/');
      } else {
        const errorText = authStore.error as string | null;

        if (errorText && errorText.includes("n'est pas vérifié")) {
          formError.value = userErrorMessages.apiErrors[401];
        } else if (errorText && errorText.includes('Trop de tentatives')) {
          formError.value = userErrorMessages.apiErrors[429];
        } else {
          formError.value = userErrorMessages.auth.invalidCredentials;
        }
        toast.error(formError.value);
      }
    } catch (error) {
      formError.value = getErrorMessage(error);
      toast.error(formError.value);
    } finally {
      isLoading.value = false;
    }
  }

  async function checkAndCreatePendingAssociation() {
    // Vérifier s'il y a une association en attente
    if (!hasPendingAssociation()) return;

    let associationCreated = false;

    try {
      // Récupérer les données de l'association
      const associationData = getPendingAssociation();
      if (!associationData) return;

      // Créer l'association
      const response = await authStore.createAssociation(associationData);
      const associationId = response.id;
      associationCreated = true;

      // Uploader le logo si présent
      const logoFile = await getPendingFile('logo');
      if (logoFile && associationId) {
        await authStore.uploadAssociationFile(associationId, logoFile, 'logo');
      }

      // Uploader la bannière si présente
      const backgroundFile = await getPendingFile('background');
      if (backgroundFile && associationId) {
        await authStore.uploadAssociationFile(associationId, backgroundFile, 'background');
      }

      toast.success(associationErrorMessages.creation.success);
    } catch (error) {
      console.error("Erreur lors de la création de l'association:", error);

      // Ne pas afficher d'erreur si l'association a été créée (erreur uniquement sur les uploads)
      if (!associationCreated) {
        toast.warning(associationErrorMessages.apiErrors.unknown);
      }
    } finally {
      // Nettoyer le localStorage pour éviter de recréer l'association à chaque connexion
      clearPendingAssociation();
    }
  }
</script>
