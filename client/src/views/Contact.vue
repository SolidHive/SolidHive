<template>
  <PageContainer>
    <div class="flex flex-col gap-y-16">
      <!-- Hero -->
      <section class="space-y-6 py-8 text-center">
        <span
          class="border-accent/30 bg-accent/10 text-accent inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold"
        >
          <MessageCircle class="h-4 w-4" />
          Contact
        </span>
        <h1
          class="font-title text-secondary mx-auto max-w-2xl text-3xl leading-tight sm:text-4xl lg:text-5xl"
        >
          Contactez notre équipe
        </h1>
        <p class="font-paragraph text-muted-foreground mx-auto max-w-xl text-sm lg:text-base">
          Une question, une suggestion ou un problème ? Nous sommes là pour vous aider. Réponse
          garantie sous 48h ouvrées.
        </p>
      </section>

      <!-- Cards de contact -->
      <section class="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div
          class="border-border flex flex-col items-center gap-4 rounded-2xl border bg-white p-8 text-center shadow-md"
        >
          <div class="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
            <Mail class="text-primary h-7 w-7" />
          </div>
          <h3 class="font-subtitle text-secondary text-base font-semibold">Par e-mail</h3>
          <p class="font-paragraph text-muted-foreground text-sm">
            Pour toute question générale ou demande de support.
          </p>
          <a
            href="mailto:support@solidhive.fr"
            class="text-accent text-sm font-semibold underline-offset-4 hover:underline"
          >
            support@solidhive.fr
          </a>
        </div>

        <div
          class="border-border flex flex-col items-center gap-4 rounded-2xl border bg-white p-8 text-center shadow-md"
        >
          <div class="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
            <Building2 class="text-primary h-7 w-7" />
          </div>
          <h3 class="font-subtitle text-secondary text-base font-semibold">Associations</h3>
          <p class="font-paragraph text-muted-foreground text-sm">
            Pour toute demande liée à l'onboarding ou au partenariat associatif.
          </p>
          <a
            href="mailto:associations@solidhive.fr"
            class="text-accent text-sm font-semibold underline-offset-4 hover:underline"
          >
            associations@solidhive.fr
          </a>
        </div>

        <div
          class="border-border flex flex-col items-center gap-4 rounded-2xl border bg-white p-8 text-center shadow-md"
        >
          <div class="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
            <ShieldAlert class="text-primary h-7 w-7" />
          </div>
          <h3 class="font-subtitle text-secondary text-base font-semibold">Signalement</h3>
          <p class="font-paragraph text-muted-foreground text-sm">
            Pour signaler un contenu inapproprié ou un problème de sécurité.
          </p>
          <a
            href="mailto:security@solidhive.fr"
            class="text-accent text-sm font-semibold underline-offset-4 hover:underline"
          >
            security@solidhive.fr
          </a>
        </div>
      </section>

      <!-- Formulaire -->
      <section class="grid items-start gap-12 lg:grid-cols-2">
        <!-- Infos -->
        <div class="space-y-8">
          <h2 class="font-title text-secondary text-2xl sm:text-3xl">Envoyez-nous un message</h2>
          <p class="font-paragraph text-muted-foreground text-sm lg:text-base">
            Décrivez votre demande et nous vous répondrons dans les meilleurs délais. Tous les
            champs marqués d'un * sont obligatoires.
          </p>

          <ul class="space-y-4">
            <li class="flex items-start gap-3">
              <div
                class="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              >
                <Clock class="text-primary h-4 w-4" />
              </div>
              <div>
                <p class="font-subtitle text-secondary text-sm font-semibold">Délai de réponse</p>
                <p class="font-paragraph text-muted-foreground text-sm">
                  Réponse sous 48h ouvrées en général.
                </p>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <div
                class="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              >
                <HelpCircle class="text-primary h-4 w-4" />
              </div>
              <div>
                <p class="font-subtitle text-secondary text-sm font-semibold">Consultez la FAQ</p>
                <p class="font-paragraph text-muted-foreground text-sm">
                  Votre question est peut-être déjà répondue dans notre
                  <router-link to="/faq" class="text-accent underline-offset-4 hover:underline">
                    FAQ
                  </router-link>
                  .
                </p>
              </div>
            </li>
          </ul>
        </div>

        <!-- Form -->
        <div class="mb-2 rounded-2xl border p-8 shadow-xl">
          <form class="space-y-5" @submit.prevent="handleSubmit">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputForm
                v-model="form.firstName"
                label-value="Prénom *"
                input-name="contact-firstname"
                type="text"
                placeholder="Jean"
                :error-state="showError('firstName')"
                :error-message="getError('firstName')"
                @input="
                  () => {
                    touched.firstName = true;
                    clearValidationErrors(validationErrors, 'firstName');
                  }
                "
                @blur="touched.firstName = true"
              />
              <InputForm
                v-model="form.lastName"
                label-value="Nom *"
                input-name="contact-lastname"
                type="text"
                placeholder="Dupont"
                :error-state="showError('lastName')"
                :error-message="getError('lastName')"
                @input="
                  () => {
                    touched.lastName = true;
                    clearValidationErrors(validationErrors, 'lastName');
                  }
                "
                @blur="touched.lastName = true"
              />
            </div>

            <InputForm
              v-model="form.email"
              label-value="E-mail *"
              input-name="contact-email"
              type="email"
              placeholder="jean.dupont@exemple.com"
              :error-state="showError('email')"
              :error-message="getError('email')"
              @input="
                () => {
                  touched.email = true;
                  clearValidationErrors(validationErrors, 'email');
                }
              "
              @blur="touched.email = true"
            />

            <SelectForm
              v-model="form.subject"
              input-name="contact-subject"
              label-value="Sujet *"
              placeholder="Sélectionnez un sujet"
              :error-state="showError('subject')"
              :error-message="getError('subject')"
              @change="
                () => {
                  touched.subject = true;
                  clearValidationErrors(validationErrors, 'subject');
                }
              "
              @blur="touched.subject = true"
            >
              <template #options>
                <option value="support">Support technique</option>
                <option value="association">Question association</option>
                <option value="donation">Question don / paiement</option>
                <option value="partnership">Partenariat</option>
                <option value="other">Autre</option>
              </template>
            </SelectForm>

            <div class="mb-4">
              <label class="font-paragraph text-foreground mb-1 block text-sm">Message *</label>
              <TextareaForm
                v-model="form.message"
                input-name="contact-message"
                placeholder="Décrivez votre demande en détail..."
                :rows="5"
                :error-state="showError('message')"
                :error-message="getError('message')"
                @input="
                  () => {
                    touched.message = true;
                    clearValidationErrors(validationErrors, 'message');
                  }
                "
                @blur="touched.message = true"
              />
            </div>

            <Button
              type="submit"
              class="bg-primary hover:bg-primary/90 w-full text-white"
              :disabled="isSending"
            >
              <Loader2 v-if="isSending" class="mr-2 h-4 w-4 animate-spin" />
              {{ isSending ? 'Envoi en cours...' : 'Envoyer le message' }}
            </Button>
          </form>
        </div>
      </section>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import PageContainer from '@/components/PageContainer.vue';
  import { Button } from '@/components/ui/button';
  import InputForm from '@/components/form/InputForm.vue';
  import TextareaForm from '@/components/form/TextareaForm.vue';
  import SelectForm from '@/components/form/SelectForm.vue';
  import {
    MessageCircle,
    Mail,
    Building2,
    ShieldAlert,
    Clock,
    HelpCircle,
    Loader2,
  } from 'lucide-vue-next';
  import { useToast } from 'vue-toastification';
  import Database from '@/utils/database.utils';
  import {
    contactFormValidationSchema,
    contactFormErrorMessages,
  } from '@/utils/errors/contact-form';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';

  const toast = useToast();
  const isSending = ref(false);

  const form = reactive({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });

  const validationErrors = reactive<Record<string, string>>({});
  const touched = reactive<Record<string, boolean>>({});
  const formSubmitted = ref(false);

  const showError = (field: string) =>
    touched[field] || formSubmitted.value ? !!validationErrors[field] : false;

  const getError = (field: string) =>
    touched[field] || formSubmitted.value ? validationErrors[field] || '' : '';

  const validateForm = async () => {
    const result = await validateWithYup(contactFormValidationSchema as any, { ...form });
    if (result.isValid) {
      Object.keys(validationErrors).forEach((k) => delete validationErrors[k]);
    } else {
      Object.assign(validationErrors, result.errors);
    }
    return result.isValid;
  };

  const handleSubmit = async () => {
    formSubmitted.value = true;
    Object.keys(form).forEach((k) => (touched[k] = true));
    if (!(await validateForm())) {
      toast.error('Veuillez corriger les erreurs du formulaire.');
      return;
    }
    try {
      isSending.value = true;
      await Database.create('contact', { ...form });
      toast.success('Votre message a bien été envoyé. Nous vous répondrons sous 48h.');
      Object.assign(form, { firstName: '', lastName: '', email: '', subject: '', message: '' });
      Object.keys(touched).forEach((k) => delete touched[k]);
      formSubmitted.value = false;
    } catch (err) {
      console.error(err);
      toast.error(contactFormErrorMessages.api.send);
    } finally {
      isSending.value = false;
    }
  };
</script>
