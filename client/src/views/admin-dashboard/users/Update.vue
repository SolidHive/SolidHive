<template>
  <Update
    :can-update-item="true"
    :fetch-item="`admin/users/${userId}`"
    :update-endpoint="`admin/users/${userId}`"
    :form-data="apiFormData"
    :on-before-submit="handleBeforeSubmit"
  >
    <template #title>Modifier l'utilisateur</template>
    <template #form>
      <div class="space-y-4 p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <InputForm
              v-model="formData.firstname"
              input-name="firstname"
              type="text"
              placeholder="Prénom de l'utilisateur"
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
          </div>

          <div class="space-y-2">
            <InputForm
              v-model="formData.name"
              input-name="name"
              type="text"
              placeholder="Nom de l'utilisateur"
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
          </div>
        </div>

        <div class="space-y-2">
          <InputForm
            v-model="formData.phone"
            input-name="phone"
            type="text"
            placeholder="0612345678"
            :error-message="getErrorMessage('phone')"
            :error-state="showError('phone')"
            @input="clearValidationErrors(validationErrors, 'phone')"
            @blur="() => (touchedFields.phone = true)"
          >
            <template #label>Téléphone</template>
          </InputForm>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">
            Rôles
            <span class="text-destructive">*</span>
          </label>
          <div class="space-y-3">
            <div v-for="role in availableRoles" :key="role.id" class="flex items-start space-x-3">
              <input
                :id="`role-${role.id}`"
                type="checkbox"
                :checked="selectedRoles.includes(role.name)"
                class="border-input bg-background ring-offset-background focus-visible:ring-ring mt-0.5 h-4 w-4 rounded border focus-visible:ring-2 focus-visible:ring-offset-2"
                @change="toggleRole(role.name, ($event.target as HTMLInputElement).checked)"
              />
              <label
                :for="`role-${role.id}`"
                class="cursor-pointer text-sm leading-none font-medium"
              >
                {{ role.name }}
                <span v-if="role.description" class="text-muted-foreground font-normal">
                  - {{ role.description }}
                </span>
              </label>
            </div>
          </div>
          <p v-if="showError('roles')" class="text-destructive text-sm">
            {{ validationErrors.roles }}
          </p>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Statut du compte</label>
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <input
                id="user-status"
                type="checkbox"
                :checked="!currentUserIsVerified"
                class="border-input bg-background ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:ring-2 focus-visible:ring-offset-2"
                @change="toggleUserStatus(($event.target as HTMLInputElement).checked)"
              />
              <label for="user-status" class="cursor-pointer text-sm leading-none font-medium">
                {{ currentUserIsVerified ? 'Bannir cet utilisateur' : 'Débannir cet utilisateur' }}
              </label>
            </div>
            <p class="text-muted-foreground text-sm">
              {{
                currentUserIsVerified
                  ? "En cochant cette case, l'utilisateur sera banni et ne pourra plus se connecter."
                  : "En décochant cette case, l'utilisateur sera débanni et pourra se reconnecter."
              }}
            </p>
          </div>
        </div>
      </div>
    </template>
    <template #description>Modifiez les informations de l'utilisateur et ses rôles.</template>
  </Update>
</template>

<script setup lang="ts">
  import { Update as UpdateRaw } from '@/components/dashboard/crud';
  import InputForm from '@/components/form/InputForm.vue';
  import type { User, Role } from '@/interfaces/user.interface';
  import Database from '@/utils/database.utils';
  import { computed, onMounted, reactive, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useToast } from 'vue-toastification';
  import { updateUserValidationSchema } from '@/utils/errors/auth/users';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';

  const Update = UpdateRaw<User>;
  const route = useRoute();
  const userId = route.params.itemId as string;
  const toast = useToast();
  const formSubmitted = ref(false);
  const availableRoles = ref<Role[]>([]);
  const selectedRoles = ref<string[]>([]);
  const initialRoles = ref<string[]>([]);
  const currentUserIsVerified = ref(true);
  const initialUserIsVerified = ref(true);

  if (!userId || typeof userId !== 'string') {
    console.error('No userId provided in route parameters.');
  }
  // États du formulaire
  const formData = reactive({
    firstname: '',
    name: '',
    phone: '',
  });

  const validationErrors = reactive({
    firstname: '',
    name: '',
    phone: '',
    roles: '',
  });

  // Gestion des champs touchés
  const touchedFields = reactive({
    firstname: false,
    name: false,
    phone: false,
    roles: false,
  });

  const showError = (fieldName: keyof typeof touchedFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!validationErrors[fieldName];

  const getErrorMessage = (fieldName: keyof typeof touchedFields) =>
    touchedFields[fieldName] || formSubmitted.value ? validationErrors[fieldName] || '' : '';

  const validateForm = async () => {
    const result = await validateWithYup(updateUserValidationSchema as any, formData);

    if (result.isValid) {
      clearValidationErrors(validationErrors);
    } else {
      Object.assign(validationErrors, result.errors);
    }

    // Validation des rôles
    if (selectedRoles.value.length === 0) {
      validationErrors.roles = 'Au moins un rôle est requis';
      return false;
    } else {
      validationErrors.roles = '';
    }

    return result.isValid && selectedRoles.value.length > 0;
  };

  const apiFormData = computed(() => ({
    firstname: formData.firstname,
    name: formData.name,
    phone: formData.phone || undefined,
  }));

  function toggleRole(roleName: string, checked: boolean) {
    if (checked) {
      if (!selectedRoles.value.includes(roleName)) {
        selectedRoles.value.push(roleName);
      }
    } else {
      selectedRoles.value = selectedRoles.value.filter((r) => r !== roleName);
    }
    touchedFields.roles = true;
    clearValidationErrors(validationErrors, 'roles');
  }

  function toggleUserStatus(isBanned: boolean) {
    currentUserIsVerified.value = !isBanned;
  }

  async function handleBeforeSubmit(): Promise<boolean> {
    formSubmitted.value = true;

    if (!(await validateForm())) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return false;
    }

    // Mettre à jour les rôles séparément seulement s'ils ont changé
    const rolesChanged =
      JSON.stringify([...selectedRoles.value].sort()) !==
      JSON.stringify([...initialRoles.value].sort());

    if (rolesChanged) {
      try {
        await Database.put(`admin/users/${userId}/roles`, {
          roles: selectedRoles.value,
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour des rôles:', error);
        toast.error('Erreur lors de la mise à jour des rôles');
        return false;
      }
    }

    // Mettre à jour le statut de vérification seulement s'il a changé
    const verificationChanged = currentUserIsVerified.value !== initialUserIsVerified.value;

    if (verificationChanged) {
      try {
        await Database.update(`admin/users`, userId, {
          isVerified: currentUserIsVerified.value,
        });
        toast.success(
          currentUserIsVerified.value
            ? 'Utilisateur débanni avec succès'
            : 'Utilisateur banni avec succès'
        );
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        toast.error('Erreur lors de la mise à jour du statut');
        return false;
      }
    }

    return true;
  }

  async function fetchUser(): Promise<void> {
    try {
      const response = await Database.getAll(`admin/users/${userId}`);
      if (response) {
        formData.firstname = response.firstname || '';
        formData.name = response.name || '';
        formData.phone = response.phone || '';
        selectedRoles.value = response.roles?.map((r: Role) => r.name) || [];
        initialRoles.value = [...selectedRoles.value];
        currentUserIsVerified.value = response.isVerified ?? true;
        initialUserIsVerified.value = currentUserIsVerified.value;
      }
    } catch (err) {
      console.error("Erreur lors du chargement de l'utilisateur:", err);
    }
  }

  async function fetchRoles(): Promise<void> {
    try {
      const response = await Database.getAll('admin/users/roles');
      if (response && Array.isArray(response)) {
        availableRoles.value = response;
      }
    } catch (err) {
      console.error('Erreur lors du chargement des rôles:', err);
    }
  }

  onMounted(async () => {
    await fetchRoles();
    await fetchUser();
  });
</script>
