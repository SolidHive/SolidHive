<template>
  <div class="max-w-full overflow-x-auto rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Téléphone</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="member in members" :key="member.id">
          <TableCell class="font-medium">
            <div class="flex items-center gap-3">
              <div class="font-medium capitalize">{{ member.user.name }}</div>
              <div class="text-muted-foreground text-sm capitalize">
                {{ member.user.firstname }}
              </div>
            </div>
          </TableCell>
          <TableCell>
            <a
              :href="`mailto:${member.user.email}`"
              class="text-blue-300 transition-all hover:underline hover:opacity-75"
            >
              {{ member.user.email }}
            </a>
          </TableCell>
          <TableCell>
            <div v-if="member.user.phone !== null && member.user.phone !== ''">
              <a
                :href="`tel:${member.user.phone}`"
                class="text-blue-300 transition-all hover:underline hover:opacity-75"
              >
                {{ member.user.phone }}
              </a>
            </div>
            <div v-else class="text-muted-foreground">N/A</div>
          </TableCell>
          <TableCell>
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
            >
              {{ member.role.name === 'owner' ? 'propriétaire' : member.role.name }}
            </span>
            <span
              v-if="currentUserId && member.user.id === currentUserId"
              class="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
            >
              Vous
            </span>
          </TableCell>
          <TableCell>
            <StatusTag :status="member.status" />
          </TableCell>
          <TableCell class="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger
                :disabled="!canModifyMember(member) || (!canUpdateMember && !canRemoveMember)"
              >
                <Ellipsis
                  :size="16"
                  :class="
                    !canModifyMember(member) || (!canUpdateMember && !canRemoveMember)
                      ? 'opacity-30'
                      : ''
                  "
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                v-if="canModifyMember(member) && (canUpdateMember || canRemoveMember)"
              >
                <DropdownMenuItem v-if="canUpdateMember" @click="$emit('edit', member)">
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem v-if="canRemoveMember" @click="$emit('delete', member)">
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

<script setup lang="ts">
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
  import StatusTag from '@/components/dashboard/tags/StatusTag.vue';
  import { Ellipsis } from 'lucide-vue-next';
  import type { Member } from '@/interfaces/member.interface';

  const props = defineProps<{
    members: Member[];
    currentUserId?: string;
    canUpdateMember: boolean;
    canRemoveMember: boolean;
  }>();

  defineEmits<{
    edit: [member: Member];
    delete: [member: Member];
  }>();

  function canModifyMember(member: Member): boolean {
    if (member.role.name === 'owner') {
      return false;
    }

    if (props.currentUserId && member.user.id === props.currentUserId) {
      return false;
    }

    return true;
  }
</script>
