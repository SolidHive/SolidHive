<template>
  <Update
    v-if="item"
    :can-update-item="crmAccess.canUpdateMember"
    :fetch-item="item"
    :update-endpoint="`association/${associationId}/user/${id}`"
    :form-data="apiFormData"
    :on-before-submit="handleBeforeSubmit"
    @after-update="handleAfterUpdate"
  >
    <template #title>Modifier un membre</template>
    <template #form>
      <div class="space-y-4 p-4">
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
              :selected="role.id === formData.roleId"
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
  import { computed, onBeforeMount, onMounted, reactive, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { updateMemberValidationSchema } from '@/utils/errors/crm/members';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';
  import { useToast } from 'vue-toastification';
  import { Permissions } from '@/enums/permissions';
  import { useCrmPremiumAccess } from '@/composables/crm-premium';

  const Update = UpdateRaw<Member>;
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const crmPremiumAccess = useCrmPremiumAccess(crmStore.associationPremiumUntil);
  const router = useRouter();
  const associationId = route.params.id as string;
  const id = route.params.itemId;
  const item = ref<Member | null>(null);
  const toast = useToast();
  const formSubmitted = ref(false);

  if (!id || typeof id !== 'string') {
    console.error('No member ID provided in route parameters.');
  }

  // États du formulaire
  const formData = reactive({
    roleId: '',
  });

  const validationErrors = reactive({
    roleId: '',
  });

  // Gestion des champs touchés
  const touchedFields = reactive({
    roleId: false,
  });

  const showError = (fieldName: keyof typeof touchedFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!validationErrors[fieldName];

  const getErrorMessage = (fieldName: keyof typeof touchedFields) =>
    touchedFields[fieldName] || formSubmitted.value ? validationErrors[fieldName] || '' : '';

  const validateForm = async () => {
    const result = await validateWithYup(updateMemberValidationSchema as any, formData);

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

  // Données du formulaire pour le composant Update
  const apiFormData = computed(() => ({
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

  async function handleAfterUpdate(): Promise<void> {
    toast.success('Membre mis à jour avec succès');
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
        formData.roleId = response.role.id;
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

  onBeforeMount(async () => {
    const hasPremiumAccess = await crmPremiumAccess.hasAccessToPremiumFeatures(
      Permissions.REGISTERS_UPDATE
    );

    if (!hasPremiumAccess) {
      router.push({
        name: 'CRMPremiumRequired',
        params: { id: route.params.id },
      });
      return;
    }

    if (!crmAccess.canUpdateMember) {
      router.push('/unauthorized');
      return;
    }
  });
</script>
