<template>
    <div
        class="min-h-screen flex items-center justify-center bg-gray-100 py-6 px-4"
    >
        <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h1
                class="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-green-600 to-emerald-500 inline-block text-transparent bg-clip-text w-full"
            >
                Mot de passe oublié
            </h1>
            <p class="text-gray-600 text-center mb-6">
                Entrez votre adresse email pour recevoir un lien de
                réinitialisation
            </p>

            <transition name="fade" mode="out-in">
                <div v-if="!requestSent" key="form">
                    <form class="space-y-5" @submit.prevent="handleSubmit">
                        <InputForm
                            v-model="form.email.$value"
                            label-value="Email"
                            input-name="email"
                            type="email"
                            placeholder="votre@email.com"
                            :error-message="
                                showError('email')
                                    ? form.email.$error?.message
                                    : ''
                            "
                            :error-state="showError('email')"
                            @blur="touchedFields.email = true"
                        >
                            <template #hint>
                                <div class="text-gray-500 text-xs">
                                    Saisissez l'adresse email associée à votre
                                    compte
                                </div>
                            </template>
                        </InputForm>

                        <div
                            class="bg-gray-50 border border-gray-200 rounded-md p-4 text-sm text-gray-800 flex items-start"
                        >
                            <div class="mr-3 flex-shrink-0 mt-0.5">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-5 w-5 text-gray-600"
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
                            <div>
                                <p>
                                    Un lien de réinitialisation sera envoyé à
                                    cette adresse email. Ce lien expirera après
                                    1h.
                                </p>
                            </div>
                        </div>

                        <div
                            class="flex flex-col-reverse sm:flex-row justify-between items-center mt-8 gap-y-4"
                        >
                            <div
                                class="text-gray-600 text-sm text-center sm:text-left w-full sm:w-auto"
                            >
                                Revenir à la
                                <router-link
                                    to="/login"
                                    class="text-green-600 hover:underline font-medium"
                                >
                                    page de connexion
                                </router-link>
                            </div>

                            <button
                                type="submit"
                                class="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors w-full sm:w-auto"
                                :disabled="isLoading"
                            >
                                <div class="flex items-center justify-center">
                                    <svg
                                        v-if="isLoading"
                                        class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            class="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            stroke-width="4"
                                        ></circle>
                                        <path
                                            class="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    {{
                                        isLoading
                                            ? 'Envoi en cours...'
                                            : 'Envoyer le lien'
                                    }}
                                </div>
                            </button>
                        </div>
                    </form>
                </div>

                <div v-else key="success" class="text-center py-6">
                    <div
                        class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-8 w-8 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                    </div>

                    <h2 class="text-2xl font-bold text-gray-800 mb-2">
                        Email envoyé !
                    </h2>
                    <p class="text-gray-600 mb-6">
                        Si l'adresse email existe dans notre système, vous
                        recevrez un lien pour réinitialiser votre mot de passe.
                    </p>

                    <div
                        class="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6"
                    >
                        <h3 class="font-semibold text-gray-800 mb-1">
                            Prochaines étapes
                        </h3>
                        <ol
                            class="text-sm text-gray-600 text-left space-y-1 list-decimal pl-5"
                        >
                            <li>
                                Vérifiez votre boîte de réception et vos spams
                            </li>
                            <li>Cliquez sur le lien reçu par email</li>
                            <li>Créez un nouveau mot de passe sécurisé</li>
                        </ol>
                    </div>

                    <div
                        class="flex flex-col-reverse sm:flex-row justify-between items-center mt-8 gap-y-4"
                    >
                        <div
                            class="text-gray-600 text-sm text-center sm:text-left w-full sm:w-auto"
                        >
                            Revenir à la
                            <router-link
                                to="/login"
                                class="text-green-600 hover:underline font-medium"
                            >
                                page de connexion
                            </router-link>
                        </div>

                        <button
                            class="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors w-full sm:w-auto"
                            @click="resetForm"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </transition>
        </div>
    </div>
    <LoadingOverlay :show="isLoading" message="Envoi en cours..." />
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useToast } from 'vue-toastification';
import Database from '../../utils/database.utils';
import InputForm from '../../components/form/InputForm.vue';
import LoadingOverlay from '../../components/LoadingOverlay.vue';
import { defineForm, field, isValidForm } from 'vue-yup-form';
import * as yup from 'yup';
import { userErrorMessages } from '../../utils/errors/auth/users';

// États
const isLoading = ref(false);
const requestSent = ref(false);
const formSubmitted = ref(false);

const touchedFields = reactive({
    email: false
});

// Services
const toast = useToast();

// Validation du formulaire
const form = defineForm({
    email: field(
        '',
        yup
            .string()
            .required(userErrorMessages.required.email)
            .email(userErrorMessages.format.email)
    )
});

type FormFields = 'email';

const showError = (fieldName: FormFields) =>
    (touchedFields[fieldName] || formSubmitted.value) &&
    !!form[fieldName].$error;

async function handleSubmit() {
    formSubmitted.value = true;

    if (!(await isValidForm(form))) return;

    isLoading.value = true;

    try {
        await Database.create('security/action', {
            actionType: 'RESET_PASSWORD',
            email: form.email.$value.trim()
        });

        requestSent.value = true;
        toast.success('Instructions envoyées par email');
    } catch (error) {
        console.error('Erreur lors de la demande de réinitialisation:', error);
        requestSent.value = true;
    } finally {
        isLoading.value = false;
    }
}

function resetForm() {
    form.email.$value = '';
    formSubmitted.value = false;
    touchedFields.email = false;
    requestSent.value = false;
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
