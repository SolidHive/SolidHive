<template>
  <div class="space-y-6">
    <SectionTitle>Participants</SectionTitle>

    <div class="space-y-6">
      <FormSection v-for="(participant, index) in participants" :key="index">
        <template #title>Participant {{ index + 1 }}</template>

        <div class="mb-4 rounded-lg bg-gray-50">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm font-medium text-gray-600">Type de billet :</span>
            <span class="text-accent font-semibold">
              {{ pricingInfo(participant.pricingId).title }}
            </span>
            <span class="text-sm text-gray-600">
              ({{ formatCurrency(pricingInfo(participant.pricingId).amount) }})
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputForm
            label-value="Prénom *"
            :input-name="`participant-${index}-firstName`"
            :model-value="participant.firstName"
            type="text"
            placeholder="Prénom"
            :error-message="getErrorMessage(index, 'firstName')"
            :error-state="showError(index, 'firstName')"
            @update:model-value="updateParticipantField(index, 'firstName', $event as string)"
            @blur="handleBlur(index, 'firstName')"
          />

          <InputForm
            label-value="Nom *"
            :input-name="`participant-${index}-lastName`"
            :model-value="participant.lastName"
            type="text"
            placeholder="Nom"
            :error-message="getErrorMessage(index, 'lastName')"
            :error-state="showError(index, 'lastName')"
            @update:model-value="updateParticipantField(index, 'lastName', $event as string)"
            @blur="handleBlur(index, 'lastName')"
          />

          <InputForm
            label-value="Email *"
            :input-name="`participant-${index}-email`"
            :model-value="participant.email"
            type="email"
            placeholder="email@exemple.com"
            :error-message="getErrorMessage(index, 'email')"
            :error-state="showError(index, 'email')"
            @update:model-value="updateParticipantField(index, 'email', $event as string)"
            @blur="handleBlur(index, 'email')"
          />

          <InputForm
            label-value="Téléphone"
            :input-name="`participant-${index}-phone`"
            :model-value="participant.phone"
            type="tel"
            placeholder="+33 6 12 34 56 78"
            :error-message="getErrorMessage(index, 'phone')"
            :error-state="showError(index, 'phone')"
            @update:model-value="updateParticipantField(index, 'phone', $event as string)"
            @blur="handleBlur(index, 'phone')"
          />
        </div>
      </FormSection>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { watch, reactive, onMounted } from 'vue';
  import SectionTitle from './common/SectionTitle.vue';
  import FormSection from './common/FormSection.vue';
  import InputForm from '@/components/form/InputForm.vue';
  import { formatCurrency, getPricingInfo } from '@/utils/eventRegistration.utils';
  import type { EventPricing, Participant } from '@/interfaces';
  import { eventRegistrationErrorMessages } from '@/utils/errors/eventRegistration';
  import * as yup from 'yup';

  const props = defineProps<{
    participants: Participant[];
    totalTickets: number;
    pricings?: EventPricing[];
    formSubmitted?: boolean;
  }>();

  const emit = defineEmits<{
    'update:participants': [participants: Participant[]];
  }>();

  const touchedFields = reactive<Record<number, Record<string, boolean>>>({});

  // Schéma de validation Yup pour un participant
  const participantSchema = yup.object({
    firstName: yup
      .string()
      .required(eventRegistrationErrorMessages.participants.firstName.required)
      .min(2, eventRegistrationErrorMessages.participants.firstName.invalid),
    lastName: yup
      .string()
      .required(eventRegistrationErrorMessages.participants.lastName.required)
      .min(2, eventRegistrationErrorMessages.participants.lastName.invalid),
    email: yup
      .string()
      .required(eventRegistrationErrorMessages.participants.email.required)
      .email(eventRegistrationErrorMessages.participants.email.invalid),
    phone: yup
      .string()
      .test(
        'phone',
        eventRegistrationErrorMessages.participants.phone.invalid,
        (value: string | undefined) => {
          if (!value) return true;
          return eventRegistrationErrorMessages.validation.phonePattern.test(value);
        }
      ),
  });

  // Stocker les erreurs de validation manuellement
  const validationErrors = reactive<Record<number, Record<string, string>>>({});

  const validateParticipant = async (index: number) => {
    const participant = props.participants[index];
    if (!participant) return false;

    try {
      await participantSchema.validate(participant, { abortEarly: false });
      validationErrors[index] = {};
      return true;
    } catch (err: any) {
      const errors: Record<string, string> = {};
      if (err.inner) {
        err.inner.forEach((error: any) => {
          if (error.path) {
            errors[error.path] = error.message;
          }
        });
      }
      validationErrors[index] = errors;
      return false;
    }
  };

  const createParticipantForm = (index: number) => {
    if (!touchedFields[index]) {
      touchedFields[index] = {
        firstName: false,
        lastName: false,
        email: false,
        phone: false,
      };
    }
    if (!validationErrors[index]) {
      validationErrors[index] = {};
    }
  };

  const showError = (index: number, fieldName: 'firstName' | 'lastName' | 'email' | 'phone') => {
    if (!props.formSubmitted) return false;
    return !!validationErrors[index]?.[fieldName];
  };

  const getErrorMessage = (
    index: number,
    fieldName: 'firstName' | 'lastName' | 'email' | 'phone'
  ) => {
    if (!props.formSubmitted) return '';
    return validationErrors[index]?.[fieldName] || '';
  };

  const handleBlur = (index: number, field: string) => {
    if (touchedFields[index]) {
      touchedFields[index][field] = true;
    }
  };

  const updateParticipantField = (index: number, field: keyof Participant, value: string) => {
    const updated = [...props.participants];
    updated[index] = { ...updated[index], [field]: value };
    emit('update:participants', updated);
  };

  const initializeForms = async () => {
    // Nettoyer les anciennes erreurs
    Object.keys(validationErrors).forEach((key) => {
      delete validationErrors[parseInt(key)];
    });
    Object.keys(touchedFields).forEach((key) => {
      delete touchedFields[parseInt(key)];
    });

    // Créer les formulaires pour tous les participants et les valider
    const count = props.participants.length;
    for (let i = 0; i < count; i++) {
      createParticipantForm(i);
      await validateParticipant(i);
    }
  };

  // Initialiser les formulaires au montage
  onMounted(() => {
    initializeForms();
  });

  watch(
    () => props.totalTickets,
    (newTotal: number) => {
      const updated = [...props.participants];

      // Ajouter des participants si nécessaire
      while (updated.length < newTotal) {
        updated.push({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          pricingId: '',
        });
      }

      // Retirer des participants si nécessaire
      while (updated.length > newTotal) {
        updated.pop();
      }

      emit('update:participants', updated);

      // Recréer tous les formulaires
      initializeForms();
    }
  );

  const pricingInfo = (pricingId: string) => getPricingInfo(props.pricings, pricingId);

  const syncFormsWithParticipants = async () => {
    // Recréer tous les formulaires avec les valeurs actuelles des participants
    await initializeForms();
  };

  const isValid = async () => {
    const validations = [];
    for (let i = 0; i < props.participants.length; i++) {
      validations.push(await validateParticipant(i));
    }
    return validations.every((v) => v);
  };

  defineExpose({
    syncFormsWithParticipants,
    isValid,
  });
</script>
