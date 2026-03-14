<template>
  <PageContainer>
    <div class="flex flex-col gap-y-20 overflow-x-hidden">
      <section class="grid items-center gap-8 lg:grid-cols-2 lg:py-8">
        <div class="space-y-8">
          <span
            class="border-accent/30 bg-accent/10 text-accent inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold"
          >
            <Mail class="h-4 w-4" />
            Newsletter SolidHive
          </span>

          <h1 class="font-title text-secondary text-3xl leading-tight sm:text-4xl lg:text-5xl">
            Restez au cœur de la ruche solidaire
          </h1>

          <p class="font-paragraph text-sm leading-relaxed lg:text-lg">
            Chaque nouvelle annonce publiée sur notre blog vous est directement envoyée par e‑mail.
            Soyez le premier à découvrir événements, histoires et appels à projets de la communauté
            SolidHive.
          </p>

          <ul class="space-y-4">
            <li class="flex items-start gap-3">
              <div
                class="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              >
                <Inbox class="text-primary h-4 w-4" />
              </div>
              <div>
                <p class="font-subtitle text-secondary text-sm font-semibold">
                  Directement dans votre boîte mail
                </p>
                <p class="font-paragraph text-muted-foreground text-sm">
                  Aucune connexion nécessaire, tout arrive automatiquement.
                </p>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <div
                class="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              >
                <Sparkles class="text-primary h-4 w-4" />
              </div>
              <div>
                <p class="font-subtitle text-secondary text-sm font-semibold">
                  Contenu exclusif et sélectif
                </p>
                <p class="font-paragraph text-muted-foreground text-sm">
                  Seules les annonces importantes vous sont transmises.
                </p>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <div
                class="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              >
                <ShieldCheck class="text-primary h-4 w-4" />
              </div>
              <div>
                <p class="font-subtitle text-secondary text-sm font-semibold">
                  Gratuit et sans engagement
                </p>
                <p class="font-paragraph text-muted-foreground text-sm">
                  Désinscription immédiate en un clic, à tout moment.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div class="flex justify-center lg:justify-end">
          <div class="w-full max-w-md">
            <div class="border-border rounded-2xl border bg-white p-8 shadow-xl">
              <div class="mb-6 space-y-1">
                <h2 class="font-title text-secondary text-xl font-bold sm:text-2xl">
                  Inscrivez-vous gratuitement
                </h2>
                <p class="font-paragraph text-muted-foreground text-sm">
                  Entrez votre adresse e-mail pour rejoindre la communauté.
                </p>
              </div>

              <form class="space-y-4" @submit.prevent="handleSubmit">
                <InputForm
                  v-model="email"
                  label-value="Adresse e-mail"
                  input-name="newsletter-email"
                  type="email"
                  placeholder="votre@adresse.com"
                  :error-state="showError()"
                  :error-message="getErrorMessage()"
                  @input="
                    () => {
                      touched.email = true;
                      clearValidationErrors(validationErrors, 'email');
                    }
                  "
                  @blur="() => (touched.email = true)"
                />

                <Button
                  type="submit"
                  class="bg-primary hover:bg-primary/90 w-full text-white"
                  :disabled="isSubscribing || isUnsubscribing"
                >
                  <Loader2 v-if="isSubscribing" class="mr-2 h-4 w-4 animate-spin" />
                  {{ isSubscribing ? 'Inscription en cours...' : "S'inscrire à la newsletter" }}
                </Button>

                <!-- Divider -->
                <div class="relative my-2">
                  <div class="absolute inset-0 flex items-center">
                    <span class="border-border w-full border-t" />
                  </div>
                  <div class="text-muted-foreground relative flex justify-center text-xs">
                    <span class="bg-white px-3">Déjà abonné ?</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  class="border-accent text-accent hover:bg-accent w-full transition-colors hover:text-white"
                  :disabled="isSubscribing || isUnsubscribing"
                  @click="unsubscribe"
                >
                  <Loader2 v-if="isUnsubscribing" class="mr-2 h-4 w-4 animate-spin" />
                  {{ isUnsubscribing ? 'Désinscription en cours...' : 'Me désinscrire' }}
                </Button>
              </form>

              <p class="text-muted-foreground mt-6 text-center text-xs">
                Aucun spam. Vos données ne sont jamais revendues.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div class="mb-10 text-center">
          <h2 class="font-title text-secondary text-2xl sm:text-3xl lg:text-4xl">
            Pourquoi rejoindre la newsletter ?
          </h2>
        </div>

        <div class="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <Bell class="text-accent h-6 w-6 shrink-0" />
              <h3 class="font-subtitle text-secondary text-base lg:text-lg">
                Annonces en temps réel
              </h3>
            </div>
            <p class="font-paragraph text-muted-foreground text-sm lg:text-base">
              Recevez immédiatement chaque nouvelle publication ajoutée au blog SolidHive.
            </p>
          </div>

          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <CalendarDays class="text-accent h-6 w-6 shrink-0" />
              <h3 class="font-subtitle text-secondary text-base lg:text-lg">
                Événements à ne pas manquer
              </h3>
            </div>
            <p class="font-paragraph text-muted-foreground text-sm lg:text-base">
              Soyez alerté des prochains événements organisés par les associations de la ruche.
            </p>
          </div>

          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <Users class="text-accent h-6 w-6 shrink-0" />
              <h3 class="font-subtitle text-secondary text-base lg:text-lg">
                Une communauté engagée
              </h3>
            </div>
            <p class="font-paragraph text-muted-foreground text-sm lg:text-base">
              Rejoignez des centaines de personnes qui soutiennent activement les associations.
            </p>
          </div>
        </div>
      </section>

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
  import { computed, ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  import PageContainer from '@/components/PageContainer.vue';
  import { Button } from '@/components/ui/button';
  import InputForm from '@/components/form/InputForm.vue';
  import {
    Loader2,
    Mail,
    Inbox,
    Sparkles,
    ShieldCheck,
    Bell,
    CalendarDays,
    Users,
  } from 'lucide-vue-next';
  import Database from '@/utils/database.utils';
  import { useToast } from 'vue-toastification';
  import { newsletterValidationSchema, newsletterErrorMessages } from '@/utils/errors/newsletter';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';

  const email = ref('');
  const validationErrors = reactive<{ email?: string }>({});
  const touched = reactive({ email: false });
  const formSubmitted = ref(false);
  const isSubscribing = ref(false);
  const isUnsubscribing = ref(false);
  const toast = useToast();
  const router = useRouter();
  const authStore = useAuthStore();
  const isAuthenticated = computed(() => authStore.isAuthenticated());

  const showError = (): boolean => {
    return touched.email || formSubmitted.value ? !!validationErrors.email : false;
  };

  const getErrorMessage = (): string => {
    return touched.email || formSubmitted.value ? validationErrors.email || '' : '';
  };

  const validateForm = async () => {
    const result = await validateWithYup(newsletterValidationSchema as any, { email: email.value });
    if (result.isValid) {
      clearValidationErrors(validationErrors);
    } else {
      Object.assign(validationErrors, result.errors);
    }
    return result.isValid;
  };

  const handleSubmit = async () => {
    formSubmitted.value = true;
    if (!(await validateForm())) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }
    try {
      isSubscribing.value = true;
      await Database.create('newsletter/subscribe', { email: email.value });
      toast.success('Inscription effectuée, pensez à vérifier votre boîte mail.');
      email.value = '';
      formSubmitted.value = false;
    } catch (err) {
      console.error(err);
      toast.error(newsletterErrorMessages.api.subscribe);
    } finally {
      isSubscribing.value = false;
    }
  };

  const unsubscribe = async () => {
    formSubmitted.value = true;
    if (!(await validateForm())) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }
    try {
      isUnsubscribing.value = true;
      await Database.create('newsletter/unsubscribe', { email: email.value });
      toast.success('Vous êtes désinscrit de la newsletter.');
      email.value = '';
      formSubmitted.value = false;
    } catch (err) {
      console.error(err);
      toast.error(newsletterErrorMessages.api.unsubscribe);
    } finally {
      isUnsubscribing.value = false;
    }
  };
</script>
