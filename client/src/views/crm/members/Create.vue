<template>
  <Create
    :can-create-item="crmAccess.canCreateMember"
    :create-endpoint="`association/${associationId}/user`"
    :form-data="formData"
    :on-before-submit="handleBeforeSubmit"
  >
    <template #title>Inviter un membre</template>
    <template #form>
      <div class="space-y-4 p-4">
        <InputForm
          v-model="form.email.$value"
          input-name="member-email"
          type="email"
          placeholder="exemple@email.com"
          :error-message="form.email.$error?.message || ''"
          :error-state="showError('email')"
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
          v-model="form.roleId.$value"
          input-name="member-role"
          placeholder="Sélectionnez un rôle"
          :error-message="form.roleId.$error?.message || ''"
          :error-state="showError('roleId')"
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
  import { memberCrmErrorMessages } from '@/utils/errors/crm/members';
  import { computed, onMounted, reactive, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { defineForm, field, isValidForm } from 'vue-yup-form';
  import * as yup from 'yup';
  import { useToast } from 'vue-toastification';

  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const associationId = route.params.id as string;
  const toast = useToast();
  const formSubmitted = ref(false);

  // Schéma de validation avec yup
  const form = defineForm({
    email: field(
      '',
      yup
        .string()
        .required(memberCrmErrorMessages.required.email)
        .email(memberCrmErrorMessages.format.email)
    ),
    roleId: field('', yup.string().required(memberCrmErrorMessages.required.roleId)),
  });

  // Gestion des champs touchés
  const touchedFields = reactive({
    email: false,
    roleId: false,
  });

  const showError = (fieldName: keyof typeof touchedFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!form[fieldName].$error;

  const roles = ref<Role[]>([]);

  const availableRoles = computed(() => {
    return roles.value.filter((role) => role.name !== 'owner');
  });

  // Données du formulaire pour le composant Create
  const formData = computed(() => ({
    email: form.email.$value,
    roleId: form.roleId.$value,
  }));

  async function handleBeforeSubmit(): Promise<boolean> {
    formSubmitted.value = true;

    if (!(await isValidForm(form))) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return false;
    }

    return true;
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
</script>
