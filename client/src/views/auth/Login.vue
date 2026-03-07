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
            v-model="formData.email"
            label-value="Email"
            input-name="email"
            type="email"
            placeholder="votre@email.com"
            :error-message="getErrorMessage('email')"
            :error-state="showError('email')"
            @input="clearValidationErrors(validationErrors, 'email')"
            @blur="touchedFields.email = true"
          />

          <InputForm
            v-model="formData.password"
            label-value="Mot de passe"
            input-name="password"
            type="password"
            placeholder="Votre mot de passe"
            :error-message="getErrorMessage('password')"
            :error-state="showError('password')"
            @input="clearValidationErrors(validationErrors, 'password')"
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
              <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
              {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { useToast } from 'vue-toastification';
  import { useAuthStore } from '@/stores/auth';
  import InputForm from '@/components/form/InputForm.vue';
  import { Button } from '@/components/ui/button';
  import { Loader2 } from 'lucide-vue-next';
  import { loginValidationSchema, userErrorMessages } from '@/utils/errors/auth/users';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';
  import { getApiErrorMessage } from '@/utils/error.utils';
  import { associationValidationMessages } from '@/utils/errors/associations';
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

  // Données du formulaire
  const formData = reactive({
    email: '',
    password: '',
  });

  // Erreurs de validation
  const validationErrors = reactive<Record<string, string>>({});

  // Gestion erreurs pour affichage
  const touchedFields = reactive({
    email: false,
    password: false,
  });

  type FormFields = 'email' | 'password';

  const showError = (fieldName: FormFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!validationErrors[fieldName];

  const getErrorMessage = (fieldName: FormFields) =>
    touchedFields[fieldName] || formSubmitted.value ? validationErrors[fieldName] || '' : '';

  const validateForm = async () => {
    const result = await validateWithYup(loginValidationSchema, formData);

    if (result.isValid) {
      clearValidationErrors(validationErrors);
    } else {
      Object.assign(validationErrors, result.errors);
    }

    return result.isValid;
  };

  async function handleLogin() {
    formSubmitted.value = true;
    formError.value = '';

    if (!(await validateForm())) return;

    isLoading.value = true;

    try {
      authStore.error = null;

      const result = await authStore.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (result) {
        // Vérifier s'il y a une association en attente de création
        await checkAndCreatePendingAssociation();

        router.push('/');
      }
    } catch (error) {
      formError.value = getApiErrorMessage(error, userErrorMessages.apiErrors);
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

      toast.success(associationValidationMessages.creation.success);
    } catch (error) {
      console.error("Erreur lors de la création de l'association:", error);

      // Ne pas afficher d'erreur si l'association a été créée (erreur uniquement sur les uploads)
      if (!associationCreated) {
        toast.warning(associationValidationMessages.apiErrors.unknown);
      }
    } finally {
      // Nettoyer le localStorage pour éviter de recréer l'association à chaque connexion
      clearPendingAssociation();
    }
  }
</script>
