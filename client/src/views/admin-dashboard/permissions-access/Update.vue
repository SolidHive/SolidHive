<template>
  <Update
    :can-update-item="true"
    :fetch-item="`permission-access/${permission}`"
    :update-endpoint="`permission-access/${permissionId}`"
    :form-data="formData"
    :on-before-submit="handleBeforeSubmit"
  >
    <template #title>Modifier la permission d'accès</template>
    <template #form>
      <div class="space-y-4 p-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Permission</label>
          <div class="bg-muted text-muted-foreground rounded-md border px-3 py-2 text-sm">
            {{ formatPermissionLabel(form.permission.$value) }}
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <input
              id="edit-requires-subscription"
              v-model="form.requiresSubscription.$value"
              type="checkbox"
              class="border-input bg-background ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:ring-2 focus-visible:ring-offset-2"
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
  import type { PermissionAccess } from '@/interfaces/permission-access.interface';
  import Database from '@/utils/database.utils';
  import { formatPermissionLabel } from '@/utils/permissions.utils';
  import { computed, onMounted, reactive, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { defineForm, field, isValidForm } from 'vue-yup-form';
  import * as yup from 'yup';
  import { useToast } from 'vue-toastification';

  const Update = UpdateRaw<PermissionAccess>;
  const route = useRoute();
  const permission = route.params.itemId; // itemId contient la permission (enum)
  const toast = useToast();
  const formSubmitted = ref(false);
  const permissionId = ref<string>(''); // Stocke l'UUID pour l'update

  if (!permission || typeof permission !== 'string') {
    console.error('No permission provided in route parameters.');
  }

  // Schéma de validation avec yup
  const form = defineForm({
    permission: field('', yup.string()), // Juste pour stocker la valeur, pas de validation car non modifiable
    requiresSubscription: field(false, yup.boolean()),
  });

  // Gestion des champs touchés
  const touchedFields = reactive({
    requiresSubscription: false,
  });

  // Données du formulaire pour le composant Update
  const formData = computed(() => ({
    requiresSubscription: form.requiresSubscription.$value,
  }));

  async function handleBeforeSubmit(): Promise<boolean> {
    formSubmitted.value = true;

    if (!(await isValidForm(form))) {
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
        form.permission.$value = response.permission || '';
        form.requiresSubscription.$value = response.requiresSubscription || false;
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la permission:', err);
    }
  }

  onMounted(async () => {
    await fetchPermissionAccess();
  });
</script>
