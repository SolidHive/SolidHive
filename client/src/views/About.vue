<template>
  <PageContainer>
    <div class="flex flex-col gap-y-24 overflow-x-hidden">
      <!-- Hero -->
      <section class="grid items-stretch gap-12 xl:grid-cols-2 xl:py-8">
        <div class="flex flex-col justify-between space-y-8">
          <div class="space-y-8">
            <span
              class="border-accent/30 bg-accent/10 text-accent inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold"
            >
              <Heart class="h-4 w-4" />
              Qui sommes-nous ?
            </span>

            <h1 class="font-title text-secondary text-3xl leading-tight sm:text-4xl lg:text-5xl">
              Une ruche au service de la solidarité
            </h1>

            <p class="font-paragraph text-muted-foreground text-sm leading-relaxed lg:text-lg">
              SolidHive est une plateforme française qui connecte citoyens, bénévoles et
              associations engagées. Notre mission : rendre la solidarité accessible, visible et
              concrète pour tous. Née en 2024, la plateforme rassemble chaque jour davantage de
              personnes autour d'une même conviction — ensemble, on va plus loin.
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button
              class="bg-primary hover:bg-primary/90 px-6 py-2 text-sm text-white sm:text-base"
              @click="router.push('/associations')"
            >
              Découvrir les associations
            </Button>
            <Button
              variant="outline"
              class="border-accent text-accent hover:bg-accent px-6 py-2 text-sm transition-colors hover:text-white sm:text-base"
              @click="router.push('/newsletter')"
            >
              Rejoindre la newsletter
            </Button>
          </div>
        </div>

        <div
          class="relative overflow-hidden rounded-3xl shadow-2xl xl:min-h-0"
          style="min-height: 300px"
        >
          <img
            src="@/assets/images/about-premium/gestion-des-membres.jpg"
            alt="Bénévoles et associations engagées"
            class="h-full w-full object-cover"
          />
          <div
            class="from-primary/70 via-primary/20 absolute inset-0 bg-gradient-to-t to-transparent"
          />
          <div class="absolute right-0 bottom-0 left-0 p-6">
            <p class="font-title text-lg font-bold text-white">Ensemble pour aller plus loin</p>
            <p class="font-paragraph mt-1 text-sm text-white/80">
              Des milliers de citoyens et associations unis sur SolidHive.
            </p>
          </div>
        </div>
      </section>

      <!-- Histoire -->
      <section class="grid items-center gap-12 lg:grid-cols-2">
        <div class="space-y-6">
          <span
            class="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold"
          >
            <BookOpen class="h-4 w-4" />
            Notre histoire
          </span>
          <h2 class="font-title text-secondary text-2xl sm:text-3xl lg:text-4xl">
            Tout a commencé par une conviction simple
          </h2>
          <p class="font-paragraph text-muted-foreground text-sm leading-relaxed lg:text-base">
            SolidHive est né d'un constat : les associations qui font un travail formidable manquent
            souvent de visibilité et d'outils adaptés au monde numérique. De l'autre côté, des
            milliers de citoyens veulent agir mais ne savent pas où donner de la tête, ni à qui
            faire confiance.
          </p>
          <p class="font-paragraph text-muted-foreground text-sm leading-relaxed lg:text-base">
            Nous avons construit SolidHive pour combler ce fossé — une plateforme moderne,
            transparente et engagée, au service de ceux qui donnent et de ceux qui œuvrent chaque
            jour pour un monde meilleur.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="border-border rounded-2xl border bg-white p-6 shadow-md">
            <div class="bg-accent/10 mb-3 flex h-10 w-10 items-center justify-center rounded-xl">
              <Heart class="text-accent h-5 w-5" />
            </div>
            <p class="font-subtitle text-secondary text-sm font-semibold">Nés de l'engagement</p>
            <p class="font-paragraph text-muted-foreground mt-1 text-xs">
              Une équipe convaincue que la technologie peut servir la solidarité.
            </p>
          </div>
          <div class="border-border rounded-2xl border bg-white p-6 shadow-md">
            <div class="bg-primary/10 mb-3 flex h-10 w-10 items-center justify-center rounded-xl">
              <Shield class="text-primary h-5 w-5" />
            </div>
            <p class="font-subtitle text-secondary text-sm font-semibold">100% transparents</p>
            <p class="font-paragraph text-muted-foreground mt-1 text-xs">
              Associations vérifiées, dons tracés, données sécurisées.
            </p>
          </div>
          <div class="border-border rounded-2xl border bg-white p-6 shadow-md">
            <div class="bg-primary/10 mb-3 flex h-10 w-10 items-center justify-center rounded-xl">
              <Users class="text-primary h-5 w-5" />
            </div>
            <p class="font-subtitle text-secondary text-sm font-semibold">Communauté active</p>
            <p class="font-paragraph text-muted-foreground mt-1 text-xs">
              Des donateurs, bénévoles et associations réunis en un seul endroit.
            </p>
          </div>
          <div class="border-border rounded-2xl border bg-white p-6 shadow-md">
            <div class="bg-accent/10 mb-3 flex h-10 w-10 items-center justify-center rounded-xl">
              <Globe class="text-accent h-5 w-5" />
            </div>
            <p class="font-subtitle text-secondary text-sm font-semibold">Impact réel</p>
            <p class="font-paragraph text-muted-foreground mt-1 text-xs">
              Chaque action est mesurée et visible pour ceux qui donnent.
            </p>
          </div>
        </div>
      </section>

      <!-- Mission -->
      <section>
        <div class="mb-10 text-center">
          <span
            class="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold"
          >
            <Target class="h-4 w-4" />
            Notre mission
          </span>
          <h2 class="font-title text-secondary mt-4 text-2xl sm:text-3xl lg:text-4xl">
            Trois piliers pour un impact durable
          </h2>
          <p
            class="font-paragraph text-muted-foreground mx-auto mt-4 max-w-2xl text-sm lg:text-base"
          >
            Nous croyons que chaque geste compte. SolidHive a été conçu pour amplifier l'impact des
            associations et faciliter l'engagement de chacun.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div class="border-border space-y-4 rounded-2xl border bg-white p-6 shadow-md">
            <div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-2xl">
              <Search class="text-primary h-6 w-6" />
            </div>
            <h3 class="font-subtitle text-secondary text-base font-semibold lg:text-lg">
              Visibilité
            </h3>
            <p class="font-paragraph text-muted-foreground text-sm lg:text-base">
              Donner de la visibilité aux associations engagées grâce à une interface moderne, des
              profils détaillés et des outils de mise en avant efficaces.
            </p>
          </div>

          <div class="border-border space-y-4 rounded-2xl border bg-white p-6 shadow-md">
            <div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-2xl">
              <HandHeart class="text-primary h-6 w-6" />
            </div>
            <h3 class="font-subtitle text-secondary text-base font-semibold lg:text-lg">
              Engagement
            </h3>
            <p class="font-paragraph text-muted-foreground text-sm lg:text-base">
              Faciliter l'engagement des donateurs et bénévoles grâce à une expérience fluide, des
              filtres personnalisés et un suivi concret de leur impact.
            </p>
          </div>

          <div class="border-border space-y-4 rounded-2xl border bg-white p-6 shadow-md">
            <div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-2xl">
              <Shield class="text-primary h-6 w-6" />
            </div>
            <h3 class="font-subtitle text-secondary text-base font-semibold lg:text-lg">
              Confiance
            </h3>
            <p class="font-paragraph text-muted-foreground text-sm lg:text-base">
              Garantir la transparence à chaque étape : associations vérifiées, dons tracés, données
              sécurisées. Vous voyez tout, tout le temps.
            </p>
          </div>
        </div>
      </section>

      <!-- Valeurs -->
      <section class="bg-primary/5 rounded-2xl px-8 py-12">
        <div class="mb-10 text-center">
          <span
            class="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold"
          >
            <Star class="h-4 w-4" />
            Nos valeurs
          </span>
          <h2 class="font-title text-secondary mt-4 text-2xl sm:text-3xl lg:text-4xl">
            Ce en quoi nous croyons
          </h2>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="value in values"
            :key="value.label"
            class="border-border rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div class="bg-primary/10 mb-3 flex h-10 w-10 items-center justify-center rounded-full">
              <component :is="value.icon" class="text-primary h-5 w-5" />
            </div>
            <p class="font-subtitle text-secondary text-sm font-semibold">{{ value.label }}</p>
            <p class="font-paragraph text-muted-foreground mt-1 text-xs">{{ value.description }}</p>
          </div>
        </div>
      </section>

      <!-- Équipe / Engagement -->
      <section class="grid items-center gap-12 lg:grid-cols-2">
        <div class="order-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:order-1">
          <div
            v-for="item in commitments"
            :key="item.title"
            class="border-border space-y-2 rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div class="bg-accent/10 flex h-10 w-10 items-center justify-center rounded-xl">
              <component :is="item.icon" class="text-accent h-5 w-5" />
            </div>
            <p class="font-subtitle text-secondary text-sm font-semibold">{{ item.title }}</p>
            <p class="font-paragraph text-muted-foreground text-xs">{{ item.description }}</p>
          </div>
        </div>
        <div class="order-1 space-y-6 lg:order-2">
          <span
            class="border-accent/30 bg-accent/10 text-accent inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold"
          >
            <Handshake class="h-4 w-4" />
            Nos engagements
          </span>
          <h2 class="font-title text-secondary text-2xl sm:text-3xl lg:text-4xl">
            Une plateforme construite sur la confiance
          </h2>
          <p class="font-paragraph text-muted-foreground text-sm leading-relaxed lg:text-base">
            Nous ne sommes pas un simple annuaire d'associations. SolidHive s'engage à vérifier
            chaque structure référencée, à garantir la sécurité des paiements et à protéger les
            données personnelles de ses utilisateurs dans le strict respect du RGPD.
          </p>
          <p class="font-paragraph text-muted-foreground text-sm leading-relaxed lg:text-base">
            Nos équipes sont disponibles pour accompagner les associations à chaque étape de leur
            présence sur la plateforme. Parce qu'une association bien outillée, c'est un impact
            démultiplié.
          </p>
        </div>
      </section>

      <!-- CTA -->
      <section class="bg-primary rounded-2xl px-8 py-14 text-center">
        <h2 class="font-title mb-4 text-2xl text-white sm:text-3xl lg:text-4xl">
          Prêt à faire partie de la ruche ?
        </h2>
        <p class="font-paragraph mx-auto mb-8 max-w-xl text-sm text-white/80 lg:text-base">
          Rejoignez des milliers de personnes qui soutiennent activement les associations et
          contribuent à un monde plus solidaire.
        </p>
        <div class="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Button
            v-if="!isAuthenticated"
            class="text-primary bg-white px-6 py-2 text-sm font-semibold hover:bg-white/90 sm:text-base"
            @click="router.push('/register')"
          >
            Créer mon compte
          </Button>
          <Button
            class="hover:text-primary border border-white bg-transparent px-6 py-2 text-sm text-white transition-colors hover:bg-white sm:text-base"
            @click="router.push('/associations')"
          >
            Explorer les associations
          </Button>
        </div>
      </section>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  import PageContainer from '@/components/PageContainer.vue';
  import { Button } from '@/components/ui/button';
  import {
    Heart,
    Search,
    HandHeart,
    Shield,
    Users,
    Zap,
    Star,
    Globe,
    BookOpen,
    Target,
    Handshake,
    Lock,
    CheckCircle,
    Gem,
  } from 'lucide-vue-next';

  const router = useRouter();
  const authStore = useAuthStore();
  const isAuthenticated = computed(() => authStore.isAuthenticated());

  const values = [
    {
      icon: Users,
      label: 'Communauté',
      description: "Nous croyons en la force du collectif et de l'entraide au quotidien.",
    },
    {
      icon: Zap,
      label: 'Simplicité',
      description: 'Une plateforme pensée pour être accessible à tous, sans barrière technique.',
    },
    {
      icon: Star,
      label: 'Excellence',
      description: 'Des outils de qualité au service de causes qui méritent le meilleur.',
    },
    {
      icon: Globe,
      label: 'Impact',
      description: "Chaque action compte. Nous mesurons et montrons l'impact réel de vos dons.",
    },
  ];

  const commitments = [
    {
      icon: CheckCircle,
      title: 'Associations vérifiées',
      description: "Chaque association est contrôlée avant d'être référencée sur la plateforme.",
    },
    {
      icon: Lock,
      title: 'Données protégées',
      description: 'Vos informations personnelles sont sécurisées et traitées selon le RGPD.',
    },
    {
      icon: Gem,
      title: 'Dons intégraux',
      description: '100% des dons parviennent aux associations, sans frais cachés.',
    },
    {
      icon: Handshake,
      title: 'Support dédié',
      description: 'Une équipe disponible pour accompagner associations et donateurs.',
    },
  ];
</script>
