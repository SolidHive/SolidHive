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

        <button
          class="border-primary text-primary hover:bg-primary rounded-full border-2 px-6 py-3 font-semibold transition-colors hover:text-white"
        >
          J'inscris mon association
        </button>
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
          <p class="text-primary text-2xl font-bold sm:text-3xl lg:text-4xl">14,99€/mois</p>
        </div>

        <button
          class="bg-primary hover:bg-primary/90 rounded-full px-6 py-3 font-semibold text-white transition-colors"
        >
          Mettre mon association en Premium
        </button>
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

  const features = ref<Feature[]>(featuresList);

  const fetchFeaturesPermissions = async () => {
    try {
      const response = await Database.getAll('permission-access');
      console.log(response);
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

  onMounted(() => {
    fetchFeaturesPermissions();
  });
</script>
