<template>
  <div class="bg-background flex min-h-screen items-center justify-center px-4 py-12">
    <div class="w-full max-w-4xl">
      <div class="bg-card rounded-3xl border p-8 shadow-xl sm:p-12">
        <!-- Header avec progression -->
        <div class="mb-10">
          <div class="mb-6 text-center">
            <h1 class="font-title text-primary mb-3 text-4xl sm:text-5xl">
              {{
                currentStep === 1
                  ? 'Créer un compte'
                  : currentStep === 2
                    ? 'Votre association'
                    : 'Personnaliser votre association'
              }}
            </h1>
            <p class="font-paragraph text-muted-foreground text-lg">
              {{
                currentStep === 1
                  ? 'Rejoignez SolidHive en quelques étapes'
                  : currentStep === 2
                    ? 'Parlez-nous de votre association'
                    : 'Ajoutez logo et bannière'
              }}
            </p>
          </div>

          <!-- Indicateur de progression (affiché seulement si association) -->
          <div v-if="wantsAssociation" class="flex items-center justify-center gap-2">
            <div
              v-for="step in 3"
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
            v-model="userForm.name.$value"
            input-name="name"
            type="text"
            placeholder="Dupont"
            :error-message="userForm.name.$error?.message || ''"
            :error-state="showUserError('name')"
            @blur="() => (touchedUserFields.name = true)"
          >
            <template #label>
              Nom
              <span class="text-destructive">*</span>
            </template>
          </InputForm>

          <!-- Prénom -->
          <InputForm
            v-model="userForm.firstname.$value"
            input-name="firstname"
            type="text"
            placeholder="Jean"
            :error-message="userForm.firstname.$error?.message || ''"
            :error-state="showUserError('firstname')"
            @blur="() => (touchedUserFields.firstname = true)"
          >
            <template #label>
              Prénom
              <span class="text-destructive">*</span>
            </template>
          </InputForm>

          <!-- Email -->
          <InputForm
            v-model="userForm.email.$value"
            input-name="email"
            type="email"
            placeholder="jean.dupont@example.com"
            :error-message="userForm.email.$error?.message || ''"
            :error-state="showUserError('email')"
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
            v-model="userForm.phone.$value"
            label-value="Téléphone (optionnel)"
            input-name="phone"
            type="tel"
            placeholder="0612345678"
            :error-message="userForm.phone.$error?.message || ''"
            :error-state="showUserError('phone')"
            @blur="() => (touchedUserFields.phone = true)"
          >
            <template #hint>
              <div>Format attendu : 10 chiffres commençant par 0 (ex: 0612345678)</div>
            </template>
          </InputForm>

          <!-- Mot de passe -->
          <InputForm
            v-model="userForm.password.$value"
            input-name="password"
            type="password"
            placeholder="••••••••••"
            :error-message="userForm.password.$error?.message || ''"
            :error-state="showUserError('password')"
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

        <!-- Étape 2: Informations de l'association -->
        <form v-else-if="currentStep === 2" class="space-y-6" @submit.prevent="handleStep2Submit">
          <!-- Nom de l'association -->
          <InputForm
            v-model="associationForm.name.$value"
            input-name="association-name"
            type="text"
            placeholder="Association Solidaire"
            :error-message="associationForm.name.$error?.message || ''"
            :error-state="showAssociationError('name')"
            @blur="() => (touchedAssociationFields.name = true)"
          >
            <template #label>
              Nom de l'association
              <span class="text-destructive">*</span>
            </template>
            <template #hint>
              <div>Le nom officiel de votre association tel qu'il apparaît sur vos documents.</div>
            </template>
          </InputForm>

          <!-- Description -->
          <div>
            <label class="font-paragraph text-foreground mb-2 block text-sm font-medium">
              Description
              <span class="text-destructive">*</span>
            </label>
            <textarea
              v-model="associationForm.description.$value"
              placeholder="Décrivez votre association, ses missions, ses objectifs..."
              rows="4"
              class="font-paragraph border-input bg-background focus:border-secondary focus:ring-secondary/20 w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:outline-none"
              :class="showAssociationError('description') ? 'border-destructive' : ''"
              @blur="() => (touchedAssociationFields.description = true)"
            />
            <p
              v-if="showAssociationError('description')"
              class="font-paragraph text-destructive mt-2 text-sm"
            >
              {{ associationForm.description.$error?.message }}
            </p>
          </div>

          <!-- Email de contact -->
          <InputForm
            v-model="associationForm.contact.$value"
            input-name="association-contact"
            type="email"
            placeholder="contact@association.fr"
            :error-message="associationForm.contact.$error?.message || ''"
            :error-state="showAssociationError('contact')"
            @blur="() => (touchedAssociationFields.contact = true)"
          >
            <template #label>
              Email de contact
              <span class="text-destructive">*</span>
            </template>
            <template #hint>
              <div>
                Adresse email professionnelle de l'association pour être contacté par les bénévoles
                et donateurs.
              </div>
            </template>
          </InputForm>

          <!-- SIRET -->
          <InputForm
            v-model="associationForm.siret.$value"
            input-name="association-siret"
            type="text"
            placeholder="12345678901234"
            :error-message="associationForm.siret.$error?.message || ''"
            :error-state="showAssociationError('siret')"
            @blur="() => (touchedAssociationFields.siret = true)"
          >
            <template #label>
              SIRET
              <span class="text-destructive">*</span>
            </template>
            <template #hint>
              <div>
                Numéro SIRET de l'association (14 chiffres). Ce numéro permet d'identifier
                légalement votre association.
              </div>
            </template>
          </InputForm>

          <!-- Boutons -->
          <div class="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" @click="currentStep = 1">
              <ChevronLeft class="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Button type="submit" variant="default" size="lg" :disabled="isLoading">
              <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
              Continuer
            </Button>
          </div>
        </form>

        <!-- Étape 3: Logo et bannière -->
        <form v-else-if="currentStep === 3" class="space-y-6" @submit.prevent="handleStep3Submit">
          <!-- Upload Logo -->
          <div>
            <label class="font-paragraph text-foreground mb-2 block text-sm font-medium">
              Logo de l'association
              <span class="text-destructive">*</span>
            </label>
            <div class="flex items-center gap-4">
              <div
                :class="[
                  'bg-muted flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed',
                  fileErrors.logo ? 'border-destructive' : 'border-border',
                ]"
              >
                <Building2 v-if="!logoPreview" class="text-muted-foreground h-10 w-10" />
                <img
                  v-else
                  :src="logoPreview"
                  alt="Logo preview"
                  class="h-full w-full rounded-2xl object-cover"
                />
              </div>
              <div class="flex-1">
                <input
                  ref="logoInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleLogoUpload"
                />
                <Button type="button" variant="outline" size="sm" @click="logoInput?.click()">
                  <Upload class="mr-2 h-4 w-4" />
                  Choisir un logo
                </Button>
                <p class="font-paragraph text-muted-foreground mt-2 text-xs">
                  Format recommandé : carré, PNG ou JPG (max 5 Mo)
                </p>
                <p v-if="fileErrors.logo" class="font-paragraph text-destructive mt-2 text-sm">
                  {{ fileErrors.logo }}
                </p>
              </div>
            </div>
          </div>

          <!-- Upload Bannière -->
          <div>
            <label class="font-paragraph text-foreground mb-2 block text-sm font-medium">
              Bannière de l'association
              <span class="text-destructive">*</span>
            </label>
            <div class="space-y-4">
              <div
                :class="[
                  'bg-muted flex h-32 items-center justify-center rounded-2xl border-2 border-dashed',
                  fileErrors.background ? 'border-destructive' : 'border-border',
                ]"
              >
                <Image v-if="!backgroundPreview" class="text-muted-foreground h-10 w-10" />
                <img
                  v-else
                  :src="backgroundPreview"
                  alt="Background preview"
                  class="h-full w-full rounded-2xl object-cover"
                />
              </div>
              <div>
                <input
                  ref="backgroundInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleBackgroundUpload"
                />
                <Button type="button" variant="outline" size="sm" @click="backgroundInput?.click()">
                  <Upload class="mr-2 h-4 w-4" />
                  Choisir une bannière
                </Button>
                <p class="font-paragraph text-muted-foreground mt-2 text-xs">
                  Format recommandé : 16:9, PNG ou JPG (max 10 Mo)
                </p>
                <p
                  v-if="fileErrors.background"
                  class="font-paragraph text-destructive mt-2 text-sm"
                >
                  {{ fileErrors.background }}
                </p>
              </div>
            </div>
          </div>

          <!-- Boutons -->
          <div class="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" @click="currentStep = 2">
              <ChevronLeft class="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Button type="submit" variant="default" size="lg" :disabled="isLoading">
              <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
              Créer mon compte
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <LoadingOverlay :show="isLoading" message="Création de votre compte..." />
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import Database from '../../utils/database.utils';
  import InputForm from '../../components/form/InputForm.vue';
  import { Button } from '../../components/ui/button';
  import { useToast } from 'vue-toastification';
  import LoadingOverlay from '../../components/LoadingOverlay.vue';
  import { Loader2, ChevronLeft, Building2, Upload, Image } from 'lucide-vue-next';
  import { defineForm, field, isValidForm } from 'vue-yup-form';
  import * as yup from 'yup';
  import { userErrorMessages } from '../../utils/errors/auth/users';
  import { associationErrorMessages } from '../../utils/errors/auth/associations';
  import { savePendingAssociation, savePendingFile } from '../../utils/localStorage.utils';

  const toast = useToast();
  const router = useRouter();
  const isLoading = ref(false);
  const currentStep = ref(1);
  const wantsAssociation = ref(false);
  const formSubmitted = ref(false);

  // Erreurs des fichiers
  const fileErrors = reactive({
    logo: '',
    background: '',
  });

  // Schéma de validation utilisateur avec yup
  const userForm = defineForm({
    name: field(
      '',
      yup.string().required(userErrorMessages.required.name).max(50, userErrorMessages.length.name)
    ),
    firstname: field(
      '',
      yup
        .string()
        .required(userErrorMessages.required.firstname)
        .max(50, userErrorMessages.length.firstname)
    ),
    email: field(
      '',
      yup.string().required(userErrorMessages.required.email).email(userErrorMessages.format.email)
    ),
    phone: field(
      '',
      yup
        .string()
        .optional()
        .test('phone-format', userErrorMessages.format.phone, (value) => {
          if (!value) return true;
          return userErrorMessages.patterns.phone.test(value);
        })
    ),
    password: field(
      '',
      yup
        .string()
        .required(userErrorMessages.required.password)
        .matches(userErrorMessages.patterns.password, userErrorMessages.password.invalid)
    ),
  });

  // Schéma de validation association avec yup
  const associationForm = defineForm({
    name: field('', yup.string().required("Le nom de l'association est requis").min(3).max(100)),
    description: field('', yup.string().required('La description est requise').min(5).max(1000)),
    contact: field(
      '',
      yup.string().required("L'email de contact est requis").email('Email invalide')
    ),
    siret: field(
      '',
      yup
        .string()
        .required('Le numéro SIRET est requis')
        .matches(/^\d{14}$/, 'Le SIRET doit contenir exactement 14 chiffres')
    ),
  });

  // Fichiers
  const logoFile = ref<File | null>(null);
  const backgroundFile = ref<File | null>(null);
  const logoPreview = ref<string>('');
  const backgroundPreview = ref<string>('');
  const logoInput = ref<HTMLInputElement | null>(null);
  const backgroundInput = ref<HTMLInputElement | null>(null);

  // Gestion erreurs pour affichage
  const touchedUserFields = reactive({
    name: false,
    firstname: false,
    email: false,
    phone: false,
    password: false,
  });

  const touchedAssociationFields = reactive({
    name: false,
    description: false,
    contact: false,
    siret: false,
  });

  const showUserError = (fieldName: 'name' | 'firstname' | 'email' | 'phone' | 'password') =>
    (touchedUserFields[fieldName] || formSubmitted.value) && !!userForm[fieldName].$error;

  const showAssociationError = (fieldName: 'name' | 'description' | 'contact' | 'siret') =>
    (touchedAssociationFields[fieldName] || formSubmitted.value) &&
    !!associationForm[fieldName].$error;

  // Gestion uploads
  function handleLogoUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    fileErrors.logo = '';

    if (file) {
      // Validation du type de fichier
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
        fileErrors.logo = associationErrorMessages.format.logo;
        logoFile.value = null;
        logoPreview.value = '';
        return;
      }

      // Validation de la taille (5 Mo max)
      if (file.size > 5 * 1024 * 1024) {
        fileErrors.logo = associationErrorMessages.size.logo;
        logoFile.value = null;
        logoPreview.value = '';
        return;
      }

      logoFile.value = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        logoPreview.value = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  function handleBackgroundUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    fileErrors.background = '';

    if (file) {
      // Validation du type de fichier
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
        fileErrors.background = associationErrorMessages.format.background;
        backgroundFile.value = null;
        backgroundPreview.value = '';
        return;
      }

      // Validation de la taille (10 Mo max)
      if (file.size > 10 * 1024 * 1024) {
        fileErrors.background = associationErrorMessages.size.background;
        backgroundFile.value = null;
        backgroundPreview.value = '';
        return;
      }

      backgroundFile.value = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        backgroundPreview.value = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Fonction pour gérer les erreurs API
  function getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (error as { response: { status: number; data?: { message?: string } } })
        .response;
      const status = response.status;
      const message = response.data?.message;

      return status in userErrorMessages.apiErrors
        ? message || userErrorMessages.apiErrors[status as keyof typeof userErrorMessages.apiErrors]
        : userErrorMessages.apiErrors.unknown;
    }
    return userErrorMessages.apiErrors.unknown;
  }

  // Soumission étape 1
  async function handleStep1Submit() {
    formSubmitted.value = true;

    // Valider le formulaire utilisateur
    if (!(await isValidForm(userForm))) {
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

  // Soumission étape 2
  async function handleStep2Submit() {
    formSubmitted.value = true;

    // Valider le formulaire association
    if (!(await isValidForm(associationForm))) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    // Passer à l'étape 3
    currentStep.value = 3;
  }

  // Soumission étape 3
  async function handleStep3Submit() {
    // Valider que les fichiers sont présents
    fileErrors.logo = '';
    fileErrors.background = '';
    let hasError = false;

    if (!logoFile.value) {
      fileErrors.logo = associationErrorMessages.required.logo;
      hasError = true;
    }

    if (!backgroundFile.value) {
      fileErrors.background = associationErrorMessages.required.background;
      hasError = true;
    }

    if (hasError) {
      toast.error('Veuillez ajouter le logo et la bannière de votre association');
      return;
    }

    await createUserAndAssociation();
  }

  // Créer uniquement le compte utilisateur
  async function createUserAccount() {
    isLoading.value = true;
    try {
      const userData = {
        name: userForm.name.$value.trim(),
        firstname: userForm.firstname.$value.trim(),
        email: userForm.email.$value.trim(),
        password: userForm.password.$value,
        phone: userForm.phone.$value?.trim() || undefined,
      };

      await Database.create('users/register', userData);
      toast.success('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
      router.push('/login');
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error);
      const errorMsg = getErrorMessage(error);
      toast.error(errorMsg);
    } finally {
      isLoading.value = false;
    }
  }

  // Créer compte utilisateur + sauvegarder données association pour après connexion
  async function createUserAndAssociation() {
    isLoading.value = true;
    try {
      // 1. Créer l'utilisateur
      const userData = {
        name: userForm.name.$value.trim(),
        firstname: userForm.firstname.$value.trim(),
        email: userForm.email.$value.trim(),
        password: userForm.password.$value,
        phone: userForm.phone.$value?.trim() || undefined,
      };

      await Database.create('users/register', userData);

      // 2. Sauvegarder les données de l'association dans localStorage
      const associationData = {
        name: associationForm.name.$value.trim(),
        description: associationForm.description.$value.trim(),
        contact: associationForm.contact.$value.trim(),
        siret: associationForm.siret.$value.trim(),
      };

      savePendingAssociation(associationData);

      // 3. Sauvegarder les fichiers en base64
      if (logoFile.value) {
        await savePendingFile(logoFile.value, 'logo');
      }

      if (backgroundFile.value) {
        await savePendingFile(backgroundFile.value, 'background');
      }

      toast.success(associationErrorMessages.creation.userCreated);
      router.push('/login');
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      const errorMsg = getErrorMessage(error);
      toast.error(errorMsg);
    } finally {
      isLoading.value = false;
    }
  }
</script>
