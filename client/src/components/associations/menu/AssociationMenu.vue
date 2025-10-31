<template>
  <nav class="relative w-full">
    <div class="mb-4 md:hidden">
      <div class="relative">
        <select
          v-model.number="activeIndex"
          class="font-title text-secondary focus:text-secondary w-full appearance-none rounded-md border border-gray-200 bg-white p-3 pr-10 focus:outline-none"
          @change="setActiveTab(activeIndex)"
        >
          <option
            v-for="(tab, index) in tabs"
            :key="tab.key"
            :value="index"
            class="font-title text-secondary"
          >
            {{ tab.label }}
          </option>
        </select>
        <svg
          class="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>

    <div ref="menuRef" class="relative hidden overflow-x-auto pb-2 md:block">
      <div class="mb-2 inline-flex items-center gap-8 pl-0">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.key"
          :ref="(el) => setItemRef(el, index)"
          :class="[
            'font-title text-secondary text-lg whitespace-nowrap transition-colors duration-200 md:text-xl',
            activeIndex === index ? 'text-secondary' : 'hover:text-secondary text-gray-400',
          ]"
          @click="setActiveTab(index)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="relative h-1 w-full bg-gray-200">
        <div
          class="bg-secondary absolute top-0 h-full transition-all duration-300 ease-in-out"
          :style="indicatorStyle"
        ></div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
  import { ref, defineEmits, onMounted, nextTick, onBeforeUnmount, watch } from 'vue';

  const props = defineProps<{
    currentTab?: string;
  }>();

  const tabs = [
    { key: 'accueil', label: 'Accueil' },
    { key: 'annonces', label: 'Annonces' },
    { key: 'campagnes', label: 'Campagnes' },
    { key: 'evenements', label: 'Événements' },
    { key: 'contact', label: 'Contact' },
  ];

  const activeIndex = ref(0);

  watch(
    () => props.currentTab,
    (newTab) => {
      if (newTab) {
        const index = tabs.findIndex((tab) => tab.key === newTab);
        if (index !== -1) {
          activeIndex.value = index;
          nextTick(updateIndicator);
        }
      }
    }
  );

  const emit = defineEmits(['change-tab']);

  const menuRef = ref<HTMLElement | null>(null);
  const itemRefs = ref<Array<HTMLElement | null>>([]);
  const indicatorStyle = ref<Record<string, string>>({ left: '0px', width: '0px' });

  function setItemRef(el: unknown, idx: number) {
    const node = el as unknown as HTMLElement | null;
    itemRefs.value[idx] = node;
  }

  function updateIndicator() {
    const container = menuRef.value;
    const activeEl = itemRefs.value[activeIndex.value];
    if (!container || !activeEl) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();
    const left = elRect.left - containerRect.left;
    const width = elRect.width;
    indicatorStyle.value = { left: `${left}px`, width: `${width}px` };
  }

  function setActiveTab(index: number) {
    activeIndex.value = index;
    const tab = tabs[index];
    if (tab) {
      emit('change-tab', tab.key);
    }
    nextTick(updateIndicator);
  }

  let ro: ResizeObserver | null = null;
  onMounted(() => {
    nextTick(() => {
      updateIndicator();
      if (window.ResizeObserver) {
        ro = new ResizeObserver(() => updateIndicator());
        if (menuRef.value) ro.observe(menuRef.value);
        itemRefs.value.forEach((el) => el && ro!.observe(el));
      } else {
        window.addEventListener('resize', updateIndicator);
      }
    });
  });

  onBeforeUnmount(() => {
    if (ro) {
      ro.disconnect();
    } else {
      window.removeEventListener('resize', updateIndicator);
    }
  });
</script>
