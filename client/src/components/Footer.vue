<template>
  <footer class="border-border border-t bg-[#0297AF40] pt-8 pb-6">
    <div class="w-full px-4 xl:px-0">
      <!-- Logo centré -->
      <div class="mb-8 flex justify-center">
        <router-link to="/">
          <img :src="logoUrl" alt="SolidHive Logo" class="mx-auto h-20 w-auto" />
        </router-link>
      </div>

      <!-- Liens avec marges latérales -->
      <div class="mb-8 grid grid-cols-1 gap-8 px-6 md:grid-cols-4 xl:px-20">
        <!-- Plateforme -->
        <div>
          <h3 class="font-title text-secondary mb-4 text-center text-lg md:text-left">
            Notre Plateforme
          </h3>
          <ul class="space-y-2 text-center md:text-left">
            <li>
              <router-link to="/" class="hover:underline">Qui sommes-nous ?</router-link>
            </li>
            <li>
              <router-link to="/associations" class="hover:underline">
                Trouver une Association
              </router-link>
            </li>
            <li>
              <router-link to="/projets" class="hover:underline">Devenir Bénévole</router-link>
            </li>
            <li>
              <router-link to="/connexion" class="hover:underline">
                Inscrire une association
              </router-link>
            </li>
          </ul>
        </div>
        <!-- Ressources -->
        <div>
          <h3 class="font-title text-secondary mb-4 text-center text-lg md:text-left">
            Ressources
          </h3>
          <ul class="space-y-2 text-center md:text-left">
            <li>
              <a href="#" class="hover:underline">Newletter</a>
            </li>
            <li><a href="#" class="hover:underline">FAQ</a></li>
          </ul>
        </div>
        <!-- Références légales -->
        <div>
          <h3 class="font-title text-secondary mb-4 text-center text-lg md:text-left">CGU</h3>
          <ul class="space-y-2 text-center md:text-left">
            <li>
              <a href="#" class="hover:underline">Mentions légales</a>
            </li>
            <li>
              <a href="#" class="hover:underline">Gestion des cookies</a>
            </li>
          </ul>
        </div>
        <!-- Contact -->
        <div>
          <h3 class="font-title text-secondary mb-4 text-center text-lg md:text-left">Contact</h3>
          <ul class="space-y-2 text-center md:text-left">
            <li>
              <a href="#" class="hover:underline">Contactez notre équipe</a>
            </li>
            <li>
              <div class="mt-2 flex justify-center gap-4 md:justify-start">
                <a href="#" aria-label="Facebook">
                  <Facebook class="text-secondary h-6 w-6" />
                </a>
                <a href="#" aria-label="Instagram">
                  <Instagram class="text-secondary h-6 w-6" />
                </a>
                <a href="#" aria-label="LinkedIn">
                  <Linkedin class="text-secondary h-6 w-6" />
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Barre de séparation alignée -->
      <div class="mx-auto px-6 xl:px-16">
        <div class="border-secondary my-4 border-t-2" />
      </div>

      <!-- Droits réservés -->
      <div class="text-secondary text-center text-sm">
        © {{ new Date().getFullYear() }} SolidHive. Tous droits réservés.
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
  import logoUrl from '@/assets/images/logo-solidhive.png';
  import { Facebook, Instagram, Linkedin } from 'lucide-vue-next';
</script>
