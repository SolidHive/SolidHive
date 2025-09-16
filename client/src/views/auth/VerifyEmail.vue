<template>
    <div
        class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4"
    >
        <div
            class="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center"
        >
            <div class="relative z-10">
                <!-- Icônes d'état avec transition fluide -->
                <div class="relative h-24 mb-8 mt-2">
                    <!-- Spinner avec animation avancée pour chargement -->
                    <transition name="fade" mode="out-in">
                        <div
                            v-if="loading"
                            key="loading"
                            class="absolute inset-0 flex items-center justify-center"
                        >
                            <svg
                                class="w-20 h-20"
                                viewBox="0 0 38 38"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <defs>
                                    <linearGradient
                                        id="spinner-gradient"
                                        x1="8.042%"
                                        y1="0%"
                                        x2="65.682%"
                                        y2="23.865%"
                                    >
                                        <stop
                                            stop-color="#22c55e"
                                            stop-opacity="0"
                                            offset="0%"
                                        ></stop>
                                        <stop
                                            stop-color="#22c55e"
                                            stop-opacity=".631"
                                            offset="63.146%"
                                        ></stop>
                                        <stop
                                            stop-color="#22c55e"
                                            offset="100%"
                                        ></stop>
                                    </linearGradient>
                                </defs>
                                <g fill="none" fill-rule="evenodd">
                                    <g transform="translate(1 1)">
                                        <path
                                            d="M36 18c0-9.94-8.06-18-18-18"
                                            stroke="url(#spinner-gradient)"
                                            stroke-width="3"
                                        >
                                            <animateTransform
                                                attributeName="transform"
                                                type="rotate"
                                                from="0 18 18"
                                                to="360 18 18"
                                                dur="1s"
                                                repeatCount="indefinite"
                                            ></animateTransform>
                                        </path>
                                        <circle
                                            fill="#fff"
                                            cx="36"
                                            cy="18"
                                            r="1"
                                        >
                                            <animateTransform
                                                attributeName="transform"
                                                type="rotate"
                                                from="0 18 18"
                                                to="360 18 18"
                                                dur="1s"
                                                repeatCount="indefinite"
                                            ></animateTransform>
                                        </circle>
                                    </g>
                                </g>
                            </svg>
                        </div>

                        <!-- Succès avec animation à l'entrée -->
                        <div
                            v-else-if="success || alreadyVerified"
                            key="success"
                            class="absolute inset-0 flex items-center justify-center"
                        >
                            <div
                                class="p-6 bg-green-50 rounded-full shadow-sm transform transition-all duration-500 animate-pop-in"
                            >
                                <svg
                                    class="w-12 h-12 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2.5"
                                        d="M5 13l4 4L19 7"
                                    ></path>
                                </svg>
                            </div>
                        </div>

                        <!-- Erreur avec animation à l'entrée -->
                        <div
                            v-else
                            key="error"
                            class="absolute inset-0 flex items-center justify-center"
                        >
                            <div
                                class="p-6 bg-red-50 rounded-full shadow-sm transform transition-all duration-500 animate-pop-in"
                            >
                                <svg
                                    class="w-12 h-12 text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    ></path>
                                </svg>
                            </div>
                        </div>
                    </transition>
                </div>

                <!-- Contenu textuel avec animation -->
                <div class="space-y-4">
                    <transition name="fade-slide-down" mode="out-in">
                        <h1
                            :key="currentTitle"
                            class="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent"
                        >
                            {{ currentTitle }}
                        </h1>
                    </transition>

                    <transition name="fade-slide-up" mode="out-in">
                        <p
                            :key="currentMessage"
                            class="text-gray-600 mb-8 leading-relaxed"
                        >
                            {{ currentMessage }}
                        </p>
                    </transition>

                    <!-- Contact support pour liens expirés -->
                    <transition name="fade">
                        <div v-if="isExpired" class="mb-6">
                            <div
                                class="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100"
                            >
                                <div class="bg-amber-100 rounded-full p-2 mr-3">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="h-5 w-5 text-amber-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div class="text-left">
                                    <div
                                        class="text-sm font-semibold text-gray-700"
                                    >
                                        Besoin d'aide?
                                    </div>
                                    <a
                                        href="mailto:support@solidhive.com"
                                        class="text-sm text-green-600 hover:underline"
                                    >
                                        Contactez notre support
                                    </a>
                                </div>
                            </div>
                        </div>
                    </transition>
                </div>

                <!-- Bouton d'action -->
                <button
                    v-if="!loading"
                    class="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors w-full"
                    @click="redirectToLogin"
                >
                    {{ buttonText }}
                </button>
            </div>
        </div>
    </div>
    <LoadingOverlay :show="loading" message="Vérification en cours..." />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import Database from '../../utils/database.utils';
import { verifyEmailMessages } from '../../utils/errors/auth/verifyEmail';
import LoadingOverlay from '../../components/LoadingOverlay.vue';

// États
const loading = ref(true);
const success = ref(false);
const alreadyVerified = ref(false);
const isExpired = ref(false);

// Services
const route = useRoute();
const router = useRouter();
const toast = useToast();

// Valeurs calculées
const currentTitle = computed(() => {
    if (loading.value) return verifyEmailMessages.title.loading;
    if (success.value) return verifyEmailMessages.title.success;
    if (alreadyVerified.value) return verifyEmailMessages.title.alreadyVerified;
    if (isExpired.value) return verifyEmailMessages.title.expired;
    return verifyEmailMessages.title.failure;
});

const currentMessage = computed(() => {
    if (loading.value) return verifyEmailMessages.message.loading;
    if (success.value) return verifyEmailMessages.message.success;
    if (alreadyVerified.value)
        return verifyEmailMessages.message.alreadyVerified;
    if (isExpired.value) return verifyEmailMessages.message.expired;
    return verifyEmailMessages.message.failure;
});

const buttonText = computed(() =>
    success.value || alreadyVerified.value
        ? verifyEmailMessages.button.success
        : verifyEmailMessages.button.failure
);

// Redirection
function redirectToLogin() {
    router.push('/login');
}

// Traitement du token
onMounted(async () => {
    const token = route.query.token as string;

    if (!token) {
        loading.value = false;
        success.value = false;
        return;
    }

    try {
        const response = await Database.create('security/action', {
            actionType: 'VERIFY_EMAIL',
            token: token
        });

        // Succès - compte vérifié ou déjà vérifié
        success.value = true;

        // Vérifie si le compte était déjà vérifié
        if (response?.data?.message?.includes('déjà vérifié')) {
            alreadyVerified.value = true;
            toast.info(verifyEmailMessages.toast.alreadyVerified);
        } else {
            toast.success(verifyEmailMessages.toast.success);
        }
    } catch (error: unknown) {
        // Échec - différentes raisons possibles
        success.value = false;

        // Analyse l'erreur
        const apiError = error as {
            response?: { data?: { message?: string } };
        };
        const errorMessage = apiError.response?.data?.message || '';

        // Détermine le type d'erreur
        if (errorMessage.includes('expiré')) {
            isExpired.value = true;
            toast.error(verifyEmailMessages.toast.expired);
        } else {
            toast.error(errorMessage || verifyEmailMessages.message.failure);
        }
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
/* Animations pour transitions fluides */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-slide-down-enter-active,
.fade-slide-down-leave-active {
    transition:
        opacity 0.3s,
        transform 0.4s;
}

.fade-slide-down-enter-from,
.fade-slide-down-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.fade-slide-up-enter-active,
.fade-slide-up-leave-active {
    transition:
        opacity 0.3s,
        transform 0.4s;
}

.fade-slide-up-enter-from,
.fade-slide-up-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

@keyframes pulse-width {
    0%,
    100% {
        width: 0%;
    }

    50% {
        width: 100%;
    }
}

@keyframes pop-in {
    0% {
        transform: scale(0.8);
        opacity: 0;
    }

    70% {
        transform: scale(1.1);
        opacity: 1;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.animate-pop-in {
    animation: pop-in 0.5s cubic-bezier(0.26, 1.36, 0.68, 1);
}
</style>
