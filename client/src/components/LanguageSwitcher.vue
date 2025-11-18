<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <button
        class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
      >
        <span>{{ currentLanguage.flag }}</span>
        <span class="hidden sm:inline">{{ currentLanguage.name }}</span>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="center">
      <div class="flex flex-col gap-1.5 text-sm font-normal">
        <DropdownMenuItem
          v-for="lang in languages"
          :key="lang.code"
          :class="[currentLocale === lang.code && 'bg-accent text-white']"
          @click="changeLanguage(lang.code)"
        >
          <span class="mr-2">{{ lang.flag }}</span>
          <span>{{ lang.name }}</span>
        </DropdownMenuItem>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';

  const { locale } = useI18n();

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  const currentLocale = computed(() => locale.value);

  const currentLanguage = computed(() => {
    const found = languages.find((lang) => lang.code === currentLocale.value);
    return found ?? languages[0];
  });

  const changeLanguage = (lang: string) => {
    locale.value = lang;
    localStorage.setItem('locale', lang);
  };
</script>
