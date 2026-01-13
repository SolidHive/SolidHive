<template>
  <CrudCreate
    :can-create-item="crmAccess.canCreateRole"
    :create-endpoint="`association/${associationId}/roles`"
    :form-data="formData"
    :on-before-submit="handleBeforeSubmit"
  >
    <template #title>Créer un nouveau rôle</template>
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
                id="perm-all"
                v-model="selectAll"
                type="checkbox"
                class="border-input bg-background ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:ring-2 focus-visible:ring-offset-2"
                @change="toggleSelectAll"
              />
              <label for="perm-all" class="text-sm font-medium">Toutes les permissions (*)</label>
            </div>
            <div
              class="rounded-md border p-3"
              :class="showError('permissions') ? 'border-destructive' : 'border-input'"
            >
              <div class="grid grid-cols-2 gap-2">
                <div
                  v-for="permission in availablePermissions"
                  :key="permission.value"
                  class="flex items-center space-x-2"
                >
                  <input
                    :id="`perm-${permission.value}`"
                    v-model="form.permissions.$value"
                    type="checkbox"
                    :value="permission.value"
                    :disabled="selectAll"
                    class="border-input bg-background ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    @change="() => (touchedFields.permissions = true)"
                  />
                  <label
                    :for="`perm-${permission.value}`"
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
    <template #description>
      Définissez le nom, la description et les permissions pour ce nouveau rôle.
    </template>
  </CrudCreate>
</template>

<script setup lang="ts">
  import { Create as CrudCreate } from '@/components/dashboard/crud';
  import InputForm from '@/components/form/InputForm.vue';
  import TextareaForm from '@/components/form/TextareaForm.vue';
  import { useCrmAccess } from '@/composables/crm-access';
  import { Permissions } from '@/enums/permissions';
  import { useCrmStore } from '@/stores/crm';
  import { roleCrmErrorMessages } from '@/utils/errors/crm/roles';
  import { computed, onBeforeMount, reactive, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { defineForm, field, isValidForm } from 'vue-yup-form';
  import * as yup from 'yup';
  import { useToast } from 'vue-toastification';
  import { useCrmPremiumAccess } from '@/composables/crm-premium';

  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const crmPremiumAccess = useCrmPremiumAccess(crmStore.associationPremiumUntil);
  const router = useRouter();
  const associationId = route.params.id as string;
  const toast = useToast();
  const formSubmitted = ref(false);

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

  const availablePermissions = [
    { value: Permissions.REGISTERS_VIEW, label: 'Voir membres' },
    { value: Permissions.REGISTERS_CREATE, label: 'Créer membres' },
    { value: Permissions.REGISTERS_UPDATE, label: 'Modifier membres' },
    { value: Permissions.REGISTERS_DELETE, label: 'Supprimer membres' },
    { value: Permissions.ROLES_VIEW, label: 'Voir rôles' },
    { value: Permissions.ROLES_CREATE, label: 'Créer rôles' },
    { value: Permissions.ROLES_UPDATE, label: 'Modifier rôles' },
    { value: Permissions.ROLES_DELETE, label: 'Supprimer rôles' },
    { value: Permissions.ANNOUNCEMENTS_CREATE, label: 'Créer annonces' },
    { value: Permissions.ANNOUNCEMENTS_UPDATE, label: 'Modifier annonces' },
    { value: Permissions.ANNOUNCEMENTS_DELETE, label: 'Supprimer annonces' },
  ];

  // Données du formulaire pour le composant Create
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

  onBeforeMount(async () => {
    const hasPremiumAccess = await crmPremiumAccess.hasAccessToPremiumFeatures(
      Permissions.ROLES_CREATE
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

    if (!crmAccess.canCreateRole) {
      router.push('/unauthorized');
      return;
    }
  });
</script>
