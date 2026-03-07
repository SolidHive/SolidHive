<template>
  <Read
    :table-headers="tableHeaders"
    :fetch-items="`association/${associationId}/users`"
    :can-create-items="crmAccess.canCreateMember"
    :can-update-items="crmAccess.canUpdateMember"
    :can-delete-items="crmAccess.canRemoveMember"
    :can-modify-specific-item="canModifyMember"
    create-route-name="CRMMembersCreate"
    update-route-name="CRMMembersUpdate"
    delete-route-name="CRMMembersDelete"
  >
    <template #header>Membres</template>
    <template #add-button>Inviter un membre</template>
    <template #table-row="{ user, role, status }">
      <TableCell class="font-medium">
        <div class="flex items-center gap-3">
          <div class="font-medium capitalize">{{ user.name }}</div>
          <div class="text-muted-foreground text-sm capitalize">
            {{ user.firstname }}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <a
          :href="`mailto:${member.user.email}`"
          class="text-blue-300 transition-all hover:underline hover:opacity-75"
        >
          {{ user.email }}
        </a>
      </TableCell>
      <TableCell>
        <div v-if="user.phone !== null && user.phone !== ''">
          <a
            :href="`tel:${user.phone}`"
            class="text-blue-300 transition-all hover:underline hover:opacity-75"
          >
            {{ user.phone }}
          </a>
        </div>
        <div v-else class="text-muted-foreground">N/A</div>
      </TableCell>
      <TableCell>
        <span
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
        >
          {{ role.name === 'owner' ? 'propriétaire' : role.name }}
        </span>
        <span
          v-if="member.user.id && user.id === member.user.id"
          class="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
        >
          Vous
        </span>
      </TableCell>
      <TableCell>
        <StatusTag :status="status" />
      </TableCell>
    </template>
  </Read>
  <router-view />
</template>

<script setup lang="ts">
  import { onBeforeMount } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import type { Member } from '@/interfaces/member.interface';
  import { useCrmStore } from '@/stores/crm';
  import { TableCell } from '@/components/ui/table';
  import StatusTag from '@/components/dashboard/tags/StatusTag.vue';
  import { useCrmAccess } from '@/composables/crm-access';
  import { Read } from '@/components/dashboard/crud';
  import type { TableHeader } from '@/interfaces/table-header.interface';
  import { Permissions } from '@/enums/permissions';
  import { useCrmPremiumAccess } from '@/composables/crm-premium';

  const tableHeaders: TableHeader<Member>[] = [
    { text: 'Nom', sortKey: 'user.name' },
    { text: 'Email', sortKey: 'user.email' },
    { text: 'Téléphone', sortKey: 'user.phone' },
    { text: 'Rôle', sortKey: 'role.name' },
    { text: 'Statut', sortKey: 'status' },
  ];

  const crmStore = useCrmStore();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const route = useRoute();
  const router = useRouter();
  const crmPremiumAccess = useCrmPremiumAccess(crmStore.associationPremiumUntil);
  const associationId = route.params.id as string;

  // Fonction pour déterminer si un membre peut être modifié/supprimé
  const canModifyMember = (item: Member): boolean => {
    // Empêcher l'auto-suppression
    if (member?.user?.id && item.user.id === member.user.id) {
      return false;
    }

    // Si l'utilisateur actuel est owner, il peut modifier n'importe qui (sauf lui-même)
    const isOwner = member?.role?.name === 'owner';
    if (isOwner) {
      return true;
    }
    // Sinon, il ne peut pas modifier les owners
    return item.role.name !== 'owner';
  };

  onBeforeMount(async () => {
    const hasPremiumAccess = await crmPremiumAccess.hasAccessToPremiumFeatures(
      Permissions.REGISTERS_VIEW
    );

    if (!hasPremiumAccess) {
      router.push({
        name: 'CRMPremiumRequired',
        params: { id: route.params.id },
      });
      return;
    }

    if (!crmAccess.canAccessToMembers) {
      router.push('/unauthorized');
      return;
    }
  });
</script>
