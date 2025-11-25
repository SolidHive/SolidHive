<template>
  <Create
    :can-create-item="crmAccess.canCreateMember"
    :create-endpoint="`association/${associationId}/user`"
    :form-data="form"
  >
    <template #title>Inviter un membre</template>
    <template #form>
      <div class="space-y-4 p-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="exemple@email.com"
            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Rôle</label>
          <select
            v-model="form.roleId"
            class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full appearance-none rounded-md border px-3 py-2 text-sm capitalize focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>Sélectionnez un rôle</option>
            <option
              v-for="role in availableRoles"
              :key="role.id"
              :value="role.id"
              class="capitalize"
            >
              {{ role.name === 'owner' ? 'propriétaire' : role.name }}
            </option>
          </select>
        </div>
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
  import { useCrmAccess } from '@/composables/crm-access';
  import type { Role } from '@/interfaces/roles.interface';
  import { useCrmStore } from '@/stores/crm';
  import Database from '@/utils/database.utils';
  import { computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';

  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const associationId = route.params.id as string;

  const form = ref({
    email: '',
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

  onMounted(() => {
    fetchRoles();
  });
</script>
