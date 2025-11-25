<template>
  <Update
    v-if="item"
    :can-update-item="crmAccess.canUpdateMember"
    :fetch-item="item"
    :update-endpoint="`association/${associationId}/user/${id}`"
    :form-data="form"
  >
    <template #title>Modifier un membre</template>
    <template #form>
      <div class="space-y-4 p-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Rôle</label>
          <select
            v-model="form.roleId"
            class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full appearance-none rounded-md border px-3 py-2 text-sm capitalize focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option
              v-for="role in availableRoles"
              :key="role.id"
              :value="role.id"
              :selected="role.id === form.roleId"
              class="capitalize"
            >
              {{ role.name === 'owner' ? 'propriétaire' : role.name }}
            </option>
          </select>
        </div>
      </div>
    </template>
    <template #description>Modifiez les informations du membre ci-dessous.</template>
    <template #update-button>Mettre à jour</template>
  </Update>
</template>

<script setup lang="ts">
  import { Update as UpdateRaw } from '@/components/dashboard/crud';
  import { useCrmAccess } from '@/composables/crm-access';
  import type { Member } from '@/interfaces/member.interface';
  import type { Role } from '@/interfaces/roles.interface';
  import { useCrmStore } from '@/stores/crm';
  import Database from '@/utils/database.utils';
  import { computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';

  const Update = UpdateRaw<Member>;
  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const associationId = route.params.id as string;
  const id = route.params.itemId;
  const item = ref<Member | null>(null);

  if (!id || typeof id !== 'string') {
    console.error('No member ID provided in route parameters.');
  }

  const form = ref({
    roleId: '',
  });
  const roles = ref<Role[]>([]);

  const availableRoles = computed(() => {
    return roles.value.filter((role) => role.name !== 'owner');
  });

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
        form.value.roleId = response.role.id;
      }
    } catch (err) {
      console.error('Erreur lors du chargement du membre:', err);
    }
  }

  onMounted(async () => {
    await fetchRoles();
    await fetchMember();
  });
</script>
