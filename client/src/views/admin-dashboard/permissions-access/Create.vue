<template>
  <CrudCreate
    :can-create-item="true"
    :create-endpoint="`permission-access`"
    :form-data="apiFormData"
    :on-before-submit="handleBeforeSubmit"
  >
    <template #title>Créer une nouvelle permission d'accès</template>
    <template #form>
      <div class="space-y-4 p-4">
        <div class="space-y-2">
          <SelectForm
            :model-value="formData.permission"
            input-name="permission"
            :error-message="getErrorMessage('permission')"
            :error-state="showError('permission')"
            @update:model-value="formData.permission = $event"
            @change="clearValidationErrors(validationErrors, 'permission')"
            @blur="() => (touchedFields.permission = true)"
          >
            <template #label>
              Permission
              <span class="text-destructive">*</span>
            </template>
            <template #options>
              <option value="">Sélectionnez une permission</option>
              <option v-for="perm in availablePermissions" :key="perm.value" :value="perm.value">
                {{ perm.label }}
              </option>
            </template>
          </SelectForm>
        </div>

        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <InputForm
              :model-value="formData.requiresSubscription"
              type="checkbox"
              input-name="requires-subscription"
              :input-class="'border-input bg-background ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:ring-2 focus-visible:ring-offset-2'"
              @update:model-value="formData.requiresSubscription = $event"
              @change="() => (touchedFields.requiresSubscription = true)"
            />
            <label for="requires-subscription" class="text-sm font-medium">
              Nécessite un abonnement premium
            </label>
          </div>
        </div>
      </div>
    </template>
    <template #description>
      Définissez la permission et si elle nécessite un abonnement premium.
    </template>
  </CrudCreate>
</template>

<script setup lang="ts">
  import { Create as CrudCreate } from '@/components/dashboard/crud';
  import InputForm from '@/components/form/InputForm.vue';
  import SelectForm from '@/components/form/SelectForm.vue';
  import { Permissions } from '@/enums/permissions';
  import Database from '@/utils/database.utils';
  import { computed, onMounted, reactive, ref } from 'vue';
  import { useToast } from 'vue-toastification';
  import { createPermissionAccessValidationSchema } from '@/utils/errors/admin/permissions-access';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';

  const toast = useToast();
  const formSubmitted = ref(false);
  const usedPermissions = ref<string[]>([]);

  // États du formulaire
  const formData = reactive({
    permission: '',
    requiresSubscription: false,
  });

  const validationErrors = reactive({
    permission: '',
    requiresSubscription: '',
  });

  // Gestion des champs touchés
  const touchedFields = reactive({
    permission: false,
    requiresSubscription: false,
  });

  const showError = (fieldName: keyof typeof touchedFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!validationErrors[fieldName];

  const getErrorMessage = (fieldName: keyof typeof touchedFields) =>
    touchedFields[fieldName] || formSubmitted.value ? validationErrors[fieldName] || '' : '';

  const validateForm = async () => {
    const result = await validateWithYup(createPermissionAccessValidationSchema as any, formData);

    if (result.isValid) {
      clearValidationErrors(validationErrors);
    } else {
      Object.assign(validationErrors, result.errors);
    }

    return result.isValid;
  };

  const allPermissions = [
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
    { value: Permissions.EVENTS_CREATE, label: 'Créer événements' },
    { value: Permissions.EVENTS_UPDATE, label: 'Modifier événements' },
    { value: Permissions.EVENTS_DELETE, label: 'Supprimer événements' },
    { value: Permissions.FUNDRAISINGS_CREATE, label: 'Créer cagnottes' },
    { value: Permissions.FUNDRAISINGS_UPDATE, label: 'Modifier cagnottes' },
    { value: Permissions.FUNDRAISINGS_DELETE, label: 'Supprimer cagnottes' },
    { value: Permissions.ASSOCIATION_UPDATE, label: 'Modifier association' },
    { value: Permissions.ASSOCIATION_REMOVE, label: 'Supprimer association' },
    { value: Permissions.STATISTICS_VIEW, label: 'Voir statistiques' },
  ];

  // Filtre les permissions déjà utilisées
  const availablePermissions = computed(() =>
    allPermissions.filter((perm) => !usedPermissions.value.includes(perm.value))
  );

  // Données du formulaire pour le composant Create
  const apiFormData = computed(() => ({
    permission: formData.permission,
    requiresSubscription: formData.requiresSubscription,
  }));

  async function handleBeforeSubmit(): Promise<boolean> {
    formSubmitted.value = true;

    if (!(await validateForm())) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return false;
    }

    return true;
  }

  // Charge les permissions déjà utilisées au montage
  onMounted(async () => {
    try {
      const response = await Database.getAll('permission-access');
      if (Array.isArray(response)) {
        usedPermissions.value = response.map((p) => p.permission);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des permissions utilisées:', err);
    }
  });
</script>
