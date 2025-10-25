<template>
  <header class="sticky top-0 z-30 border-b border-gray-200 bg-white">
    <nav class="flex w-full items-center justify-between px-6 py-3 xl:px-20">
      <!-- Logo -->
      <div class="flex-shrink-0">
        <router-link to="/" class="flex items-center">
          <img :src="logoUrl" alt="SolidHive Logo" class="h-12 w-auto" />
        </router-link>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden items-center space-x-8 md:flex">
        <router-link
          to="/cagnottes"
          class="text-secondary font-paragraph text-sm transition-opacity hover:opacity-80"
        >
          Cagnottes
        </router-link>
        <router-link
          to="/events"
          class="text-secondary font-paragraph text-sm transition-opacity hover:opacity-80"
        >
          Événements
        </router-link>
        <router-link
          to="/associations"
          class="text-secondary font-paragraph text-sm transition-opacity hover:opacity-80"
        >
          Associations
        </router-link>
      </div>

      <!-- Desktop Auth -->
      <div class="hidden items-center space-x-4 md:flex">
        <template v-if="authStore.isAuthenticated()">
          <router-link
            to="/mon-compte"
            class="text-secondary font-paragraph text-sm transition-opacity hover:opacity-80"
          >
            Mon compte
          </router-link>
          <div class="bg-accent flex h-8 w-8 items-center justify-center rounded-full">
            <User class="h-4 w-4 text-white" />
          </div>
        </template>
        <template v-else>
          <Button variant="secondary" size="sm" @click="$router.push('/login')">
            Se connecter
          </Button>
        </template>
      </div>

      <!-- Mobile Burger -->
      <button
        class="focus:ring-secondary flex items-center justify-center rounded p-2 focus:outline-none focus:ring-2 md:hidden"
        @click="toggleMenu"
      >
        <svg
          v-if="!menuOpen"
          xmlns="http://www.w3.org/2000/svg"
          class="text-secondary h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="text-secondary h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </nav>

    <!-- Mobile Menu Overlay -->
    <transition name="fade">
      <div v-if="menuOpen" class="fixed inset-0 z-40 bg-black/40 md:hidden" @click="closeMenu" />
    </transition>

    <!-- Mobile Menu Drawer -->
    <transition name="slide">
      <aside
        v-if="menuOpen"
        class="animate-in slide-in-from-right fixed right-0 top-0 z-50 flex h-full w-4/5 max-w-xs flex-col gap-6 bg-white p-6 shadow-lg duration-200 md:hidden"
      >
        <div class="mb-2 flex items-center justify-between">
          <router-link to="/" class="flex items-center" @click="closeMenu">
            <img :src="logoUrl" alt="SolidHive Logo" class="h-10 w-auto" />
          </router-link>
          <button class="p-2" @click="closeMenu">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="text-secondary h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav class="mt-2 flex flex-col gap-4">
          <router-link
            to="/cagnottes"
            class="text-secondary font-paragraph py-2 text-base"
            @click="closeMenu"
          >
            Cagnottes
          </router-link>
          <router-link
            to="/evenements"
            class="text-secondary font-paragraph py-2 text-base"
            @click="closeMenu"
          >
            Événements
          </router-link>
          <router-link
            to="/associations"
            class="text-secondary font-paragraph py-2 text-base"
            @click="closeMenu"
          >
            Associations
          </router-link>
        </nav>
        <div class="flex-1" />
        <div>
          <template v-if="authStore.isAuthenticated()">
            <div class="flex items-center gap-2">
              <div class="bg-accent flex h-8 w-8 items-center justify-center rounded-full">
                <User class="h-4 w-4 text-white" />
              </div>
              <router-link
                to="/mon-compte"
                class="text-secondary font-paragraph py-2 text-base"
                @click="closeMenu"
              >
                Mon compte
              </router-link>
            </div>
          </template>
          <template v-else>
            <Button variant="secondary" size="sm" class="w-full" @click="goToLogin">
              Se connecter
            </Button>
          </template>
        </div>
      </aside>
    </transition>
  </header>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../stores/auth';
  import { Button } from '@/components/ui/button';
  import { User } from 'lucide-vue-next';
  import logoUrl from '@/assets/images/logo-solidhive.png';

  const authStore = useAuthStore();
  const menuOpen = ref(false);
  const router = useRouter();

  function toggleMenu() {
    menuOpen.value = !menuOpen.value;
  }
  function closeMenu() {
    menuOpen.value = false;
  }
  function goToLogin() {
    closeMenu();
    router.push('/login');
  }
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: transform 0.2s;
  }

  .slide-enter-from,
  .slide-leave-to {
    transform: translateX(100%);
  }
</style>
