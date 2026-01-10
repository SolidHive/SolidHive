<template>
  <Update
    :can-update-item="crmAccess.canUpdateRole"
    :fetch-item="`association/${associationId}/roles/${id}`"
    :update-endpoint="`association/${associationId}/roles/${id}`"
    :form-data="formData"
    :on-before-submit="handleBeforeSubmit"
  >
    <template #title>Modifier le rôle</template>
    <template #form>
      <div class="space-y-4 p-4">
        <InputForm
          v-model="form.name.$value"
          input-name="role-name"
          type="text"
          placeholder="Ex: Trésorier, Secrétaire..."
          :error-message="form.name.$error?.message || ''"
          :error-state="showError('name')"
          @blur="() => (touchedFields.name = true)"
        >
          <template #label>
            Nom du rôle
            <span class="text-destructive">*</span>
          </template>
        </InputForm>

        <TextareaForm
          v-model="form.description.$value"
          input-name="role-description"
          placeholder="Décrivez les responsabilités de ce rôle..."
          :rows="3"
          :max-length="500"
          :error-message="form.description.$error?.message || ''"
          :error-state="showError('description')"
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
                    v-model="form.permissions.$value"
                    type="checkbox"
                    :value="permission.value"
                    :disabled="selectAll"
                    class="border-input bg-background ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    @change="() => (touchedFields.permissions = true)"
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
              {{ form.permissions.$error?.message || '' }}
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
  import { roleCrmErrorMessages } from '@/utils/errors/crm/roles';
  import { availablePermissions } from '@/utils/permissions.utils';
  import { computed, onMounted, reactive, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { defineForm, field, isValidForm } from 'vue-yup-form';
  import * as yup from 'yup';
  import { useToast } from 'vue-toastification';

  const Update = UpdateRaw<Role>;
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const associationId = route.params.id as string;
  const id = route.params.itemId;
  const toast = useToast();
  const formSubmitted = ref(false);

  if (!id || typeof id !== 'string') {
    console.error('No role ID provided in route parameters.');
  }

  // Schéma de validation avec yup
  const form = defineForm({
    name: field(
      '',
      yup
        .string()
        .required(roleCrmErrorMessages.required.name)
        .min(3, roleCrmErrorMessages.minLength.name)
        .max(50, roleCrmErrorMessages.maxLength.name)
    ),
    description: field('', yup.string().max(500, roleCrmErrorMessages.maxLength.description)),
    permissions: field(
      [] as string[],
      yup
        .array()
        .of(yup.string())
        .min(1, roleCrmErrorMessages.required.permissions)
        .required(roleCrmErrorMessages.required.permissions)
    ),
  });

  // Gestion des champs touchés
  const touchedFields = reactive({
    name: false,
    description: false,
    permissions: false,
  });

  const showError = (fieldName: keyof typeof touchedFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!form[fieldName].$error;

  const selectAll = ref(false);

  // Données du formulaire pour le composant Update
  const formData = computed(() => ({
    name: form.name.$value,
    description: form.description.$value || undefined,
    permissions: form.permissions.$value,
  }));

  async function handleBeforeSubmit(): Promise<boolean> {
    formSubmitted.value = true;

    if (!(await isValidForm(form))) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return false;
    }

    return true;
  }

  function toggleSelectAll() {
    if (selectAll.value) {
      form.permissions.$value = ['*'];
    } else {
      form.permissions.$value = [];
    }
    touchedFields.permissions = true;
  }

  async function fetchRole(): Promise<void> {
    try {
      const response = await Database.getAll(`association/${associationId}/roles/${id}`);
      if (response) {
        form.name.$value = response.name || '';
        form.description.$value = response.description || '';
        form.permissions.$value = response.permissions || [];
        selectAll.value = response.permissions?.includes('*') || false;
      }
    } catch (err) {
      console.error('Erreur lors du chargement du rôle:', err);
    }
  }

  watch(
    () => form.permissions.$value,
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
</script>
