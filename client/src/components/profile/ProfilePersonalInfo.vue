<template>
  <div class="bg-card border-border rounded-3xl border p-4 shadow-sm sm:p-6">
    <div class="mb-5 flex items-center justify-between">
      <h2 class="font-subtitle text-foreground text-lg">Informations personnelles</h2>
      <button
        v-if="!isEditing"
        class="text-muted-foreground hover:bg-accent flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors hover:text-white"
        @click="startEditing"
      >
        <Edit class="h-4 w-4" />
        Modifier
      </button>
    </div>

    <form v-if="isEditing" class="grid gap-4 sm:grid-cols-2" @submit.prevent="saveChanges">
      <InputForm
        v-model="formData.name"
        input-name="name"
        type="text"
        required
        :disabled="isSaving"
        placeholder="Votre nom"
        :error-message="getErrorMessage('name')"
        :error-state="showError('name')"
        @input="clearValidationErrors(validationErrors, 'name')"
        @blur="() => (touchedFields.name = true)"
      >
        <template #label>
          Nom
          <span class="text-destructive">*</span>
        </template>
      </InputForm>

      <InputForm
        v-model="formData.firstname"
        input-name="firstname"
        type="text"
        required
        :disabled="isSaving"
        placeholder="Votre prénom"
        :error-message="getErrorMessage('firstname')"
        :error-state="showError('firstname')"
        @input="clearValidationErrors(validationErrors, 'firstname')"
        @blur="() => (touchedFields.firstname = true)"
      >
        <template #label>
          Prénom
          <span class="text-destructive">*</span>
        </template>
      </InputForm>

      <div class="group sm:col-span-2">
        <label
          class="font-paragraph text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
        >
          Email
        </label>
        <div
          class="font-paragraph text-muted-foreground bg-muted flex items-center gap-2 rounded-xl px-4 py-2.5"
        >
          <Mail class="h-4 w-4" />
          {{ profile?.email }}
          <span class="text-xs">(non modifiable)</span>
        </div>
      </div>

      <div class="group">
        <label
          class="font-paragraph text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
        >
          Téléphone
        </label>
        <InputForm
          v-model="formData.phone"
          input-name="phone"
          type="tel"
          :disabled="isSaving"
          placeholder="0612345678"
          :error-message="getErrorMessage('phone')"
          :error-state="showError('phone')"
          @input="clearValidationErrors(validationErrors, 'phone')"
          @blur="() => (touchedFields.phone = true)"
        >
          <template #label>Téléphone</template>
          <template #hint>Format attendu : 10 chiffres commençant par 0 (ex: 0612345678)</template>
        </InputForm>
      </div>

      <div class="flex gap-3 pt-2 sm:col-span-2">
        <button
          type="submit"
          :disabled="isSaving"
          class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Loader2 v-if="isSaving" class="h-4 w-4 animate-spin" />
          {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
        <button
          type="button"
          :disabled="isSaving"
          class="border-border text-foreground hover:bg-muted rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          @click="cancelEditing"
        >
          Annuler
        </button>
      </div>
    </form>

    <div v-else-if="profile" class="grid gap-4 sm:grid-cols-2">
      <div class="group">
        <label
          class="font-paragraph text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
        >
          Nom
        </label>
        <p
          class="font-paragraph text-foreground bg-muted/50 group-hover:bg-muted rounded-xl px-4 py-2.5 transition-colors"
        >
          {{ profile.name || 'Non renseigné' }}
        </p>
      </div>

      <div class="group">
        <label
          class="font-paragraph text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
        >
          Prénom
        </label>
        <p
          class="font-paragraph text-foreground bg-muted/50 group-hover:bg-muted rounded-xl px-4 py-2.5 transition-colors"
        >
          {{ profile.firstname || 'Non renseigné' }}
        </p>
      </div>

      <div class="group sm:col-span-2">
        <label
          class="font-paragraph text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
        >
          Email
        </label>
        <p
          class="font-paragraph text-foreground bg-muted/50 group-hover:bg-muted flex items-center gap-2 rounded-xl px-4 py-2.5 transition-colors"
        >
          <Mail class="text-muted-foreground h-4 w-4" />
          {{ profile.email }}
        </p>
      </div>

      <div class="group">
        <label
          class="font-paragraph text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase"
        >
          Téléphone
        </label>
        <p
          class="font-paragraph text-foreground bg-muted/50 group-hover:bg-muted rounded-xl px-4 py-2.5 transition-colors"
        >
          {{ profile.phone || 'Non renseigné' }}
        </p>
      </div>
    </div>

    <div v-else class="bg-muted/30 flex h-32 items-center justify-center rounded-2xl">
      <LoadingOverlay :show="true" message="Chargement de votre profil..." />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch } from 'vue';
  import { Edit, Mail, Loader2 } from 'lucide-vue-next';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import InputForm from '@/components/form/InputForm.vue';
  import { useAuthStore } from '@/stores/auth';
  import { useToast } from 'vue-toastification';
  import { userErrorMessages, updateUserValidationSchema } from '@/utils/errors/auth/users';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';
  import { getApiErrorMessage } from '@/utils/error.utils';
  import type { User } from '@/interfaces';

  interface Props {
    profile: User | null;
  }

  const props = defineProps<Props>();

  const toast = useToast();
  const authStore = useAuthStore();
  const isEditing = ref(false);
  const isSaving = ref(false);
  const formSubmitted = ref(false);

  const formData = reactive({
    name: '',
    firstname: '',
    phone: '',
  });

  const validationErrors = reactive<Record<string, string>>({});

  const touchedFields = reactive({
    name: false,
    firstname: false,
    phone: false,
  });

  const showError = (fieldName: 'name' | 'firstname' | 'phone') =>
    (touchedFields[fieldName] || formSubmitted.value) && !!validationErrors[fieldName];

  const getErrorMessage = (fieldName: 'name' | 'firstname' | 'phone') =>
    touchedFields[fieldName] || formSubmitted.value ? validationErrors[fieldName] || '' : '';

  watch(
    () => props.profile,
    (newProfile: User | null) => {
      if (newProfile) {
        formData.name = newProfile.name || '';
        formData.firstname = newProfile.firstname || '';
        formData.phone = newProfile.phone || '';
      }
    },
    { immediate: true }
  );

  function startEditing() {
    isEditing.value = true;
    formSubmitted.value = false;
    clearValidationErrors(validationErrors);
  }

  function cancelEditing() {
    if (props.profile) {
      formData.name = props.profile.name || '';
      formData.firstname = props.profile.firstname || '';
      formData.phone = props.profile.phone || '';
    }
    isEditing.value = false;
    formSubmitted.value = false;
    clearValidationErrors(validationErrors);
  }

  const validateForm = async () => {
    const result = await validateWithYup(updateUserValidationSchema, formData);

    if (result.isValid) {
      clearValidationErrors(validationErrors);
    } else {
      Object.assign(validationErrors, result.errors);
    }

    return result.isValid;
  };

  async function saveChanges() {
    formSubmitted.value = true;

    if (!(await validateForm())) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    isSaving.value = true;

    try {
      const updateData: Partial<User> = {
        name: formData.name.trim(),
        firstname: formData.firstname.trim(),
      };

      if (formData.phone.trim()) {
        updateData.phone = formData.phone.trim();
      }

      await authStore.updateUser(updateData);
      toast.success('Profil mis à jour avec succès');
      isEditing.value = false;
      formSubmitted.value = false;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      const errorMsg = getApiErrorMessage(error, userErrorMessages.apiErrors);
      toast.error(errorMsg);
    } finally {
      isSaving.value = false;
    }
  }
</script>
