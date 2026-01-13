<template>
  <div class="bg-background flex min-h-screen items-center justify-center px-4 py-12">
    <div class="w-full max-w-4xl">
      <div class="bg-card rounded-3xl border p-8 shadow-xl sm:p-12">
        <!-- Header avec progression -->
        <div class="mb-10">
          <div class="mb-6 text-center">
            <h1 class="font-title text-primary mb-3 text-4xl sm:text-5xl">
              {{ currentStep === 1 ? 'Créer un compte' : 'Votre association' }}
            </h1>
            <p class="font-paragraph text-muted-foreground text-lg">
              {{
                currentStep === 1
                  ? 'Rejoignez SolidHive en quelques étapes'
                  : 'Parlez-nous de votre association'
              }}
            </p>
          </div>

          <div v-if="wantsAssociation" class="flex items-center justify-center gap-2">
            <div
              v-for="step in 2"
              :key="step"
              :class="[
                'h-2 rounded-full transition-all',
                step === currentStep
                  ? 'bg-secondary w-12'
                  : step < currentStep
                    ? 'bg-secondary/50 w-8'
                    : 'bg-muted w-8',
              ]"
            />
          </div>
        </div>

        <!-- Étape 1: Création du compte utilisateur -->
        <form v-if="currentStep === 1" class="space-y-6" @submit.prevent="handleStep1Submit">
          <!-- Nom -->
          <InputForm
            v-model="userFormData.name"
            input-name="name"
            type="text"
            placeholder="Dupont"
            :error-message="getUserErrorMessage('name')"
            :error-state="showUserError('name')"
            @input="clearValidationErrors(validationErrors, 'name')"
            @blur="() => (touchedUserFields.name = true)"
          >
            <template #label>
              Nom
              <span class="text-destructive">*</span>
            </template>
          </InputForm>

          <!-- Prénom -->
          <InputForm
            v-model="userFormData.firstname"
            input-name="firstname"
            type="text"
            placeholder="Jean"
            :error-message="getUserErrorMessage('firstname')"
            :error-state="showUserError('firstname')"
            @input="clearValidationErrors(validationErrors, 'firstname')"
            @blur="() => (touchedUserFields.firstname = true)"
          >
            <template #label>
              Prénom
              <span class="text-destructive">*</span>
            </template>
          </InputForm>

          <!-- Email -->
          <InputForm
            v-model="userFormData.email"
            input-name="email"
            type="email"
            placeholder="jean.dupont@example.com"
            :error-message="getUserErrorMessage('email')"
            :error-state="showUserError('email')"
            @input="clearValidationErrors(validationErrors, 'email')"
            @blur="() => (touchedUserFields.email = true)"
          >
            <template #label>
              Email
              <span class="text-destructive">*</span>
            </template>
            <template #hint>
              <div>Utilisez une adresse email professionnelle ou personnelle valide.</div>
            </template>
          </InputForm>

          <!-- Téléphone (optionnel) -->
          <InputForm
            v-model="userFormData.phone"
            label-value="Téléphone (optionnel)"
            input-name="phone"
            type="tel"
            placeholder="0612345678"
            :error-message="getUserErrorMessage('phone')"
            :error-state="showUserError('phone')"
            @input="clearValidationErrors(validationErrors, 'phone')"
            @blur="() => (touchedUserFields.phone = true)"
          >
            <template #hint>
              <div>Format attendu : 10 chiffres commençant par 0 (ex: 0612345678)</div>
            </template>
          </InputForm>

          <!-- Mot de passe -->
          <InputForm
            v-model="userFormData.password"
            input-name="password"
            type="password"
            placeholder="••••••••••"
            :error-message="getUserErrorMessage('password')"
            :error-state="showUserError('password')"
            @input="clearValidationErrors(validationErrors, 'password')"
            @blur="() => (touchedUserFields.password = true)"
          >
            <template #label>
              Mot de passe
              <span class="text-destructive">*</span>
            </template>
            <template #hint>
              <div>
                Le mot de passe doit contenir au moins 10 caractères, une majuscule, une minuscule,
                un chiffre et un symbole (!@#$%^&*).
              </div>
            </template>
          </InputForm>

          <!-- Checkbox représentant d'association -->
          <div class="bg-muted/50 flex items-start gap-3 rounded-2xl p-4">
            <input
              id="wantsAssociation"
              v-model="wantsAssociation"
              type="checkbox"
              class="text-secondary focus:ring-secondary mt-1 h-5 w-5 rounded border-gray-300"
            />
            <label
              for="wantsAssociation"
              class="font-paragraph text-foreground cursor-pointer text-sm leading-relaxed"
            >
              <span class="font-medium">Je représente une association</span>
              <br />
              <span class="text-muted-foreground">
                Je souhaite créer une association sur SolidHive
              </span>
            </label>
          </div>

          <!-- Boutons -->
          <div class="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <router-link
              to="/login"
              class="font-paragraph text-secondary hover:text-secondary/80 text-sm"
            >
              Déjà un compte ? Se connecter
            </router-link>
            <Button type="submit" variant="default" size="lg" :disabled="isLoading">
              <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
              {{ wantsAssociation ? 'Continuer' : "S'inscrire" }}
            </Button>
          </div>
        </form>

        <!-- Étapes 2 et 3: Formulaire d'association -->
        <AssociationForm
          v-else
          :is-loading="isLoading"
          :show-back-button="true"
          submit-button-text="Créer mon compte"
          @back="currentStep = 1"
          @submit="handleAssociationSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import Database from '@/utils/database.utils';
  import InputForm from '@/components/form/InputForm.vue';
  import AssociationForm from '@/components/form/AssociationForm.vue';
  import { Button } from '@/components/ui/button';
  import { useToast } from 'vue-toastification';
  import { Loader2 } from 'lucide-vue-next';
  import { userErrorMessages, registerValidationSchema } from '@/utils/errors/auth/users';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';
  import { getApiErrorMessage } from '@/utils/error.utils';
  import { associationValidationMessages } from '@/utils/errors/associations';
  import { savePendingAssociation, savePendingFile } from '@/utils/localStorage.utils';

  const toast = useToast();
  const router = useRouter();
  const isLoading = ref(false);
  const currentStep = ref(1);
  const wantsAssociation = ref(false);
  const formSubmitted = ref(false);

  // Données du formulaire utilisateur
  const userFormData = reactive({
    name: '',
    firstname: '',
    email: '',
    phone: '',
    password: '',
  });

  // Erreurs de validation
  const validationErrors = reactive<Record<string, string>>({});

  // Gestion erreurs pour affichage
  const touchedUserFields = reactive({
    name: false,
    firstname: false,
    email: false,
    phone: false,
    password: false,
  });

  const showUserError = (fieldName: 'name' | 'firstname' | 'email' | 'phone' | 'password') =>
    (touchedUserFields[fieldName] || formSubmitted.value) && !!validationErrors[fieldName];

  const getUserErrorMessage = (fieldName: 'name' | 'firstname' | 'email' | 'phone' | 'password') =>
    touchedUserFields[fieldName] || formSubmitted.value ? validationErrors[fieldName] || '' : '';

  const validateUserForm = async () => {
    const result = await validateWithYup(registerValidationSchema, userFormData);

    if (result.isValid) {
      clearValidationErrors(validationErrors);
    } else {
      Object.assign(validationErrors, result.errors);
    }

    return result.isValid;
  };

  // Soumission étape 1
  async function handleStep1Submit() {
    formSubmitted.value = true;

    // Valider le formulaire utilisateur
    if (!(await validateUserForm())) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    // Si pas d'association, créer le compte directement
    if (!wantsAssociation.value) {
      await createUserAccount();
    } else {
      // Sinon, passer à l'étape 2
      currentStep.value = 2;
      formSubmitted.value = false;
    }
  }

  // Soumission du formulaire d'association
  async function handleAssociationSubmit(data: {
    associationData: {
      name: string;
      description: string;
      contact: string;
      siret: string;
      primaryColor: string;
    };
    logoFile: File | null;
    backgroundFile: File | null;
  }) {
    await createUserAndAssociation(data);
  }

  // Créer uniquement le compte utilisateur
  async function createUserAccount() {
    isLoading.value = true;
    try {
      const userData = {
        name: userFormData.name.trim(),
        firstname: userFormData.firstname.trim(),
        email: userFormData.email.trim(),
        password: userFormData.password,
        phone: userFormData.phone?.trim() || undefined,
      };

      await Database.create('users/register', userData);
      toast.success('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
      router.push('/login');
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error);
      const errorMsg = getApiErrorMessage(error, userErrorMessages.apiErrors);
      toast.error(errorMsg);
    } finally {
      isLoading.value = false;
    }
  }

  // Créer compte utilisateur + sauvegarder données association pour après connexion
  async function createUserAndAssociation(data: {
    associationData: {
      name: string;
      description: string;
      contact: string;
      siret: string;
      primaryColor: string;
    };
    logoFile: File | null;
    backgroundFile: File | null;
  }) {
    isLoading.value = true;
    try {
      // 1. Créer l'utilisateur
      const userData = {
        name: userFormData.name.trim(),
        firstname: userFormData.firstname.trim(),
        email: userFormData.email.trim(),
        password: userFormData.password,
        phone: userFormData.phone?.trim() || undefined,
      };

      await Database.create('users/register', userData);

      // 2. Sauvegarder les données de l'association dans localStorage
      savePendingAssociation(data.associationData);

      // 3. Sauvegarder les fichiers en base64
      if (data.logoFile) {
        await savePendingFile(data.logoFile, 'logo');
      }

      if (data.backgroundFile) {
        await savePendingFile(data.backgroundFile, 'background');
      }

      toast.success(associationValidationMessages.creation.userCreated);
      router.push('/login');
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      const errorMsg = getApiErrorMessage(error, userErrorMessages.apiErrors);
      toast.error(errorMsg);
    } finally {
      isLoading.value = false;
    }
  }
</script>
