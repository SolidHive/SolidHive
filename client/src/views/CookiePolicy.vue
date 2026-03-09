<template>
  <PageContainer>
    <div class="flex flex-col gap-y-16 overflow-x-hidden">
      <!-- Hero -->
      <section class="space-y-4 py-8 text-center">
        <span
          class="border-accent/30 bg-accent/10 text-accent inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold"
        >
          <Cookie class="h-4 w-4" />
          Politique des cookies
        </span>
        <h1
          class="font-title text-secondary mx-auto max-w-2xl text-3xl leading-tight sm:text-4xl lg:text-5xl"
        >
          Gestion des cookies
        </h1>
        <p class="font-paragraph text-muted-foreground text-sm">Dernière mise à jour : mars 2026</p>
      </section>

      <!-- Intro -->
      <section class="mx-auto w-full max-w-3xl">
        <div class="bg-primary/5 space-y-3 rounded-2xl px-8 py-8">
          <p class="font-paragraph text-sm leading-relaxed lg:text-base">
            SolidHive utilise des cookies pour améliorer votre expérience de navigation, analyser
            l'utilisation du site et personnaliser le contenu. Cette page vous explique ce que sont
            les cookies, comment nous les utilisons et comment vous pouvez les gérer.
          </p>
        </div>
      </section>

      <!-- Sections -->
      <section class="mx-auto w-full max-w-3xl space-y-10">
        <div v-for="section in sections" :key="section.title" class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-full">
              <component :is="section.icon" class="text-primary h-5 w-5" />
            </div>
            <h2 class="font-title text-secondary text-xl sm:text-2xl">{{ section.title }}</h2>
          </div>
          <div class="border-border space-y-3 rounded-2xl border bg-white p-6 shadow-sm">
            <p
              v-for="(line, i) in section.content"
              :key="i"
              class="font-paragraph text-muted-foreground text-sm leading-relaxed"
            >
              {{ line }}
            </p>
          </div>
        </div>

        <!-- Types de cookies -->
        <div class="mb-2 space-y-4">
          <div class="flex items-center gap-3">
            <div class="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-full">
              <List class="text-primary h-5 w-5" />
            </div>
            <h2 class="font-title text-secondary text-xl sm:text-2xl">Types de cookies utilisés</h2>
          </div>
          <div class="space-y-4">
            <div
              v-for="type in cookieTypes"
              :key="type.name"
              class="border-border rounded-2xl border bg-white p-6 shadow-sm"
            >
              <div class="mb-2 flex items-center justify-between">
                <p class="font-subtitle text-secondary text-sm font-semibold">{{ type.name }}</p>
                <span
                  :class="[
                    'rounded-full px-3 py-0.5 text-xs font-semibold',
                    type.required ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent',
                  ]"
                >
                  {{ type.required ? 'Obligatoire' : 'Optionnel' }}
                </span>
              </div>
              <p class="font-paragraph text-muted-foreground text-sm">{{ type.description }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  import PageContainer from '@/components/PageContainer.vue';
  import { Cookie, Info, Settings, List, Mail } from 'lucide-vue-next';

  const sections = [
    {
      icon: Info,
      title: "Qu'est-ce qu'un cookie ?",
      content: [
        'Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, tablette, smartphone) lors de votre visite sur un site web.',
        "Il permet au site de mémoriser vos actions et préférences (connexion, langue, etc.) pendant une période définie, afin que vous n'ayez pas à les re-saisir lors de votre prochaine visite.",
      ],
    },
    {
      icon: Settings,
      title: 'Comment gérer vos cookies ?',
      content: [
        'Vous pouvez à tout moment modifier vos préférences en matière de cookies via les paramètres de votre navigateur.',
        'La désactivation de certains cookies peut toutefois impacter le bon fonctionnement de certaines fonctionnalités du site.',
        "Pour plus d'informations, consultez l'aide de votre navigateur (Chrome, Firefox, Safari, Edge, etc.).",
      ],
    },
    {
      icon: Mail,
      title: 'Contact',
      content: [
        'Pour toute question relative à notre politique de cookies, contactez-nous à support@solidhive.fr.',
      ],
    },
  ];

  const cookieTypes = [
    {
      name: 'Cookies essentiels',
      required: true,
      description:
        'Nécessaires au fonctionnement du site. Ils permettent la navigation, la gestion de la session de connexion et la sécurité. Ils ne peuvent pas être désactivés.',
    },
    {
      name: 'Cookies de performance',
      required: false,
      description:
        "Collectent des informations anonymes sur la façon dont vous utilisez le site (pages visitées, temps passé, erreurs rencontrées) afin d'améliorer nos services.",
    },
    {
      name: 'Cookies fonctionnels',
      required: false,
      description:
        'Permettent de mémoriser vos préférences (langue, région, thème) pour personnaliser votre expérience sur SolidHive.',
    },
    {
      name: 'Cookies analytiques',
      required: false,
      description:
        "Utilisés pour comprendre l'audience du site et améliorer notre contenu. Ces données sont anonymisées et agrégées.",
    },
  ];
</script>
