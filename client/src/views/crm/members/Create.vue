<template>
  <Create
    :can-create-item="crmAccess.canCreateMember"
    :create-endpoint="`association/${associationId}/user`"
    :form-data="apiFormData"
    :on-before-submit="handleBeforeSubmit"
    @after-create="handleAfterCreate"
    @error="handleError"
  >
    <template #title>Inviter un membre</template>
    <template #form>
      <div class="space-y-4 p-4">
        <InputForm
          v-model="formData.email"
          input-name="member-email"
          type="email"
          placeholder="exemple@email.com"
          :error-message="getErrorMessage('email')"
          :error-state="showError('email')"
          @input="clearValidationErrors(validationErrors, 'email')"
          @blur="() => (touchedFields.email = true)"
        >
          <template #label>
            Email
            <span class="text-destructive">*</span>
          </template>
          <template #hint>
            L'utilisateur recevra une invitation par email pour rejoindre l'association
          </template>
        </InputForm>

        <SelectForm
          v-model="formData.roleId"
          input-name="member-role"
          placeholder="Sélectionnez un rôle"
          :error-message="getErrorMessage('roleId')"
          :error-state="showError('roleId')"
          @input="clearValidationErrors(validationErrors, 'roleId')"
          @blur="() => (touchedFields.roleId = true)"
        >
          <template #label>
            Rôle
            <span class="text-destructive">*</span>
          </template>
          <template #options>
            <option
              v-for="role in availableRoles"
              :key="role.id"
              :value="role.id"
              class="capitalize"
            >
              {{ role.name === 'owner' ? 'propriétaire' : role.name }}
            </option>
          </template>
        </SelectForm>
      </div>
    </template>
    <template #description>
      Remplissez le formulaire ci-dessous pour inviter un nouveau membre à rejoindre l'association.
    </template>
    <template #create-button>Inviter</template>
  </Create>
</template>

<script setup lang="ts">
  import { Create } from '@/components/dashboard/crud';
  import InputForm from '@/components/form/InputForm.vue';
  import SelectForm from '@/components/form/SelectForm.vue';
  import { useCrmAccess } from '@/composables/crm-access';
  import type { Role } from '@/interfaces/roles.interface';
  import { useCrmStore } from '@/stores/crm';
  import Database from '@/utils/database.utils';
  import { computed, onBeforeMount, onMounted, reactive, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { createMemberValidationSchema } from '@/utils/errors/crm/members';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';
  import { useToast } from 'vue-toastification';
  import { Permissions } from '@/enums/permissions';
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

  // États du formulaire
  const formData = reactive({
    email: '',
    roleId: '',
  });

  const validationErrors = reactive({
    email: '',
    roleId: '',
  });

  // Gestion des champs touchés
  const touchedFields = reactive({
    email: false,
    roleId: false,
  });

  const showError = (fieldName: keyof typeof touchedFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!validationErrors[fieldName];

  const getErrorMessage = (fieldName: keyof typeof touchedFields) =>
    touchedFields[fieldName] || formSubmitted.value ? validationErrors[fieldName] || '' : '';

  const validateForm = async () => {
    const result = await validateWithYup(createMemberValidationSchema as any, formData);

    if (result.isValid) {
      clearValidationErrors(validationErrors);
    } else {
      Object.assign(validationErrors, result.errors);
    }

    return result.isValid;
  };

  const roles = ref<Role[]>([]);

  const availableRoles = computed(() => {
    return roles.value.filter((role) => role.name !== 'owner');
  });

  // Données du formulaire pour le composant Create
  const apiFormData = computed(() => ({
    email: formData.email,
    roleId: formData.roleId,
  }));

  async function handleBeforeSubmit(): Promise<boolean> {
    formSubmitted.value = true;

    if (!(await validateForm())) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return false;
    }

    return true;
  }

  async function handleAfterCreate(_createdItem: any): Promise<void> {
    toast.success('Membre invité avec succès !');
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

  async function fetchRoles(): Promise<void> {
    try {
      const response = await Database.getAll(`association/${associationId}/roles`);
      roles.value = response;
    } catch (err) {
      console.error('Erreur lors du chargement des rôles:', err);
      roles.value = [];
    }
  }

  onMounted(() => {
    fetchRoles();
  });

  onBeforeMount(async () => {
    const hasPremiumAccess = await crmPremiumAccess.hasAccessToPremiumFeatures(
      Permissions.REGISTERS_CREATE
    );

    if (!hasPremiumAccess) {
      router.push({
        name: 'CRMPremiumRequired',
        params: { id: route.params.id },
      });
      return;
    }

    if (!crmAccess.canCreateMember) {
      router.push('/unauthorized');
      return;
    }
  });
</script>
