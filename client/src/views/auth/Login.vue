<template>
    <div
        class="min-h-screen flex items-center justify-center bg-gray-100 py-6 px-4"
    >
        <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h1
                class="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-green-600 to-emerald-500 inline-block text-transparent bg-clip-text w-full"
            >
                Connexion
            </h1>
            <p class="text-gray-600 text-center mb-6">
                Accédez à votre espace personnel
            </p>

            <form class="space-y-5" @submit.prevent="handleLogin">
                <InputForm
                    v-model="form.email.$value"
                    label-value="Email"
                    input-name="email"
                    type="email"
                    placeholder="votre@email.com"
                    :error-message="
                        showError('email') ? form.email.$error?.message : ''
                    "
                    :error-state="showError('email')"
                    @blur="touchedFields.email = true"
                />

                <InputForm
                    v-model="form.password.$value"
                    label-value="Mot de passe"
                    input-name="password"
                    type="password"
                    placeholder="Votre mot de passe"
                    :error-message="
                        showError('password')
                            ? form.password.$error?.message
                            : ''
                    "
                    :error-state="showError('password')"
                    @blur="touchedFields.password = true"
                >
                    <template #hint>
                        <div>
                            Le mot de passe doit contenir au moins 10
                            caractères, une majuscule, une minuscule, un chiffre
                            et un symbole.
                        </div>
                    </template>
                </InputForm>

                <div class="flex justify-end -mt-1">
                    <router-link
                        to="/forgot-password"
                        class="text-sm text-green-600 hover:underline"
                    >
                        Mot de passe oublié?
                    </router-link>
                </div>

                <div
                    class="flex flex-col-reverse sm:flex-row justify-between items-center mt-8 gap-y-4"
                >
                    <div
                        class="text-gray-600 text-sm text-center sm:text-left w-full sm:w-auto"
                    >
                        Pas encore de compte?
                        <router-link
                            to="/register"
                            class="text-green-600 hover:underline font-medium"
                        >
                            S'inscrire
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
                                    ? 'Connexion en cours...'
                                    : 'Se connecter'
                            }}
                        </div>
                    </button>
                </div>
            </form>
        </div>
    </div>
    <LoadingOverlay :show="isLoading" message="Connexion en cours..." />
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '../../stores/auth';
import LoadingOverlay from '../../components/LoadingOverlay.vue';
import InputForm from '../../components/form/InputForm.vue';
import { defineForm, field, isValidForm } from 'vue-yup-form';
import * as yup from 'yup';
import { userErrorMessages } from '../../utils/errors/auth/users';

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const isLoading = ref(false);
const formError = ref('');
const formSubmitted = ref(false);

const touchedFields = reactive({
    email: false,
    password: false
});

type FormFields = 'email' | 'password';

const showError = (fieldName: FormFields) =>
    (touchedFields[fieldName] || formSubmitted.value) &&
    !!form[fieldName].$error;

const form = defineForm({
    email: field(
        '',
        yup
            .string()
            .required(userErrorMessages.required.email)
            .email(userErrorMessages.format.email)
    ),

    password: field(
        '',
        yup
            .string()
            .required(userErrorMessages.required.password)
            .matches(
                userErrorMessages.patterns.password,
                userErrorMessages.password.invalid
            )
    )
});

/**
 * Récupère le message d'erreur basé sur le statut HTTP
 */
function getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = (
            error as {
                response: { status: number; data?: { message?: string } };
            }
        ).response;
        const status = response.status;
        const message = response.data?.message;

        return status in userErrorMessages.apiErrors
            ? message ||
                  userErrorMessages.apiErrors[
                      status as keyof typeof userErrorMessages.apiErrors
                  ]
            : userErrorMessages.apiErrors.unknown;
    }

    return userErrorMessages.apiErrors.unknown;
}

async function handleLogin() {
    formSubmitted.value = true;
    formError.value = '';

    if (!(await isValidForm(form))) return;

    isLoading.value = true;

    try {
        authStore.error = null;

        const result = await authStore.login({
            email: form.email.$value.trim(),
            password: form.password.$value
        });

        if (result) {
            toast.success('Connexion réussie !');
            router.push('/');
        } else {
            const errorText = authStore.error as string | null;

            if (errorText && errorText.includes("n'est pas vérifié")) {
                formError.value = userErrorMessages.apiErrors[401];
            } else if (errorText && errorText.includes('Trop de tentatives')) {
                formError.value = userErrorMessages.apiErrors[429];
            } else {
                formError.value = userErrorMessages.auth.invalidCredentials;
            }
            toast.error(formError.value);
        }
    } catch (error) {
        formError.value = getErrorMessage(error);
        toast.error(formError.value);
    } finally {
        isLoading.value = false;
    }
}
</script>
