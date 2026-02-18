<template>
  <section>
    <h2 class="font-title text-secondary mb-12 text-center text-2xl sm:text-3xl md:text-4xl">
      Nos tarifs
    </h2>

    <div
      class="mx-auto flex max-w-5xl flex-col items-center gap-24 px-4 lg:flex-row lg:items-stretch lg:justify-center"
    >
      <!-- Card Version Gratuite -->
      <div
        class="flex w-full max-w-100 flex-1 flex-col rounded-3xl bg-white p-8 shadow-lg sm:w-100"
      >
        <div class="bg-secondary mb-8 rounded-full px-6 py-3 text-center">
          <h3 class="font-title text-lg font-bold text-white uppercase">Version Gratuite</h3>
        </div>

        <ul class="mb-8 flex-1 space-y-4">
          <li
            v-for="feature in features.filter((f) => f.requiresSubscription !== undefined)"
            :key="feature.label"
            class="flex items-center gap-3"
          >
            <Check
              v-if="!feature.requiresSubscription"
              class="h-6 w-6 shrink-0 text-[#009B77]"
              :stroke-width="3"
            />
            <X v-else class="h-6 w-6 shrink-0 text-red-500" :stroke-width="3" />
            <span class="font-semibold text-black">{{ feature.label }}</span>
          </li>
        </ul>
        <router-link
          to="/create-association"
          class="border-primary text-primary hover:bg-primary h-12 cursor-pointer rounded-full border-2 px-6 py-3 text-center text-[15px] font-semibold transition-colors hover:text-white"
        >
          J'inscris mon association
        </router-link>
      </div>

      <!-- Card Version Premium -->
      <div
        class="ring-primary flex w-full max-w-100 flex-1 flex-col rounded-3xl p-8 shadow-xl ring-4 sm:w-100"
      >
        <div class="bg-primary mb-8 rounded-full px-6 py-3 text-center">
          <h3 class="font-title text-lg font-bold text-white uppercase">Version Premium</h3>
        </div>

        <ul class="mb-8 flex-1 space-y-4">
          <li
            v-for="feature in features.filter((f) => f.requiresSubscription !== undefined)"
            :key="feature.label"
            class="flex items-center gap-3"
          >
            <Check class="h-6 w-6 shrink-0 text-[#009B77]" :stroke-width="3" />
            <span class="font-semibold text-black">{{ feature.label }}</span>
          </li>
        </ul>

        <div class="mb-6 text-center">
          <p class="text-primary text-2xl font-bold sm:text-3xl lg:text-4xl">15€/mois</p>
        </div>

        <Dialog v-model:open="open" @update:open="handleDialogOpen">
          <DialogTrigger as-child>
            <Button
              class="bg-primary hover:bg-primary/90 h-12 cursor-pointer rounded-full px-6 py-3 text-[15px] font-semibold whitespace-nowrap text-white transition-colors"
            >
              Passer mon association en Premium
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Passer mon association en Premium</DialogTitle>
              <DialogDescription>
                Pour passer votre association en Premium, veuillez choisir parmis les associations
                dont vous êtes propriétaire.
              </DialogDescription>
            </DialogHeader>
            <div class="flex items-center gap-2">
              <div class="grid flex-1 gap-2">
                <label for="association-select" class="text-secondary text-xs sm:text-sm">
                  Choisir une association :
                </label>
                <select
                  id="association-select"
                  v-model="activeIndex"
                  class="border-input bg-background ring-offset-background focus-visible:ring-ring h-7 rounded-md border px-1.5 text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:h-8 sm:px-2 sm:text-sm"
                  @change="
                    typeof activeIndex === 'string' ? null : setSelectedAssociation(activeIndex)
                  "
                >
                  <option selected disabled value="">Sélectionnez une association</option>
                  <option
                    v-for="(assos, index) in userOwnedAssociations"
                    :key="assos.id"
                    :value="index"
                    class="font-title text-secondary"
                  >
                    {{ assos.association.name }}
                  </option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose as-child>
                <Button type="button" variant="destructive" class="cursor-pointer">Fermer</Button>
              </DialogClose>
              <Button
                v-if="selectedAssociation"
                type="button"
                variant="outline"
                class="cursor-pointer"
                @click="goToPremiumPayment"
              >
                Passer en premium
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { Check, X } from 'lucide-vue-next';
  import Database from '@/utils/database.utils';
  import { onMounted } from 'vue';
  import { ref } from 'vue';
  import { Permissions } from '@/enums/permissions';
  import type { PermissionAccess } from '@/interfaces/permission-access.interface';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
  } from '@/components/ui/dialog';
  import Button from '@/components/ui/button/Button.vue';
  import type { UserAssociation } from '@/interfaces';
  import { useAuthStore } from '@/stores/auth';
  import { useRouter } from 'vue-router';
  import { useToast } from 'vue-toastification';

  interface Feature {
    label: string;
    requiresSubscription?: boolean;
    permission: string;
  }

  const featuresList: Feature[] = [
    {
      label: 'Administration avancée des membres dans l’association',
      permission: 'registers',
    },
    {
      label: 'Pilotage intégral des annonces',
      permission: 'announcements',
    },
    {
      label: 'Organisation étendue des événements',
      permission: 'events',
    },
    {
      label: 'Accès aux statistiques avancées',
      permission: 'statistics',
    },
    {
      label: 'Contrôle total des campagnes de financement participatif',
      permission: 'fundraisings',
    },
    {
      label: 'Gestion complète des rôles au sein de l’association',
      permission: 'roles',
    },
  ];

  const authStore = useAuthStore();
  const router = useRouter();
  const toast = useToast();

  const userOwnedAssociations = ref<UserAssociation[]>([]);
  const selectedAssociation = ref<UserAssociation | null>(null);
  const open = ref(false);
  const activeIndex = ref<number | string>('');
  const features = ref<Feature[]>(featuresList);

  const setSelectedAssociation = (index: number) => {
    selectedAssociation.value = userOwnedAssociations.value[index] || null;
  };

  const fetchFeaturesPermissions = async () => {
    try {
      const response = await Database.getAll('permission-access');
      const permissionsValues = Object.values(Permissions).filter(
        (value) => value !== Permissions.ALL
      );
      permissionsValues.forEach((permission) => {
        const splitPermission = permission.split('_')[0] || permission;
        const feature = features.value.find((f) => f.permission === splitPermission);

        if (!feature) {
          return;
        }

        if (feature?.requiresSubscription !== true) {
          const findPermission = response.find(
            (p: PermissionAccess) => p.permission === permission
          );
          feature.requiresSubscription = findPermission
            ? findPermission.requiresSubscription
            : false;
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des tarifs :', error);
    }
  };

  const fetchUserOwnedAssociations = async () => {
    try {
      const response = await Database.getAll('users/me/owned-associations');
      userOwnedAssociations.value = response;
    } catch (error) {
      console.error('Erreur lors de la récupération des associations de l’utilisateur :', error);
    }
  };
  const goToPremiumPayment = () => {
    if (!selectedAssociation.value) {
      toast.error('Veuillez sélectionner une association');
      return;
    }

    router.push({
      name: 'PremiumPayment',
      params: { associationId: selectedAssociation.value.association.id },
    });
  };
  const handleDialogOpen = async () => {
    if (authStore.isAuthenticated() === false) {
      router.push({ name: 'Login' });
    }

    if (userOwnedAssociations.value.length === 0) {
      open.value = false;
      toast.info(
        "Vous devez être propriétaire d'au moins une association pour accéder à cette fonctionnalité."
      );
    }
  };

  onMounted(() => {
    fetchFeaturesPermissions();
    fetchUserOwnedAssociations();
  });
</script>
