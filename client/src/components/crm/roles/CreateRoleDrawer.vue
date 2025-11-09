<template>
  <Drawer v-model:open="isOpen">
    <DrawerContent>
      <div class="overflow-auto">
        <div class="mx-auto w-full max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>Créer un nouveau rôle</DrawerTitle>
            <DrawerDescription>
              Définissez le nom, la description et les permissions pour ce nouveau rôle.
            </DrawerDescription>
          </DrawerHeader>
          <div class="space-y-4 overflow-y-auto p-4">
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
                    id="perm-all"
                    v-model="selectAll"
                    type="checkbox"
                    class="border-input bg-background ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:ring-2 focus-visible:ring-offset-2"
                    @change="toggleSelectAll"
                  />
                  <label for="perm-all" class="text-sm font-medium">
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
                        :id="`perm-${permission.value}`"
                        v-model="roleForm.permissions"
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
          <DrawerFooter>
            <button
              :disabled="
                !roleForm.name || (!selectAll && roleForm.permissions.length === 0) || isLoading
              "
              class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              @click="handleCreate"
            >
              {{ isLoading ? 'Création...' : 'Créer le rôle' }}
            </button>
            <DrawerClose as-child>
              <button
                class="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                @click="resetForm"
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
  import { ref, computed } from 'vue';
  import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
  } from '@/components/ui/drawer';
  import { Permissions } from '@/enums/permissions';
  import Database from '@/utils/database.utils';
  import { useToast } from 'vue-toastification';

  const props = defineProps<{
    open: boolean;
    associationId: string;
  }>();

  const emit = defineEmits<{
    'update:open': [value: boolean];
    'role-created': [];
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

  async function handleCreate() {
    try {
      isLoading.value = true;

      const permissions = selectAll.value ? [Permissions.ALL] : roleForm.value.permissions;

      await Database.create(`association/${props.associationId}/roles`, {
        name: roleForm.value.name,
        description: roleForm.value.description || undefined,
        permissions,
      });

      toast.success('Rôle créé avec succès !');
      isOpen.value = false;
      resetForm();
      emit('role-created');
    } catch (err: any) {
      console.error('Erreur lors de la création du rôle:', err);
      const errorMessage = err?.response?.data?.message || 'Erreur lors de la création du rôle.';
      toast.error(errorMessage);
    } finally {
      isLoading.value = false;
    }
  }

  function resetForm() {
    roleForm.value = {
      name: '',
      description: '',
      permissions: [],
    };
    selectAll.value = false;
  }
</script>
