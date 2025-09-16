<template>
    <header class="bg-white border-b border-gray-200 sticky top-0 z-30">
        <nav
            class="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center"
        >
            <!-- Logo -->
            <div class="flex-shrink-0">
                <router-link to="/" class="flex items-center">
                    <div
                        class="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md mr-2"
                    >
                        <span class="text-white font-bold text-xl">D</span>
                    </div>
                    <span
                        class="font-bold text-xl bg-gradient-to-r from-green-600 to-emerald-500 inline-block text-transparent bg-clip-text"
                    >
                        Solidhive
                    </span>
                </router-link>
            </div>

            <!-- Navigation Desktop -->
            <div class="hidden md:flex items-center space-x-1">
                <router-link
                    to="/"
                    class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors"
                >
                    Accueil
                </router-link>
                <router-link
                    to="/docs"
                    class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors"
                >
                    Documentation
                </router-link>
            </div>

            <!-- Authentication -->
            <div class="flex items-center space-x-2">
                <template v-if="authStore.isAuthenticated()">
                    <!-- Menu de profil avec ouverture au clic -->
                    <div
                        ref="profileMenuContainer"
                        class="hidden md:block relative"
                    >
                        <button
                            class="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors cursor-pointer"
                            @click.stop="toggleProfileMenu"
                        >
                            <span>Mon compte</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-4 w-4 transition-transform duration-200"
                                :class="{ 'rotate-180': profileMenuOpen }"
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
                        </button>

                        <!-- Menu déroulant avec animation -->
                        <div
                            v-show="profileMenuOpen"
                            class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-40 border border-gray-100 transform origin-top-right transition-all duration-200 ease-out"
                            :class="{
                                'scale-100 opacity-100': profileMenuOpen,
                                'scale-95 opacity-0': !profileMenuOpen
                            }"
                        >
                            <router-link
                                to="/profile"
                                class="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                            >
                                <div class="flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="h-4 w-4 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    Mon profil
                                </div>
                            </router-link>
                            <button
                                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                                @click="logout"
                            >
                                <div class="flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="h-4 w-4 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    Déconnexion
                                </div>
                            </button>
                        </div>
                    </div>

                    <!-- Version mobile -->
                    <div class="md:hidden flex space-x-1">
                        <router-link
                            to="/profile"
                            class="p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-green-50"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </router-link>
                        <button
                            class="p-2 rounded-md text-gray-700 hover:text-red-600 hover:bg-red-50"
                            @click="logout"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                        </button>
                    </div>
                </template>

                <template v-else>
                    <router-link
                        to="/login"
                        class="hidden md:flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                            />
                        </svg>
                        Connexion
                    </router-link>

                    <router-link
                        to="/login"
                        class="md:hidden p-2 rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                            />
                        </svg>
                    </router-link>
                </template>

                <!-- Menu hamburger (mobile) -->
                <button
                    class="md:hidden p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-green-50 focus:outline-none"
                    @click="mobileMenuOpen = !mobileMenuOpen"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            v-if="!mobileMenuOpen"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                        <path
                            v-else
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        </nav>

        <!-- Menu mobile -->
        <div
            v-show="mobileMenuOpen"
            class="md:hidden absolute left-0 right-0 bg-white border-t border-gray-200 shadow-md z-20 transition-all duration-200 transform animate-slideIn"
        >
            <div class="px-2 pt-2 pb-3 space-y-1">
                <router-link
                    to="/"
                    class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50"
                >
                    Accueil
                </router-link>
                <router-link
                    to="/docs"
                    class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50"
                >
                    Documentation
                </router-link>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const mobileMenuOpen = ref(false);
const profileMenuOpen = ref(false);
const profileMenuContainer = ref<HTMLElement | null>(null);

function toggleProfileMenu() {
    profileMenuOpen.value = !profileMenuOpen.value;
}

// Ferme le menu si on clique ailleurs sur la page
function handleClickOutside(event: MouseEvent) {
    if (
        profileMenuOpen.value &&
        profileMenuContainer.value &&
        !profileMenuContainer.value.contains(event.target as Node)
    ) {
        profileMenuOpen.value = false;
    }
}

onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside);
});

async function logout() {
    await authStore.logout();
    router.push('/login');
}
</script>

<style>
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-slideIn {
    animation: slideIn 0.2s ease-out forwards;
}
</style>
