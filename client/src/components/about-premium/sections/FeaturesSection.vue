<template>
  <section>
    <!-- Titre principal -->
    <div class="mb-12">
      <h2 class="font-title text-secondary mb-8 text-2xl sm:text-3xl lg:text-4xl">
        Les fonctionnalités disponibles
      </h2>
    </div>

    <!-- Grille des features responsive -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:flex lg:h-[70vh] lg:flex-row">
      <!-- Card 1: Centralisation des données -->
      <div
        class="from-secondary-900 relative overflow-hidden rounded-2xl text-white max-md:pb-18 md:max-lg:aspect-square lg:w-1/3"
      >
        <div
          class="absolute inset-0 bg-cover bg-center"
          :style="{ backgroundImage: `url(${CentralisationDesDonneesImage})` }"
        ></div>
        <div class="relative z-10">
          <div
            class="flex items-center gap-3 px-3 py-3"
            style="
              background: linear-gradient(rgba(81, 13, 109, 0.8) 0%, rgba(81, 13, 109, 0.533) 100%);
            "
          >
            <Server :size="28" class="text-white" />
            <h3 class="font-title text-lg font-semibold sm:text-xl">Centralisation des données</h3>
          </div>
          <p
            class="px-3 pb-3 text-xs leading-relaxed text-white/90 sm:text-sm"
            style="
              background: linear-gradient(
                rgba(81, 13, 109, 0.533) 0%,
                #00000061 30%,
                rgba(0, 0, 0, 0) 100%
              );
            "
          >
            Regroupez toutes les informations de votre association au même endroit : membres,
            adhésions, dons, événements et échanges. Accédez rapidement à des données claires, à
            jour, et faciles à gérer au quotidien.
          </p>
        </div>
      </div>

      <!-- Container pour Cards 2 et 3 -->
      <div
        class="contents md:contents lg:flex lg:h-full lg:w-1/3 lg:flex-col lg:gap-8 lg:[&>div]:h-1/2"
      >
        <!-- Card 2: Connexion avec vos applis -->
        <div
          class="from-secondary-900 auto relative overflow-hidden rounded-2xl text-white max-md:pb-18 md:max-lg:aspect-square"
        >
          <div
            class="absolute inset-0 bg-cover bg-center"
            :style="{ backgroundImage: `url(${GestionDesMembresImage})` }"
          ></div>
          <div class="relative z-10">
            <div
              class="flex items-center gap-3 px-3 py-3"
              style="
                background: linear-gradient(
                  rgba(81, 13, 109, 0.8) 0%,
                  rgba(81, 13, 109, 0.533) 100%
                );
              "
            >
              <Waypoints :size="28" class="text-white" />
              <h3 class="font-title text-lg font-semibold sm:text-xl">Connexion avec vos applis</h3>
            </div>
            <p
              class="px-3 pb-3 text-xs leading-relaxed text-white/90 sm:text-sm"
              style="
                background: linear-gradient(
                  rgba(81, 13, 109, 0.533) 0%,
                  #00000061 30%,
                  rgba(0, 0, 0, 0) 100%
                );
              "
            >
              Connectez facilement vos applications préférées pour automatiser les tâches
              répétitives et gagner du temps.
            </p>
          </div>
        </div>

        <!-- Card 3: Automatisation de vos mail -->
        <div
          class="from-secondary-900 relative overflow-hidden rounded-2xl text-white max-md:pb-18 md:max-lg:aspect-square"
        >
          <div
            class="absolute inset-0 bg-cover bg-center"
            :style="{ backgroundImage: `url(${AutomatisationMailImage})` }"
          ></div>
          <div class="relative z-10">
            <div
              class="flex items-center gap-3 px-3 py-3"
              style="
                background: linear-gradient(
                  rgba(81, 13, 109, 0.8) 0%,
                  rgba(81, 13, 109, 0.533) 100%
                );
              "
            >
              <Send :size="28" class="text-white" />
              <h3 class="font-title text-lg font-semibold sm:text-xl">
                Automatisation de vos mail
              </h3>
            </div>
            <p
              class="px-3 pb-3 text-xs leading-relaxed text-white/90 sm:text-sm"
              style="
                background: linear-gradient(
                  rgba(81, 13, 109, 0.533) 0%,
                  #00000061 30%,
                  rgba(0, 0, 0, 0) 100%
                );
              "
            >
              Automatisez l'envoi de vos emails pour rester en contact avec vos membres sans effort.
            </p>
          </div>
        </div>
      </div>

      <!-- Card 4: Cagnottes, billetteries... -->
      <div
        class="from-secondary-900 relative overflow-hidden rounded-2xl text-white max-md:pb-18 md:max-lg:aspect-square lg:aspect-auto lg:w-1/3"
      >
        <div
          class="absolute inset-0 bg-cover bg-center"
          :style="{ backgroundImage: `url(${CagnottesBilletteriesImage})` }"
        ></div>
        <div class="relative z-10">
          <div
            class="flex items-center gap-3 px-3 py-3"
            style="
              background: linear-gradient(rgba(81, 13, 109, 0.8) 0%, rgba(81, 13, 109, 0.533) 100%);
            "
          >
            <CircleDollarSign :size="28" class="text-white" />
            <h3 class="font-title text-lg font-semibold sm:text-xl">Cagnottes, billetteries...</h3>
          </div>
          <p
            class="px-3 pb-3 text-xs leading-relaxed text-white/90 sm:text-sm"
            style="
              background: linear-gradient(
                rgba(81, 13, 109, 0.533) 0%,
                #00000061 30%,
                rgba(0, 0, 0, 0) 100%
              );
            "
          >
            Gérez facilement les cagnottes, billetteries et autres collectes de fonds pour vos
            événements.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { Server, Waypoints, CircleDollarSign, Send } from 'lucide-vue-next';
  import CentralisationDesDonneesImage from '@/assets/images/about-premium/centralisation-des-donnees.jpg';
  import GestionDesMembresImage from '@/assets/images/about-premium/gestion-des-membres.jpg';
  import AutomatisationMailImage from '@/assets/images/about-premium/automatisation-mail.jpg';
  import CagnottesBilletteriesImage from '@/assets/images/about-premium/cagnottes-billetteries.jpg';
</script>
