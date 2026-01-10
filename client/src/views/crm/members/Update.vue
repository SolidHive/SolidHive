<template>
  <Update
    v-if="item"
    :can-update-item="crmAccess.canUpdateMember"
    :fetch-item="item"
    :update-endpoint="`association/${associationId}/user/${id}`"
    :form-data="formData"
    :on-before-submit="handleBeforeSubmit"
  >
    <template #title>Modifier un membre</template>
    <template #form>
      <div class="space-y-4 p-4">
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
              :selected="role.id === form.roleId.$value"
              class="capitalize"
            >
              {{ role.name === 'owner' ? 'propriétaire' : role.name }}
            </option>
          </template>
        </SelectForm>
      </div>
    </template>
    <template #description>Modifiez les informations du membre ci-dessous.</template>
    <template #update-button>Mettre à jour</template>
  </Update>
</template>

<script setup lang="ts">
  import { Update as UpdateRaw } from '@/components/dashboard/crud';
  import SelectForm from '@/components/form/SelectForm.vue';
  import { useCrmAccess } from '@/composables/crm-access';
  import type { Member } from '@/interfaces/member.interface';
  import type { Role } from '@/interfaces/roles.interface';
  import { useCrmStore } from '@/stores/crm';
  import Database from '@/utils/database.utils';
  import { memberCrmErrorMessages } from '@/utils/errors/crm/members';
  import { computed, onMounted, reactive, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { defineForm, field, isValidForm } from 'vue-yup-form';
  import * as yup from 'yup';
  import { useToast } from 'vue-toastification';

  const Update = UpdateRaw<Member>;
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const associationId = route.params.id as string;
  const id = route.params.itemId;
  const item = ref<Member | null>(null);
  const toast = useToast();
  const formSubmitted = ref(false);

  if (!id || typeof id !== 'string') {
    console.error('No member ID provided in route parameters.');
  }

  // Schéma de validation avec yup
  const form = defineForm({
    roleId: field('', yup.string().required(memberCrmErrorMessages.required.roleId)),
  });

  // Gestion des champs touchés
  const touchedFields = reactive({
    roleId: false,
  });

  const showError = (fieldName: keyof typeof touchedFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!form[fieldName].$error;

  const roles = ref<Role[]>([]);

  const availableRoles = computed(() => {
    return roles.value.filter((role) => role.name !== 'owner');
  });

  // Données du formulaire pour le composant Update
  const formData = computed(() => ({
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

  async function fetchMember(): Promise<void> {
    try {
      const response = await Database.getAll(`association/${associationId}/user/${id}`);
      item.value = response;
      if (response && response.role) {
        form.roleId.$value = response.role.id;
      }
    } catch (err) {
      console.error('Erreur lors du chargement du membre:', err);
    }
  }

  onMounted(async () => {
    await fetchRoles();
    await fetchMember();
  });

  // Réinitialiser les erreurs lors du chargement
  watch(item, () => {
    formSubmitted.value = false;
    Object.keys(touchedFields).forEach((key) => {
      touchedFields[key as keyof typeof touchedFields] = false;
    });
  });
</script>
