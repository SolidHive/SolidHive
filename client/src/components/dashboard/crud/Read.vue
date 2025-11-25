<template>
  <!-- Go to create sheet page -->
  <Header
    :can-create-items="canCreateItems"
    @create:open="goTo(createRouteName ?? ($route.name as string) + 'Create')"
  >
    <template #header>
      <slot name="header">No Header Found</slot>
    </template>
    <template #add-button>
      <slot name="add-button"></slot>
    </template>
  </Header>
  <div class="relative w-full p-6 md:px-12">
    <!-- Barre de recherche -->
    <SearchBar v-model="searchQuery" />

    <!-- Table des éléments -->
    <Table
      :items="items"
      :can-delete-items="canDeleteItems"
      :can-update-items="canUpdateItems"
      :can-modify-specific-item="canModifySpecificItem"
    >
      <template #header>
        <TableHead
          v-for="header in tableHeaders"
          :key="header.text"
          :class="sortBy && sortBy.sortKey === header.sortKey ? 'text-foreground' : ''"
        >
          <button
            v-if="header.sortKey"
            class="hover:bg-background flex cursor-pointer flex-row items-center justify-center gap-2 rounded-md px-4 py-2 transition-all"
            @click="toggleSort(header.sortKey ?? header.text)"
          >
            {{ header.text }}
            <ArrowUpDown
              v-if="(sortBy && sortBy.sortKey !== header.sortKey) || !sortBy"
              class="inline-block h-4 w-4"
            />
            <ArrowUp
              v-else-if="sortBy && sortBy.sortKey === header.sortKey && sortBy.direction === 'ASC'"
              class="inline-block h-4 w-4"
            />
            <ArrowDown
              v-else-if="sortBy && sortBy.sortKey === header.sortKey && sortBy.direction === 'DESC'"
              class="inline-block h-4 w-4"
            />
          </button>
          <span v-else>
            {{ header.text }}
          </span>
        </TableHead>
      </template>
      <template #table-row>
        <TableRow v-for="item in items" :key="item.id">
          <slot name="table-row" v-bind="item"></slot>
          <TableCell class="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger
                :disabled="!canModifySpecificItem(item) || (!canUpdateItems && !canDeleteItems)"
              >
                <Ellipsis
                  :size="16"
                  :class="
                    !canModifySpecificItem(item) || (!canUpdateItems && !canDeleteItems)
                      ? 'opacity-30'
                      : ''
                  "
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                v-if="canModifySpecificItem(item) && (canUpdateItems || canDeleteItems)"
              >
                <DropdownMenuItem
                  v-if="canUpdateItems"
                  @click="
                    goTo(updateRouteName ?? ($route.name as string) + 'Update', {
                      itemId: item.id,
                    })
                  "
                >
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  v-if="canDeleteItems"
                  @click="
                    goTo(deleteRouteName ?? ($route.name as string) + 'Delete', { itemId: item.id })
                  "
                >
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </template>
    </Table>

    <!-- Pagination -->
    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-items="totalItems"
      :items-per-page="itemsPerPage"
      @previous="goToPreviousPage"
      @next="goToNextPage"
      @update:items-per-page="handleItemsPerPageChange"
    />

    <!-- Loading -->
    <LoadingSpinner :is-loading="isLoading" />
  </div>
</template>

<script setup lang="ts" generic="T extends HasId">
  import type { HasId } from '@/interfaces/has_id.interface';
  import { onMounted, ref, watch, type Ref } from 'vue';
  import LoadingSpinner from '../LoadingSpinner.vue';
  import Pagination from '../Pagination.vue';
  import SearchBar from '../SearchBar.vue';
  import Table from '../Table.vue';
  import Database from '@/utils/database.utils';
  import Header from '../Header.vue';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
  import { Ellipsis, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-vue-next';
  import { TableCell, TableHead, TableRow } from '../../ui/table';
  import router from '@/routes';
  import { useRoute } from 'vue-router';
  import type { TableHeader } from '@/interfaces/table-header.interface';
  import { sortKeyToNested } from '@/utils/sort.utils';
  import type { NestedKeyOf } from '@/types/nested-key-of.type';

  const props = defineProps<{
    tableHeaders: TableHeader<T>[];
    createRouteName?: string;
    updateRouteName?: string;
    deleteRouteName?: string;
    fetchItems: string | T[];
    canCreateItems: boolean;
    canUpdateItems: boolean;
    canDeleteItems: boolean;
    canModifySpecificItem: (item: T) => boolean;
  }>();

  const route = useRoute();
  const items = ref<T[]>([]) as Ref<T[]>;
  const searchQuery = ref('');
  const isLoading = ref(false);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalItems = ref(0);
  const totalPages = ref(1);
  const sortBy = ref<{ sortKey: NestedKeyOf<T>; direction: 'ASC' | 'DESC' } | null>(null);

  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  watch(searchQuery, () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      currentPage.value = 1;
      fetchItems();
    }, 500);
  });

  watch(
    () => router.currentRoute.value,
    () => {
      fetchItems();
    }
  );

  onMounted(() => {
    fetchItems();
  });

  function goToPreviousPage() {
    if (currentPage.value > 1) {
      currentPage.value--;
      fetchItems();
    }
  }

  function handleItemsPerPageChange(value: number) {
    itemsPerPage.value = value;
    currentPage.value = 1;
    fetchItems();
  }

  function goToNextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
      fetchItems();
    }
  }

  function toggleSort(field: NestedKeyOf<T>) {
    if (sortBy.value && sortBy.value.sortKey === field) {
      sortBy.value.direction = sortBy.value.direction === 'ASC' ? 'DESC' : 'ASC';
    } else {
      sortBy.value = { sortKey: field, direction: 'ASC' };
    }
    currentPage.value = 1;
    fetchItems();
  }

  const fetchItems = async () => {
    if (typeof props.fetchItems !== 'string') {
      items.value = props.fetchItems;
      totalItems.value = items.value.length;
      totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value) || 1;
      return;
    }
    try {
      isLoading.value = true;

      const params: Record<string, any> = {
        skip: (currentPage.value - 1) * itemsPerPage.value,
        take: itemsPerPage.value,
      };

      if (searchQuery.value) {
        params.where = JSON.stringify(searchQuery.value);
      }

      if (sortBy.value) {
        params.order = JSON.stringify(
          sortKeyToNested(sortBy.value.sortKey, sortBy.value.direction)
        );
      }

      const response = await Database.getAll(props.fetchItems, params);

      items.value = response;
      totalItems.value = items.value.length;
      totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value) || 1;
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      items.value = [];
      totalItems.value = 0;
      totalPages.value = 1;
    } finally {
      isLoading.value = false;
    }
  };

  function goTo(name: string, params: Record<string, any> = {}) {
    router.push({
      name,
      params: {
        ...route.params, // Conserver les params de la route parente (comme id de l'association)
        ...params,
      },
    });
  }
</script>
