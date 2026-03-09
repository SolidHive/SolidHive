<template>
  <PageContainer>
    <div class="flex flex-col gap-y-16 overflow-x-hidden">
      <section class="space-y-6 py-8 text-center">
        <span
          class="border-accent/30 bg-accent/10 text-accent inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold"
        >
          <HelpCircle class="h-4 w-4" />
          Foire aux questions
        </span>

        <h1
          class="font-title text-secondary mx-auto max-w-2xl text-3xl leading-tight sm:text-4xl lg:text-5xl"
        >
          On répond à toutes vos questions
        </h1>

        <p class="font-paragraph text-muted-foreground mx-auto max-w-xl text-sm lg:text-base">
          Vous avez une question sur SolidHive ? Retrouvez les réponses aux questions les plus
          fréquentes ci-dessous. Si vous ne trouvez pas votre réponse,
          <router-link to="/contact" class="text-accent underline-offset-4 hover:underline">
            contactez-nous
          </router-link>
          .
        </p>
      </section>

      <section class="mx-auto w-full max-w-3xl space-y-12">
        <!-- Général -->
        <div>
          <div class="mb-6 flex items-center gap-3">
            <div class="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-full">
              <Info class="text-primary h-5 w-5" />
            </div>
            <h2 class="font-title text-secondary text-xl sm:text-2xl">Général</h2>
          </div>
          <Accordion type="single" collapsible>
            <AccordionItem v-for="(faq, i) in generalFaqs" :key="i" :value="`general-${i}`">
              <AccordionTrigger>{{ faq.question }}</AccordionTrigger>
              <AccordionContent>{{ faq.answer }}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <!-- Associations -->
        <div>
          <div class="mb-6 flex items-center gap-3">
            <div class="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-full">
              <Building2 class="text-primary h-5 w-5" />
            </div>
            <h2 class="font-title text-secondary text-xl sm:text-2xl">Associations</h2>
          </div>
          <Accordion type="single" collapsible>
            <AccordionItem v-for="(faq, i) in associationFaqs" :key="i" :value="`asso-${i}`">
              <AccordionTrigger>{{ faq.question }}</AccordionTrigger>
              <AccordionContent>{{ faq.answer }}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <!-- Dons -->
        <div>
          <div class="mb-6 flex items-center gap-3">
            <div class="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-full">
              <Coins class="text-primary h-5 w-5" />
            </div>
            <h2 class="font-title text-secondary text-xl sm:text-2xl">Dons & Paiements</h2>
          </div>
          <Accordion type="single" collapsible>
            <AccordionItem v-for="(faq, i) in donationFaqs" :key="i" :value="`don-${i}`">
              <AccordionTrigger>{{ faq.question }}</AccordionTrigger>
              <AccordionContent>{{ faq.answer }}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <!-- Compte -->
        <div>
          <div class="mb-6 flex items-center gap-3">
            <div class="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-full">
              <UserCircle class="text-primary h-5 w-5" />
            </div>
            <h2 class="font-title text-secondary text-xl sm:text-2xl">Mon compte</h2>
          </div>
          <Accordion type="single" collapsible>
            <AccordionItem v-for="(faq, i) in accountFaqs" :key="i" :value="`account-${i}`">
              <AccordionTrigger>{{ faq.question }}</AccordionTrigger>
              <AccordionContent>{{ faq.answer }}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section class="bg-primary/5 mx-auto w-full max-w-3xl rounded-2xl px-8 py-10 text-center">
        <h2 class="font-title text-secondary mb-3 text-xl sm:text-2xl">
          Vous n'avez pas trouvé votre réponse ?
        </h2>
        <p class="font-paragraph text-muted-foreground mb-6 text-sm">
          Notre équipe est disponible pour répondre à toutes vos questions.
        </p>
        <Button class="bg-primary hover:bg-primary/90 text-white" @click="router.push('/contact')">
          Contacter l'équipe
        </Button>
      </section>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import PageContainer from '@/components/PageContainer.vue';
  import { Button } from '@/components/ui/button';
  import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
  } from '@/components/ui/accordion';
  import { HelpCircle, Info, Building2, Coins, UserCircle } from 'lucide-vue-next';

  const router = useRouter();

  const generalFaqs = [
    {
      question: "Qu'est-ce que SolidHive ?",
      answer:
        "SolidHive est une plateforme solidaire française qui connecte associations, bénévoles et donateurs. Elle permet aux associations de gagner en visibilité et aux citoyens de s'engager facilement pour les causes qui leur tiennent à cœur.",
    },
    {
      question: 'Comment fonctionne SolidHive ?',
      answer:
        "SolidHive met en relation des bénévoles, des donateurs et des associations pour faciliter l'engagement solidaire. Vous pouvez rechercher des projets, postuler ou soutenir en quelques clics.",
    },
    {
      question: "Est-ce que l'inscription est gratuite ?",
      answer:
        "Oui, l'inscription sur SolidHive est entièrement gratuite pour les donateurs et les bénévoles. Les associations disposent d'une offre gratuite et d'une offre premium pour des fonctionnalités avancées.",
    },
    {
      question: 'SolidHive est-elle disponible partout en France ?',
      answer:
        'Oui, SolidHive est accessible depuis toute la France métropolitaine et les DOM-TOM. La plateforme est 100% en ligne.',
    },
  ];

  const associationFaqs = [
    {
      question: 'Comment inscrire mon association sur SolidHive ?',
      answer:
        'Il suffit de créer un compte association et de remplir le formulaire de présentation avec les informations de votre structure. Votre dossier sera examiné par notre équipe avant publication.',
    },
    {
      question: 'Quelles associations peuvent rejoindre SolidHive ?',
      answer:
        "Toutes les associations loi 1901 reconnues peuvent s'inscrire sur SolidHive. Nous acceptons les associations de tous les domaines : culturel, social, environnemental, sportif, etc.",
    },
    {
      question: 'Comment puis-je contacter une association ?',
      answer:
        "Depuis la page d'une association, vous pouvez accéder à ses coordonnées et la contacter directement. Certaines associations proposent également un formulaire de contact intégré.",
    },
    {
      question: "Qu'est-ce que l'offre Premium pour les associations ?",
      answer:
        "L'offre Premium donne accès à des outils avancés : CRM de gestion des membres, statistiques détaillées, création d'événements, cagnottes en ligne, et mise en avant sur la plateforme.",
    },
  ];

  const donationFaqs = [
    {
      question: 'Comment faire un don sur SolidHive ?',
      answer:
        'Rendez-vous sur la page d\'une association, cliquez sur "Faire un don", choisissez le montant et procédez au paiement sécurisé. Vous recevrez une confirmation par email.',
    },
    {
      question: "100% de mon don va-t-il à l'association ?",
      answer:
        "Vous choisissez librement : vous pouvez reverser 100% de votre don à l'association, ou décider d'allouer un pourcentage à SolidHive pour soutenir le fonctionnement de la plateforme. Le choix vous appartient entièrement.",
    },
    {
      question: 'Mon paiement est-il sécurisé ?',
      answer:
        'Tous les paiements sont traités via Stripe, une solution de paiement certifiée PCI-DSS. Vos données bancaires ne sont jamais stockées sur nos serveurs.',
    },
    {
      question: 'Puis-je obtenir un reçu fiscal pour mon don ?',
      answer:
        "Oui, si l'association est habilitée à délivrer des reçus fiscaux, vous recevrez automatiquement un reçu par email après votre don. Vous pouvez également les retrouver dans votre espace personnel.",
    },
  ];

  const accountFaqs = [
    {
      question: 'Comment créer un compte sur SolidHive ?',
      answer:
        'Cliquez sur "Se connecter" dans le menu de navigation, puis sur "Créer un compte". Renseignez votre email et choisissez un mot de passe. Vous recevrez un email de confirmation pour activer votre compte.',
    },
    {
      question: "J'ai oublié mon mot de passe, que faire ?",
      answer:
        'Cliquez sur "Mot de passe oublié" sur la page de connexion. Vous recevrez un lien de réinitialisation par email valable 24 heures.',
    },
    {
      question: 'Comment modifier mes informations personnelles ?',
      answer:
        'Connectez-vous à votre compte, puis rendez-vous dans "Mon profil" pour modifier vos informations (nom, prénom, etc.).',
    },
    {
      question: 'Comment supprimer mon compte ?',
      answer:
        'Vous pouvez supprimer votre compte depuis la page "Mon compte". Attention, cette action est irréversible. Certaines informations pourront être conservées à des fins légales ou comptables. Pour toute demande, vous pouvez également contacter notre équipe à support@solidhive.fr.',
    },
  ];
</script>
