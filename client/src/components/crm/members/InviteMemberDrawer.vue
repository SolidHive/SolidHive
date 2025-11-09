<template>
  <Drawer v-if="canInviteMember" v-model:open="isOpen">
    <DrawerContent>
      <div class="overflow-auto">
        <div class="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Inviter un membre</DrawerTitle>
            <DrawerDescription>
              Envoyez une invitation à un nouveau membre pour rejoindre votre association.
            </DrawerDescription>
          </DrawerHeader>
          <div class="space-y-4 p-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Email</label>
              <input
                v-model="inviteForm.email"
                type="email"
                placeholder="exemple@email.com"
                class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Rôle</label>
              <select
                v-model="inviteForm.role"
                class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full appearance-none rounded-md border px-3 py-2 text-sm capitalize focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>Sélectionnez un rôle</option>
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
              :disabled="!inviteForm.email || !inviteForm.role || isLoading"
              class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              @click="handleInvite"
            >
              {{ isLoading ? 'Envoi...' : "Envoyer l'invitation" }}
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
  import type { Role } from '@/interfaces/roles.interface';
  import Database from '@/utils/database.utils';
  import { useToast } from 'vue-toastification';

  const props = defineProps<{
    open: boolean;
    roles: Role[];
    associationId: string | string[];
    canInviteMember: boolean;
  }>();

  const emit = defineEmits<{
    'update:open': [value: boolean];
    'member-invited': [];
  }>();

  const toast = useToast();
  const isLoading = ref(false);

  const inviteForm = ref({
    email: '',
    role: '',
  });

  const isOpen = computed({
    get: () => props.open,
    set: (value) => emit('update:open', value),
  });

  const availableRoles = computed(() => {
    return props.roles.filter((role) => role.name !== 'owner');
  });

  async function handleInvite() {
    try {
      isLoading.value = true;

      const selectedRole = props.roles.find((role) => role.name === inviteForm.value.role);

      if (!selectedRole) {
        toast.error('Rôle invalide.');
        return;
      }

      await Database.create(`association/${props.associationId}/user`, {
        email: inviteForm.value.email,
        roleId: selectedRole.id,
      });

      toast.success('Invitation envoyée avec succès !');
      isOpen.value = false;
      resetForm();
      emit('member-invited');
    } catch (err: any) {
      console.error("Erreur lors de l'envoi de l'invitation:", err);
      const errorMessage =
        err?.response?.data?.message || "Erreur lors de l'envoi de l'invitation.";
      toast.error(errorMessage);
    } finally {
      isLoading.value = false;
    }
  }

  function resetForm() {
    inviteForm.value = {
      email: '',
      role: '',
    };
  }
</script>
