<template>
  <PageContainer>
    <div class="flex flex-col gap-y-16 overflow-x-hidden">
      <!-- Hero -->
      <section class="space-y-4 py-8 text-center">
        <span
          class="border-accent/30 bg-accent/10 text-accent inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold"
        >
          <FileText class="h-4 w-4" />
          Mentions légales
        </span>
        <h1
          class="font-title text-secondary mx-auto max-w-2xl text-3xl leading-tight sm:text-4xl lg:text-5xl"
        >
          Mentions légales
        </h1>
        <p class="font-paragraph text-muted-foreground text-sm">Dernière mise à jour : mars 2026</p>
      </section>

      <!-- Contenu -->
      <section class="mx-auto mb-2 w-full max-w-3xl space-y-10">
        <LegalBlock
          v-for="section in sections"
          :key="section.title"
          :title="section.title"
          :icon="section.icon"
          :content="section.content"
        />
      </section>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  import PageContainer from '@/components/PageContainer.vue';
  import {
    FileText,
    Building,
    Globe,
    Mail,
    ShieldCheck,
    Scale,
    AlertTriangle,
  } from 'lucide-vue-next';

  // Inline sub-component for clean rendering
  import { defineComponent, h } from 'vue';

  const LegalBlock = defineComponent({
    props: {
      title: { type: String, default: '' },
      icon: { type: Object, default: () => ({}) },
      content: { type: Array as () => string[], default: () => [] },
    },
    setup(props) {
      return () =>
        h('div', { class: 'space-y-4' }, [
          h('div', { class: 'flex items-center gap-3' }, [
            h(
              'div',
              { class: 'flex h-9 w-9 items-center justify-center rounded-full bg-primary/10' },
              [h(props.icon!, { class: 'h-5 w-5 text-primary' })]
            ),
            h('h2', { class: 'font-title text-secondary text-xl sm:text-2xl' }, props.title),
          ]),
          h(
            'div',
            { class: 'rounded-2xl border border-border bg-white p-6 shadow-sm space-y-3' },
            props.content!.map((line) =>
              h(
                'p',
                { class: 'font-paragraph text-sm text-muted-foreground leading-relaxed' },
                line
              )
            )
          ),
        ]);
    },
  });

  const sections = [
    {
      icon: Building,
      title: 'Éditeur du site',
      content: [
        'Raison sociale : SolidHive SAS',
        'Adresse : Paris, France',
        'Email : contact@solidhive.fr',
        "Directeur de la publication : L'équipe SolidHive",
      ],
    },
    {
      icon: Globe,
      title: 'Hébergement',
      content: [
        'Le site SolidHive est hébergé par un prestataire technique situé en Union Européenne.',
        'Les données sont stockées sur des serveurs sécurisés conformes aux exigences du RGPD.',
      ],
    },
    {
      icon: ShieldCheck,
      title: 'Propriété intellectuelle',
      content: [
        "L'ensemble du contenu présent sur le site SolidHive (textes, images, logos, icônes, graphismes) est protégé par le droit d'auteur et appartient à SolidHive ou à ses partenaires.",
        'Toute reproduction, distribution ou utilisation sans autorisation expresse est interdite.',
      ],
    },
    {
      icon: Scale,
      title: 'Responsabilité',
      content: [
        "SolidHive s'efforce de maintenir les informations du site à jour et exactes, mais ne peut garantir l'exhaustivité ou l'exactitude de ces informations.",
        "SolidHive ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation du site.",
        "Les associations présentes sur la plateforme sont responsables du contenu qu'elles publient.",
      ],
    },
    {
      icon: Mail,
      title: 'Contact',
      content: [
        'Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter à : support@solidhive.fr',
      ],
    },
    {
      icon: AlertTriangle,
      title: 'Droit applicable',
      content: [
        'Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux compétents sont ceux du ressort de Paris.',
      ],
    },
  ];
</script>
