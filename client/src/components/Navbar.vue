<template>
  <header class="sticky top-0 z-50 border-b border-gray-200 bg-white">
    <nav class="flex w-full items-center justify-between px-6 py-3 xl:px-20">
      <!-- Logo -->
      <div class="shrink-0">
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
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div class="bg-accent flex h-8 w-8 items-center justify-center rounded-full">
                <User class="h-4 w-4 text-white" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div class="flex px-2 py-1.5 text-sm font-normal">
                <div class="flex flex-col space-y-1">
                  <p class="text-secondary text-sm leading-none font-semibold">
                    {{ authStore.user?.name }} {{ authStore.user?.firstname }}
                  </p>
                  <p class="text-muted-foreground text-xs leading-none">
                    {{ authStore.user?.email }}
                  </p>
                  <p
                    v-if="authStore.isLoading"
                    class="text-xs leading-none font-medium text-amber-600"
                  >
                    Création d'association en cours...
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <router-link to="/profile" class="w-full">Mon compte</router-link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <router-link to="/create-association" class="w-full">
                  Créer une association
                </router-link>
              </DropdownMenuItem>
              <DropdownMenuItem v-if="isAdmin">
                <router-link to="/admin/dashboard" class="w-full">Dashboard Admin</router-link>
              </DropdownMenuItem>
              <DropdownMenuSub v-if="accessibleAssociations.length > 0">
                <DropdownMenuSubTrigger>Accès CRM</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    v-for="userInAssociation in accessibleAssociations"
                    :key="userInAssociation.id"
                  >
                    <router-link
                      :to="{
                        name: 'CRMHome',
                        params: {
                          locale: $route.params.locale,
                          id: userInAssociation.association.id,
                        },
                      }"
                      class="w-full"
                    >
                      {{ userInAssociation.association.name }}
                    </router-link>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                class="text-destructive"
                @click="
                  authStore.logout();
                  $router.push('/');
                "
              >
                <Unplug class="size-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </template>
        <template v-else>
          <Button variant="secondary" size="sm" @click="$router.push('/login')">
            Se connecter
          </Button>
        </template>
      </div>

      <!-- Mobile Burger -->
      <button
        class="focus:ring-secondary flex items-center justify-center rounded p-2 focus:ring-2 focus:outline-none md:hidden"
        @click="toggleMenu"
      >
        <Menu v-if="!menuOpen" class="text-secondary h-7 w-7" />
        <X v-else class="text-secondary h-7 w-7" />
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
        class="animate-in slide-in-from-right fixed top-0 right-0 z-50 flex h-full w-4/5 max-w-xs flex-col gap-6 bg-white p-6 shadow-lg duration-200 md:hidden"
      >
        <div class="mb-2 flex items-center justify-between">
          <router-link to="/" class="flex items-center" @click="closeMenu">
            <img :src="logoUrl" alt="SolidHive Logo" class="h-10 w-auto" />
          </router-link>
          <button class="p-2" @click="closeMenu">
            <X class="text-secondary h-7 w-7" />
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
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div class="flex items-center gap-2">
                  <div class="bg-accent flex h-8 w-8 items-center justify-center rounded-full">
                    <User class="h-4 w-4 text-white" />
                  </div>
                  <div class="text-secondary font-paragraph py-2 text-base">Mon compte</div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div class="flex px-2 py-1.5 text-sm font-normal">
                  <div class="flex flex-col space-y-1">
                    <p class="text-secondary text-sm leading-none font-semibold">
                      {{ authStore.user?.name }} {{ authStore.user?.firstname }}
                    </p>
                    <p class="text-muted-foreground text-xs leading-none">
                      {{ authStore.user?.email }}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <router-link to="/profile" class="w-full">Mon compte</router-link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <router-link to="/create-association" class="w-full">
                    Créer une association
                  </router-link>
                </DropdownMenuItem>
                <DropdownMenuItem v-if="isAdmin">
                  <router-link to="/admin/dashboard" class="w-full">Dashboard Admin</router-link>
                </DropdownMenuItem>
                <DropdownMenuSub v-if="accessibleAssociations.length > 0">
                  <DropdownMenuSubTrigger>Accès CRM</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      v-for="userInAssociation in accessibleAssociations"
                      :key="userInAssociation.id"
                    >
                      <router-link
                        :to="{
                          name: 'CRMHome',
                          params: {
                            locale: $route.params.locale,
                            id: userInAssociation.association.id,
                          },
                        }"
                        class="w-full"
                      >
                        {{ userInAssociation.association.name }}
                      </router-link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  class="text-destructive"
                  @click="
                    authStore.logout();
                    $router.push('/');
                  "
                >
                  <Unplug class="h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../stores/auth';
  import { Button } from '@/components/ui/button';
  import { User, Menu, X, Unplug } from 'lucide-vue-next';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
  import logoUrl from '@/assets/images/logo-solidhive.png';
  import { Status } from '@/enums/status';

  const authStore = useAuthStore();
  const menuOpen = ref(false);
  const router = useRouter();

  const accessibleAssociations = computed(() =>
    authStore.associations.filter((uia) => uia.status === Status.ACCEPTED)
  );

  const isAdmin = computed(
    () => authStore.user?.roles?.some((role: any) => role.name?.toLowerCase() === 'admin') ?? false
  );

  function toggleMenu() {
    menuOpen.value = !menuOpen.value;
    document.body.style.overflow = menuOpen.value ? 'hidden' : 'auto';
  }
  function closeMenu() {
    menuOpen.value = false;
    document.body.style.overflow = 'auto';
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
