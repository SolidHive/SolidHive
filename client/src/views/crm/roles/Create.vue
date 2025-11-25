<template>
  <CrudCreate
    :can-create-item="crmAccess.canCreateRole"
    :create-endpoint="`association/${associationId}/roles`"
    :form-data="form"
  >
    <template #title>Créer un nouveau rôle</template>
    <template #form>
      <div class="space-y-4 p-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Nom du rôle *</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Ex: Trésorier, Secrétaire..."
            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Description</label>
          <textarea
            v-model="form.description"
            placeholder="Décrivez les responsabilités de ce rôle..."
            rows="3"
            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Permissions *</label>
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <input
                id="perm-all"
                v-model="selectAll"
                type="checkbox"
                class="border-input bg-background ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:ring-2 focus-visible:ring-offset-2"
                @change="toggleSelectAll"
              />
              <label for="perm-all" class="text-sm font-medium">Toutes les permissions (*)</label>
            </div>
            <div class="border-input rounded-md border p-3">
              <div class="grid grid-cols-2 gap-2">
                <div
                  v-for="permission in availablePermissions"
                  :key="permission.value"
                  class="flex items-center space-x-2"
                >
                  <input
                    :id="`perm-${permission.value}`"
                    v-model="form.permissions"
                    type="checkbox"
                    :value="permission.value"
                    :disabled="selectAll"
                    class="border-input bg-background ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <label
                    :for="`perm-${permission.value}`"
                    class="text-sm"
                    :class="selectAll ? 'opacity-50' : ''"
                  >
                    {{ permission.label }}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #description>
      Définissez le nom, la description et les permissions pour ce nouveau rôle.
    </template>
  </CrudCreate>
</template>

<script setup lang="ts">
  import { Create as CrudCreate } from '@/components/dashboard/crud';
  import { useCrmAccess } from '@/composables/crm-access';
  import { Permissions } from '@/enums/permissions';
  import { useCrmStore } from '@/stores/crm';
  import { ref, watch } from 'vue';
  import { useRoute } from 'vue-router';

  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const associationId = route.params.id as string;

  const form = ref({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const selectAll = ref(false);

  const availablePermissions = [
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
  ];

  function toggleSelectAll() {
    if (selectAll.value) {
      form.value.permissions = ['*'];
    } else {
      form.value.permissions = [];
    }
  }

  watch(
    () => form.value.permissions,
    (newPerms) => {
      if (newPerms.includes('*')) {
        selectAll.value = true;
      } else if (selectAll.value && newPerms.length === 0) {
        selectAll.value = false;
      }
    }
  );
</script>
