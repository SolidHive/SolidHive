<template>
  <Update
    :can-update-item="crmAccess.canUpdateRole"
    :fetch-item="`association/${associationId}/roles/${id}`"
    :update-endpoint="`association/${associationId}/roles/${id}`"
    :form-data="apiFormData"
    :on-before-submit="handleBeforeSubmit"
    @after-update="handleAfterUpdate"
    @error="handleError"
  >
    <template #title>Modifier le rôle</template>
    <template #form>
      <div class="space-y-4 p-4">
        <InputForm
          v-model="formData.name"
          input-name="role-name"
          type="text"
          placeholder="Ex: Trésorier, Secrétaire..."
          :error-message="getErrorMessage('name')"
          :error-state="showError('name')"
          @input="clearValidationErrors(validationErrors, 'name')"
          @blur="() => (touchedFields.name = true)"
        >
          <template #label>
            Nom du rôle
            <span class="text-destructive">*</span>
          </template>
        </InputForm>

        <TextareaForm
          v-model="formData.description"
          input-name="role-description"
          placeholder="Décrivez les responsabilités de ce rôle..."
          :rows="3"
          :max-length="500"
          :error-message="getErrorMessage('description')"
          :error-state="showError('description')"
          @input="clearValidationErrors(validationErrors, 'description')"
          @blur="() => (touchedFields.description = true)"
        >
          <template #label>Description</template>
        </TextareaForm>

        <div class="space-y-2">
          <label class="text-sm font-medium">
            Permissions
            <span class="text-destructive">*</span>
          </label>
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <input
                id="edit-perm-all"
                v-model="selectAll"
                type="checkbox"
                class="border-input bg-background ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:ring-2 focus-visible:ring-offset-2"
                @change="toggleSelectAll"
              />
              <label for="edit-perm-all" class="text-sm font-medium">
                Toutes les permissions (*)
              </label>
            </div>
            <div
              class="rounded-md border p-3"
              :class="showError('permissions') ? 'border-destructive' : 'border-input'"
            >
              <div class="grid grid-cols-2 gap-2">
                <div
                  v-for="permission in availablePermissions()"
                  :key="permission.value"
                  class="flex items-center space-x-2"
                >
                  <input
                    :id="`edit-perm-${permission.value}`"
                    v-model="formData.permissions"
                    type="checkbox"
                    :value="permission.value"
                    :disabled="selectAll"
                    class="border-input bg-background ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    @change="
                      () => {
                        touchedFields.permissions = true;
                        clearValidationErrors(validationErrors, 'permissions');
                      }
                    "
                  />
                  <label
                    :for="`edit-perm-${permission.value}`"
                    class="text-sm"
                    :class="selectAll ? 'opacity-50' : ''"
                  >
                    {{ permission.label }}
                  </label>
                </div>
              </div>
            </div>
            <p v-if="showError('permissions')" class="text-destructive text-sm">
              {{ getErrorMessage('permissions') }}
            </p>
          </div>
        </div>
      </div>
    </template>
    <template #description>Modifiez le nom, la description et les permissions du rôle.</template>
  </Update>
</template>

<script setup lang="ts">
  import { Update as UpdateRaw } from '@/components/dashboard/crud';
  import InputForm from '@/components/form/InputForm.vue';
  import TextareaForm from '@/components/form/TextareaForm.vue';
  import { useCrmAccess } from '@/composables/crm-access';
  import type { Role } from '@/interfaces/roles.interface';
  import { useCrmStore } from '@/stores/crm';
  import Database from '@/utils/database.utils';
  import { updateRoleValidationSchema } from '@/utils/errors/crm/roles';
  import { availablePermissions } from '@/utils/permissions.utils';
  import { computed, onBeforeMount, onMounted, reactive, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';
  import { useToast } from 'vue-toastification';
  import { Permissions } from '@/enums/permissions';
  import { useCrmPremiumAccess } from '@/composables/crm-premium';

  const Update = UpdateRaw<Role>;
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const crmPremiumAccess = useCrmPremiumAccess(crmStore.associationPremiumUntil);
  const router = useRouter();
  const associationId = route.params.id as string;
  const id = route.params.itemId;
  const toast = useToast();
  const formSubmitted = ref(false);

  if (!id || typeof id !== 'string') {
    console.error('No role ID provided in route parameters.');
  }

  // États du formulaire
  const formData = reactive({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const validationErrors = reactive({
    name: '',
    description: '',
    permissions: '',
  });

  // Gestion des champs touchés
  const touchedFields = reactive({
    name: false,
    description: false,
    permissions: false,
  });

  const showError = (fieldName: keyof typeof touchedFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!validationErrors[fieldName];

  const getErrorMessage = (fieldName: keyof typeof touchedFields) =>
    touchedFields[fieldName] || formSubmitted.value ? validationErrors[fieldName] || '' : '';

  const validateForm = async () => {
    const result = await validateWithYup(updateRoleValidationSchema as any, formData);

    if (result.isValid) {
      clearValidationErrors(validationErrors);
    } else {
      Object.assign(validationErrors, result.errors);
    }

    return result.isValid;
  };

  const selectAll = ref(false);

  // Données du formulaire pour le composant Update
  const apiFormData = computed(() => ({
    name: formData.name,
    description: formData.description || undefined,
    permissions: formData.permissions,
  }));

  async function handleBeforeSubmit(): Promise<boolean> {
    formSubmitted.value = true;

    if (!(await validateForm())) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return false;
    }

    return true;
  }

  async function handleAfterUpdate(_updatedItem: any): Promise<void> {
    toast.success('Rôle mis à jour avec succès !');
  }

  function handleError(errorDetails: { field?: string; message: string }) {
    if (errorDetails.field) {
      // Erreur de champ spécifique
      validationErrors[errorDetails.field as keyof typeof validationErrors] = errorDetails.message;
      touchedFields[errorDetails.field as keyof typeof touchedFields] = true;
    } else {
      // Erreur générale
      toast.error(errorDetails.message);
    }
  }

  function toggleSelectAll() {
    if (selectAll.value) {
      formData.permissions = ['*'];
    } else {
      formData.permissions = [];
    }
    touchedFields.permissions = true;
  }

  async function fetchRole(): Promise<void> {
    try {
      const response = await Database.getAll(`association/${associationId}/roles/${id}`);
      if (response) {
        formData.name = response.name || '';
        formData.description = response.description || '';
        formData.permissions = response.permissions || [];
        selectAll.value = response.permissions?.includes('*') || false;
      }
    } catch (err) {
      console.error('Erreur lors du chargement du rôle:', err);
    }
  }

  watch(
    () => formData.permissions,
    (newPerms) => {
      if (newPerms.includes('*')) {
        selectAll.value = true;
      } else if (selectAll.value && newPerms.length === 0) {
        selectAll.value = false;
      }
    }
  );

  onMounted(async () => {
    await fetchRole();
  });

  onBeforeMount(async () => {
    const hasPremiumAccess = await crmPremiumAccess.hasAccessToPremiumFeatures(
      Permissions.ROLES_UPDATE
    );

    if (!hasPremiumAccess) {
      router.push({
        name: 'CRMPremiumRequired',
        params: {
          id: route.params.id,
        },
      });
      return;
    }

    if (!crmAccess.canUpdateRole) {
      router.push('/unauthorized');
      return;
    }
  });
</script>
