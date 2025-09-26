<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <!-- En-tête du profil -->
      <div class="mb-6 overflow-hidden rounded-lg bg-white shadow">
        <div class="h-32 bg-gradient-to-r from-green-500 to-emerald-500 md:h-48" />
        <div class="relative px-6 pb-6">
          <div class="flex flex-col md:flex-row md:items-end">
            <!-- Avatar -->
            <div class="absolute -mt-16 md:-mt-20">
              <div
                class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-lg md:h-32 md:w-32"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-16 w-16 text-gray-400 md:h-20 md:w-20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>

            <!-- Nom et informations principales -->
            <div class="mt-16 md:ml-40 md:mt-2">
              <h1 v-if="profile" class="text-2xl font-bold text-gray-800">
                {{ profile.name }} {{ profile.firstname }}
              </h1>
              <p v-if="profile" class="mt-1 text-gray-600">
                {{ profile.email }}
              </p>
              <p v-if="profile" class="mt-1 text-sm text-gray-500">
                Membre depuis
                {{ formatDate(profile.createdAt, true) }}
              </p>
            </div>

            <!-- Boutons d'action -->
            <div class="mt-4 flex space-x-2 md:ml-auto md:mt-0">
              <button
                class="flex items-center rounded-lg border border-green-600 px-4 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Modifier le profil
              </button>
              <button
                class="flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Changer le mot de passe
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenu du profil -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <!-- Informations personnelles -->
        <div class="col-span-2 rounded-lg bg-white p-6 shadow">
          <h2 class="mb-4 flex items-center text-lg font-semibold text-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="mr-2 h-5 w-5 text-green-600"
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
            Informations personnelles
          </h2>

          <div v-if="profile" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <!-- Nom -->
              <div class="rounded-lg bg-gray-50 p-3">
                <div class="text-sm font-medium text-gray-500">Nom</div>
                <div class="mt-1 font-medium text-gray-800">
                  {{ profile.name || 'Non renseigné' }}
                </div>
              </div>

              <!-- Prénom -->
              <div class="rounded-lg bg-gray-50 p-3">
                <div class="text-sm font-medium text-gray-500">Prénom</div>
                <div class="mt-1 font-medium text-gray-800">
                  {{ profile.firstname || 'Non renseigné' }}
                </div>
              </div>

              <!-- Email -->
              <div class="rounded-lg bg-gray-50 p-3">
                <div class="text-sm font-medium text-gray-500">Email</div>
                <div class="mt-1 font-medium text-gray-800">
                  {{ profile.email }}
                </div>
              </div>

              <!-- Téléphone -->
              <div class="rounded-lg bg-gray-50 p-3">
                <div class="text-sm font-medium text-gray-500">Téléphone</div>
                <div class="mt-1 font-medium text-gray-800">
                  {{ profile.phone || 'Non renseigné' }}
                </div>
              </div>

              <!-- SIRET -->
              <div class="col-span-1 rounded-lg bg-gray-50 p-3 md:col-span-2">
                <div class="text-sm font-medium text-gray-500">SIRET</div>
                <div class="mt-1 font-medium text-gray-800">
                  {{ profile.siret || 'Non renseigné' }}
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex h-40 items-center justify-center rounded-lg bg-gray-50">
            <div class="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="mx-auto mb-2 h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              <p class="text-gray-500">Aucune information disponible</p>
            </div>
          </div>
        </div>

        <!-- Informations du compte -->
        <div class="rounded-lg bg-white p-6 shadow">
          <h2 class="mb-4 flex items-center text-lg font-semibold text-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="mr-2 h-5 w-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Détails du compte
          </h2>

          <div v-if="profile" class="space-y-3">
            <div class="rounded-lg bg-gray-50 p-3">
              <div class="text-sm font-medium text-gray-500">Date d'inscription</div>
              <div class="mt-1 font-medium text-gray-800">
                {{ formatDate(profile.createdAt) }}
              </div>
            </div>

            <div class="rounded-lg bg-gray-50 p-3">
              <div class="text-sm font-medium text-gray-500">Dernière connexion</div>
              <div class="mt-1 font-medium text-gray-800">
                {{ formatDate(new Date().toISOString()) }}
              </div>
            </div>

            <div class="mt-6">
              <a href="#" class="flex items-center text-sm text-red-600 hover:text-red-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="mr-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Supprimer mon compte
              </a>
            </div>
          </div>

          <div v-else class="py-8 text-center text-gray-500">Chargement des détails...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import Database from '../utils/database.utils';
  import type { User } from '../interfaces/user.interface';

  const profile = ref<User | null>(null);

  function formatDate(dateString: string, shortFormat = false): string {
    const date = new Date(dateString);

    if (shortFormat) {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    }

    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  async function loadProfile() {
    try {
      const data = await Database.getAll('auth/profile');
      profile.value = data || null;
    } catch (err) {
      console.error('Erreur lors du chargement du profil:', err);
      profile.value = null;
    }
  }

  onMounted(() => {
    loadProfile();
  });
</script>
