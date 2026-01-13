<template>
  <PageContainer>
    <div class="space-y-6">
      <RegistrationHeader :event="event" />
      <RegistrationStepper :current-step="currentStep" @step-click="goToStep" />

      <div class="flex flex-col gap-6 md:flex-row">
        <div class="order-1 flex-1 md:order-1">
          <div class="rounded-2xl p-4 shadow-lg">
            <TicketSelection
              v-if="currentStep === 0"
              :pricings="event?.pricings"
              :selected-tickets="selectedTickets"
              :owned-pricing-ids="ownedPricingIds"
              :error-message="validation.ticketError.value"
              @update:selected-tickets="selectedTickets = $event"
            />

            <ParticipantsForm
              v-if="currentStep === 1"
              ref="participantsFormRef"
              :participants="participants"
              :total-tickets="calculations.totalTickets.value"
              :pricings="event?.pricings"
              :form-submitted="validation.formSubmitted.value"
              @update:participants="participants = $event"
            />

            <ContactForm
              v-if="currentStep === 2"
              ref="contactFormRef"
              :contact="contact"
              :form-submitted="validation.formSubmitted.value"
              @update:contact="contact = $event"
            />

            <RegistrationSummary
              v-if="currentStep === 3"
              :event="event"
              :pricings="event?.pricings"
              :selected-tickets="selectedTickets"
              :participants="participants"
              :contact="contact"
            />
          </div>
        </div>

        <div class="order-2 md:order-2 md:w-80">
          <RegistrationSidebar
            :selected-tickets="selectedTickets"
            :pricings="event?.pricings"
            :can-proceed="true"
            :current-step="currentStep"
            :is-submitting="isSubmitting"
            :is-authenticated="authStore.isAuthenticated()"
            @next-step="nextStep"
            @submit-registration="submitRegistration"
            @login="goToLogin"
          />
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import PageContainer from '@/components/PageContainer.vue';
  import RegistrationHeader from '@/components/events/registration/common/RegistrationHeader.vue';
  import RegistrationStepper from '@/components/events/registration/common/RegistrationStepper.vue';
  import TicketSelection from '@/components/events/registration/TicketSelection.vue';
  import ParticipantsForm from '@/components/events/registration/ParticipantsForm.vue';
  import ContactForm from '@/components/events/registration/ContactForm.vue';
  import RegistrationSummary from '@/components/events/registration/RegistrationSummary.vue';
  import RegistrationSidebar from '@/components/events/registration/common/RegistrationSidebar.vue';
  import { useRegistrationCalculations } from '@/composables/event/useRegistrationCalculations';
  import { useRegistrationValidation } from '@/composables/event/useRegistrationValidation';
  import { useAuthStore } from '@/stores/auth';
  import Database from '@/utils/database.utils';
  import type { Event, Participant, ContactInfo } from '@/interfaces';

  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();

  const event = ref<Event>();
  const currentStep = ref(0);
  const isSubmitting = ref(false);
  const selectedTickets = ref<Record<string, number>>({});
  const ownedPricingIds = ref<string[]>([]);
  const participants = ref<Participant[]>([]);
  const contact = ref<ContactInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    postcode: '',
    city: '',
  });

  const calculations = useRegistrationCalculations(selectedTickets, ref(event.value?.pricings));
  const validation = useRegistrationValidation(selectedTickets);

  const participantsFormRef = ref<InstanceType<typeof ParticipantsForm>>();
  const contactFormRef = ref<InstanceType<typeof ContactForm>>();

  const nextStep = async () => {
    validation.formSubmitted.value = true;
    let isValid = false;

    switch (currentStep.value) {
      case 0:
        isValid = validation.validateTickets();
        break;
      case 1:
        // Synchroniser et valider les formulaires des participants
        if (participantsFormRef.value?.syncFormsWithParticipants) {
          await participantsFormRef.value.syncFormsWithParticipants();
          await nextTick();
        }

        // Valider tous les participants
        if (participantsFormRef.value?.isValid) {
          isValid = await participantsFormRef.value.isValid();
        }
        break;
      case 2:
        // Valider le formulaire de contact
        if (contactFormRef.value?.isValid) {
          isValid = await contactFormRef.value.isValid();
        }
        break;
      case 3:
        isValid = true;
        break;
    }

    if (!isValid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (currentStep.value < 3) {
      if (currentStep.value === 0) {
        assignTicketTypesToParticipants();
      }
      validation.clearFormSubmitted();
      currentStep.value++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const assignTicketTypesToParticipants = () => {
    const updatedParticipants: Participant[] = [];
    let participantIndex = 0;

    for (const [pricingId, quantity] of Object.entries(selectedTickets.value)) {
      for (let i = 0; i < (quantity as number); i++) {
        const existingParticipant = participants.value[participantIndex];
        updatedParticipants.push({
          firstName: existingParticipant?.firstName || '',
          lastName: existingParticipant?.lastName || '',
          email: existingParticipant?.email || '',
          phone: existingParticipant?.phone || '',
          pricingId: pricingId,
        });
        participantIndex++;
      }
    }

    participants.value = updatedParticipants;
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex <= currentStep.value) {
      validation.clearFormSubmitted();
      currentStep.value = stepIndex;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToLogin = () => {
    router.push({ name: 'Login' });
  };

  const submitRegistration = async () => {
    // Vérifier l'authentification avant de soumettre
    if (!authStore.isAuthenticated()) {
      goToLogin();
      return;
    }
    isSubmitting.value = true;
    try {
      const registrationPayload = {
        eventId: route.params.eventId as string,
        participants: participants.value.map((p: Participant) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          phone: p.phone,
          pricingId: p.pricingId,
        })),
        contact: contact.value,
      };

      const response = await Database.create('payments/event-registration', registrationPayload);

      if (response.data.url) {
        // Rediriger vers la page de paiement Stripe
        window.location.href = response.data.url;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      isSubmitting.value = false;
    }
  };

  onMounted(async () => {
    try {
      const associationId = route.params.id as string;
      const eventId = route.params.eventId as string;
      event.value = await Database.getOne(`association/${associationId}/event`, eventId);

      // Récupérer les billets déjà achetés par l'utilisateur connecté
      if (authStore.isAuthenticated()) {
        try {
          const registers = await Database.getAll(
            `association/${associationId}/event/${eventId}/my-registers`
          );
          ownedPricingIds.value = registers.map((register: any) => register.eventPricingId);
        } catch (error) {
          console.error('Erreur lors de la récupération des inscriptions:', error);
        }
      }
    } catch (error) {
      console.error("Échec du chargement de l'événement:", error);
      router.push({ name: 'events' });
    }
  });
</script>
