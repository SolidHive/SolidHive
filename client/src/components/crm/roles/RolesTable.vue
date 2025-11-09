<template>
  <div class="max-w-full overflow-x-auto rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom du rôle</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Nombre de permissions</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="role in roles" :key="role.id">
          <TableCell class="font-medium">
            <span class="capitalize">
              {{ role.name === 'owner' ? 'Propriétaire' : role.name }}
            </span>
          </TableCell>
          <TableCell>
            <div class="text-muted-foreground">
              {{ role.description || 'Aucune description' }}
            </div>
          </TableCell>
          <TableCell>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <span
                    class="inline-flex cursor-help items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800"
                  >
                    {{ role.permissions.length }} permission(s)
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  class="max-w-xs bg-blue-100 [&>span>svg]:bg-blue-100 [&>span>svg]:fill-blue-100"
                >
                  <div class="space-y-1">
                    <ul class="list-inside list-disc space-y-0.5 text-xs text-blue-800">
                      <li v-for="permission in role.permissions" :key="permission">
                        {{ formatPermissionLabel(permission) }}
                      </li>
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableCell>
          <TableCell class="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger :disabled="!canModifyRole(role)">
                <Ellipsis :size="16" :class="!canModifyRole(role) ? 'opacity-30' : ''" />
              </DropdownMenuTrigger>
              <DropdownMenuContent v-if="canModifyRole(role)">
                <DropdownMenuItem v-if="canUpdateRole" @click="$emit('edit', role)">
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator v-if="canUpdateRole && canRemoveRole" />
                <DropdownMenuItem v-if="canRemoveRole" @click="$emit('delete', role)">
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
  import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from '@/components/ui/tooltip';
  import { Ellipsis } from 'lucide-vue-next';
  import type { Role } from '@/interfaces/roles.interface';

  const props = defineProps<{
    roles: Role[];
    canUpdateRole: boolean;
    canRemoveRole: boolean;
  }>();

  defineEmits<{
    edit: [role: Role];
    delete: [role: Role];
  }>();

  function canModifyRole(role: Role): boolean {
    if (role.name === 'owner') return false;
    return props.canUpdateRole || props.canRemoveRole;
  }

  function formatPermissionLabel(permission: string): string {
    if (permission === '*') {
      return 'All Permissions';
    }
    return permission
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
</script>
