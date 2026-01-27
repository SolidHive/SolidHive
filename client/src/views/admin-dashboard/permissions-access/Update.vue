<template>
  <Update
    :can-update-item="true"
    :fetch-item="`permission-access/${permission}`"
    :update-endpoint="`permission-access/${permissionId}`"
    :form-data="apiFormData"
    :on-before-submit="handleBeforeSubmit"
  >
    <template #title>Modifier la permission d'accès</template>
    <template #form>
      <div class="space-y-4 p-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Permission</label>
          <div class="bg-muted text-muted-foreground rounded-md border px-3 py-2 text-sm">
            {{ formatPermissionLabel(formData.permission) }}
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <InputForm
              :model-value="formData.requiresSubscription"
              type="checkbox"
              input-name="edit-requires-subscription"
              :input-class="'border-input bg-background ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:ring-2 focus-visible:ring-offset-2'"
              @update:model-value="formData.requiresSubscription = $event"
              @change="() => (touchedFields.requiresSubscription = true)"
            />
            <label for="edit-requires-subscription" class="text-sm font-medium">
              Nécessite un abonnement premium
            </label>
          </div>
        </div>
      </div>
    </template>
    <template #description>Modifiez la permission et son niveau d'accès.</template>
  </Update>
</template>

<script setup lang="ts">
  import { Update as UpdateRaw } from '@/components/dashboard/crud';
  import InputForm from '@/components/form/InputForm.vue';
  import type { PermissionAccess } from '@/interfaces/permission-access.interface';
  import Database from '@/utils/database.utils';
  import { formatPermissionLabel } from '@/utils/permissions.utils';
  import { computed, onMounted, reactive, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useToast } from 'vue-toastification';
  import { updatePermissionAccessValidationSchema } from '@/utils/errors/admin/permissions-access';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';

  const Update = UpdateRaw<PermissionAccess>;
  const route = useRoute();
  const permission = route.params.itemId; // itemId contient la permission (enum)
  const toast = useToast();
  const formSubmitted = ref(false);
  const permissionId = ref<string>(''); // Stocke l'UUID pour l'update

  if (!permission || typeof permission !== 'string') {
    console.error('No permission provided in route parameters.');
  }

  // États du formulaire
  const formData = reactive({
    permission: '',
    requiresSubscription: false,
  });

  const validationErrors = reactive({
    requiresSubscription: '',
  });

  // Gestion des champs touchés
  const touchedFields = reactive({
    requiresSubscription: false,
  });

  const validateForm = async () => {
    const result = await validateWithYup(updatePermissionAccessValidationSchema as any, formData);

    if (result.isValid) {
      clearValidationErrors(validationErrors);
    } else {
      Object.assign(validationErrors, result.errors);
    }

    return result.isValid;
  };

  // Données du formulaire pour le composant Update
  const apiFormData = computed(() => ({
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

  async function fetchPermissionAccess(): Promise<void> {
    try {
      const response = await Database.getAll(`permission-access/${permission}`);
      if (response) {
        permissionId.value = response.id; // Stocke l'UUID pour l'update
        formData.permission = response.permission || '';
        formData.requiresSubscription = response.requiresSubscription || false;
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la permission:', err);
    }
  }

  onMounted(async () => {
    await fetchPermissionAccess();
  });
</script>
