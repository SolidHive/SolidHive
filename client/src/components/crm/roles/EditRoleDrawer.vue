<template>
  <Drawer v-model:open="isOpen">
    <DrawerContent>
      <div class="overflow-auto">
        <div class="mx-auto w-full max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>Modifier le rôle</DrawerTitle>
            <DrawerDescription>
              Modifiez le nom, la description et les permissions du rôle
              <strong class="capitalize">{{ role?.name }}</strong>
              .
            </DrawerDescription>
          </DrawerHeader>
          <div class="space-y-4 p-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Nom du rôle *</label>
              <input
                v-model="roleForm.name"
                type="text"
                placeholder="Ex: Trésorier, Secrétaire..."
                class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Description</label>
              <textarea
                v-model="roleForm.description"
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
                    id="edit-perm-all"
                    v-model="selectAll"
                    type="checkbox"
                    class="border-input bg-background ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:ring-2 focus-visible:ring-offset-2"
                    @change="toggleSelectAll"
                  />
                  <label for="edit-perm-all" class="text-sm font-medium">
                    Toutes les permissions (*)
                  </label>
                </div>
                <div class="border-input rounded-md border p-3">
                  <div class="grid grid-cols-2 gap-2">
                    <div
                      v-for="permission in availablePermissions"
                      :key="permission.value"
                      class="flex items-center space-x-2"
                    >
                      <input
                        :id="`edit-perm-${permission.value}`"
                        v-model="roleForm.permissions"
                        type="checkbox"
                        :value="permission.value"
                        :disabled="selectAll"
                        class="border-input bg-background ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <label
                        :for="`edit-perm-${permission.value}`"
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
          <DrawerFooter>
            <button
              :disabled="
                !roleForm.name || (!selectAll && roleForm.permissions.length === 0) || isLoading
              "
              class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              @click="handleEdit"
            >
              {{ isLoading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
            <DrawerClose as-child>
              <button
                class="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                Annuler
              </button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
  } from '@/components/ui/drawer';
  import type { Role } from '@/interfaces/roles.interface';
  import { Permissions } from '@/enums/permissions';
  import Database from '@/utils/database.utils';
  import { useToast } from 'vue-toastification';

  const props = defineProps<{
    open: boolean;
    role: Role | null;
    associationId: string;
    canUpdateRole: boolean;
  }>();

  const emit = defineEmits<{
    'update:open': [value: boolean];
    'role-updated': [];
  }>();

  const toast = useToast();
  const isLoading = ref(false);
  const selectAll = ref(false);

  const roleForm = ref({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const isOpen = computed({
    get: () => props.open,
    set: (value) => emit('update:open', value),
  });

  const availablePermissions = computed(() => {
    const permissions = Object.entries(Permissions)
      .filter(([_, value]) => value !== Permissions.ALL)
      .map(([key, value]) => ({
        label: formatPermissionLabel(key),
        value: value,
      }));
    return permissions;
  });

  watch(
    () => props.role,
    (newRole) => {
      if (newRole) {
        roleForm.value.name = newRole.name;
        roleForm.value.description = newRole.description || '';

        if (newRole.permissions.includes(Permissions.ALL)) {
          selectAll.value = true;
          roleForm.value.permissions = [];
        } else {
          selectAll.value = false;
          roleForm.value.permissions = [...newRole.permissions];
        }
      }
    },
    { immediate: true }
  );

  function formatPermissionLabel(key: string): string {
    return key
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function toggleSelectAll() {
    if (selectAll.value) {
      roleForm.value.permissions = [];
    }
  }

  async function handleEdit() {
    if (!props.canUpdateRole) {
      toast.error("Vous n'avez pas la permission de modifier ce rôle.");
      return;
    }

    try {
      isLoading.value = true;

      if (!props.role) {
        console.error('Aucun rôle sélectionné pour la modification.');
        return;
      }

      const permissions = selectAll.value ? [Permissions.ALL] : roleForm.value.permissions;

      await Database.patch(`association/${props.associationId}/roles/${props.role.id}`, {
        name: roleForm.value.name,
        description: roleForm.value.description || undefined,
        permissions,
      });

      toast.success('Rôle modifié avec succès !');
      isOpen.value = false;
      emit('role-updated');
    } catch (err: any) {
      console.error('Erreur lors de la modification du rôle:', err);
      const errorMessage =
        err?.response?.data?.message || 'Erreur lors de la modification du rôle.';
      toast.error(errorMessage);
    } finally {
      isLoading.value = false;
    }
  }
</script>
