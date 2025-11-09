<template>
  <Drawer v-model:open="isOpen">
    <DrawerContent>
      <div class="mx-auto w-full max-w-sm">
        <DrawerHeader>
          <DrawerTitle>Modifier le rôle du membre</DrawerTitle>
          <DrawerDescription>
            Modifiez le rôle
            <strong>
              {{ member?.role.name === 'owner' ? 'propriétaire' : member?.role.name }}
            </strong>
            du membre {{ member?.user.name }}
            {{ member?.user.firstname }}
          </DrawerDescription>
        </DrawerHeader>
        <div class="space-y-4 p-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Rôle</label>
            <select
              v-model="editForm.role"
              class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full appearance-none rounded-md border px-3 py-2 text-sm capitalize focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option
                v-for="role in availableRoles"
                :key="role.id"
                :value="role.name"
                class="capitalize"
              >
                {{ role.name === 'owner' ? 'propriétaire' : role.name }}
              </option>
            </select>
          </div>
        </div>
        <DrawerFooter>
          <button
            :disabled="isLoading"
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
  import type { Member } from '@/interfaces/member.interface';
  import type { Role } from '@/interfaces/roles.interface';
  import Database from '@/utils/database.utils';
  import { useToast } from 'vue-toastification';

  const props = defineProps<{
    open: boolean;
    member: Member | null;
    roles: Role[];
    associationId: string | string[];
    canUpdateMember: boolean;
  }>();

  const emit = defineEmits<{
    'update:open': [value: boolean];
    'member-updated': [];
  }>();

  const toast = useToast();
  const isLoading = ref(false);

  const editForm = ref({
    role: '',
  });

  const isOpen = computed({
    get: () => props.open,
    set: (value) => emit('update:open', value),
  });

  const availableRoles = computed(() => {
    return props.roles.filter(
      (role) => role.name !== props.member?.role.name && role.name !== 'owner'
    );
  });

  watch(
    () => props.member,
    (newMember) => {
      if (newMember) {
        editForm.value.role = newMember.role.name;
      }
    },
    { immediate: true }
  );

  async function handleEdit() {
    try {
      isLoading.value = true;

      if (!props.member) {
        console.error('Aucun membre sélectionné pour la modification.');
        return;
      }

      const newRole = props.roles.find((role) => role.name === editForm.value.role);

      if (!newRole) {
        console.error('Rôle non trouvé:', editForm.value.role);
        return;
      }

      const memberId: string = props.member.id;
      const roleId: string = newRole.id;

      await Database.patch(`association/${props.associationId}/user/${memberId}`, {
        roleId,
      });

      toast.success(
        `Le rôle du membre a été mis à jour avec succès.\nNouveau rôle : ${newRole.name}`
      );
      isOpen.value = false;
      emit('member-updated');
    } catch (err) {
      toast.error('Erreur lors de la modification du membre.');
      console.error('Erreur lors de la modification du membre:', err);
    } finally {
      isLoading.value = false;
    }
  }
</script>
