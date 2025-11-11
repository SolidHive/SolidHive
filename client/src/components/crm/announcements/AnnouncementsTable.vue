<template>
  <div class="max-w-full overflow-x-auto rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titre</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Image</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Date de création</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="announcement in announcements" :key="announcement.id">
          <TableCell class="font-medium">
            {{ announcement.title }}
          </TableCell>
          <TableCell>
            <div class="text-muted-foreground max-w-md truncate">
              {{ announcement.content || 'Aucune description' }}
            </div>
          </TableCell>
          <TableCell>
            <div v-if="announcement.image" class="flex">
              <img
                :src="announcement.image"
                alt="Image de l'annonce"
                class="h-10 w-10 rounded object-cover"
              />
            </div>
            <div v-else class="text-muted-foreground text-sm">Aucune image</div>
          </TableCell>
          <TableCell>
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
              :class="
                announcement.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              "
            >
              {{ announcement.isActive ? 'Active' : 'Inactive' }}
            </span>
          </TableCell>
          <TableCell>
            <div class="text-sm">
              {{
                announcement.timestamps?.createdAt
                  ? new Date(announcement.timestamps?.createdAt).toLocaleDateString('fr-FR')
                  : 'N/A'
              }}
            </div>
          </TableCell>
          <TableCell class="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger :disabled="!canUpdateAnnouncement && !canRemoveAnnouncement">
                <Ellipsis
                  :size="16"
                  :class="!canUpdateAnnouncement && !canRemoveAnnouncement ? 'opacity-30' : ''"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent v-if="canUpdateAnnouncement || canRemoveAnnouncement">
                <DropdownMenuItem v-if="canUpdateAnnouncement" @click="$emit('edit', announcement)">
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator v-if="canUpdateAnnouncement && canRemoveAnnouncement" />
                <DropdownMenuItem
                  v-if="canRemoveAnnouncement"
                  @click="$emit('delete', announcement)"
                >
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
  import { Ellipsis } from 'lucide-vue-next';
  import type { Announcement } from '@/interfaces/announcement.interface';

  defineProps<{
    announcements: Announcement[];
    canUpdateAnnouncement: boolean;
    canRemoveAnnouncement: boolean;
    associationId: string;
  }>();

  defineEmits<{
    edit: [announcement: Announcement];
    delete: [announcement: Announcement];
  }>();
</script>
