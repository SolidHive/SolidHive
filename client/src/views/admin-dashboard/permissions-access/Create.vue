<template>
  <CrudCreate
    :can-create-item="true"
    :create-endpoint="`permission-access`"
    :form-data="formData"
    :on-before-submit="handleBeforeSubmit"
  >
    <template #title>Créer une nouvelle permission d'accès</template>
    <template #form>
      <div class="space-y-4 p-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">
            Permission
            <span class="text-destructive">*</span>
          </label>
          <select
            v-model="form.permission.$value"
            class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            :class="showError('permission') ? 'border-destructive' : ''"
            @blur="() => (touchedFields.permission = true)"
          >
            <option value="">Sélectionnez une permission</option>
            <option v-for="perm in availablePermissions" :key="perm.value" :value="perm.value">
              {{ perm.label }}
            </option>
          </select>
          <p v-if="showError('permission')" class="text-destructive text-sm">
            {{ form.permission.$error?.message || '' }}
          </p>
        </div>

        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <input
              id="requires-subscription"
              v-model="form.requiresSubscription.$value"
              type="checkbox"
              class="border-input bg-background ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:ring-2 focus-visible:ring-offset-2"
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
  import { Permissions } from '@/enums/permissions';
  import Database from '@/utils/database.utils';
  import { computed, onMounted, reactive, ref } from 'vue';
  import { defineForm, field, isValidForm } from 'vue-yup-form';
  import * as yup from 'yup';
  import { useToast } from 'vue-toastification';

  const toast = useToast();
  const formSubmitted = ref(false);
  const usedPermissions = ref<string[]>([]);

  // Schéma de validation avec yup
  const form = defineForm({
    permission: field('', yup.string().required('La permission est requise')),
    requiresSubscription: field(false, yup.boolean()),
  });

  // Gestion des champs touchés
  const touchedFields = reactive({
    permission: false,
    requiresSubscription: false,
  });

  const showError = (fieldName: keyof typeof touchedFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!form[fieldName].$error;

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
  ];

  // Filtre les permissions déjà utilisées
  const availablePermissions = computed(() =>
    allPermissions.filter((perm) => !usedPermissions.value.includes(perm.value))
  );

  // Données du formulaire pour le composant Create
  const formData = computed(() => ({
    permission: form.permission.$value,
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
