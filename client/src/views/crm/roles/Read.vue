<template>
  <Read
    :table-headers="tableHeaders"
    :fetch-items="`association/${associationId}/roles`"
    :can-create-items="crmAccess.canCreateRole"
    :can-update-items="crmAccess.canUpdateRole"
    :can-delete-items="crmAccess.canRemoveRole"
    :can-modify-specific-item="(item: Role) => item.name !== 'owner'"
    create-route-name="CRMRolesCreate"
    update-route-name="CRMRolesUpdate"
    delete-route-name="CRMRolesDelete"
  >
    <template #header>Rôles</template>
    <template #add-button>Créer un rôle</template>
    <template #table-row="{ name, description, permissions }">
      <TableCell class="font-medium">
        <div class="capitalize">{{ name }}</div>
      </TableCell>
      <TableCell>
        <div v-if="description" class="text-muted-foreground text-sm">
          {{ description }}
        </div>
        <div v-else class="text-muted-foreground">N/A</div>
      </TableCell>
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <span
                class="inline-flex cursor-help items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800"
              >
                {{ permissions.length }} permission{{ permissions.length > 1 ? 's' : '' }}
              </span>
            </TooltipTrigger>
            <TooltipContent
              class="max-w-xs bg-blue-100 [&>span>svg]:bg-blue-100 [&>span>svg]:fill-blue-100"
            >
              <div class="space-y-1">
                <ul class="list-inside list-disc space-y-0.5 text-xs text-blue-800">
                  <li v-for="permission in permissions" :key="permission">
                    {{ formatPermissionLabel(permission) }}
                  </li>
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </template>
  </Read>
  <router-view />
</template>

<script setup lang="ts">
  import { onBeforeMount } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useCrmStore } from '@/stores/crm';
  import { TableCell } from '@/components/ui/table';
  import { useCrmAccess } from '@/composables/crm-access';
  import { Read } from '@/components/dashboard/crud';
  import type { Role } from '@/interfaces/roles.interface';
  import { formatPermissionLabel } from '@/utils/permissions.utils';
  import {
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    Tooltip,
  } from '@/components/ui/tooltip';
  import type { TableHeader } from '@/interfaces/table-header.interface';
  import { Permissions } from '@/enums/permissions';
  import { useCrmPremiumAccess } from '@/composables/crm-premium';

  const tableHeaders: TableHeader<Role>[] = [
    { text: 'Nom', sortKey: 'name' },
    { text: 'Description' },
    { text: 'Permissions' },
  ];

  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const router = useRouter();
  const crmPremiumAccess = useCrmPremiumAccess(crmStore.associationPremiumUntil);
  const associationId = route.params.id as string;

  onBeforeMount(async () => {
    const hasPremiumAccess = await crmPremiumAccess.hasAccessToPremiumFeatures(
      Permissions.ROLES_VIEW
    );

    if (!hasPremiumAccess) {
      router.push({
        name: 'CRMPremiumRequired',
        params: {
          id: route.params.id,
        },
      });
      return;
    }

    if (!crmAccess.canAccessToRoles) {
      router.push('/unauthorized');
      return;
    }
  });
</script>
