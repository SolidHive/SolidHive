<template>
  <div class="space-y-6">
    <SectionTitle>Coordonnées</SectionTitle>

    <FormSection>
      <div class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
          <InputForm
            v-model="form.firstName.$value"
            label-value="Prénom *"
            input-name="firstName"
            type="text"
            placeholder="Prénom"
            :error-message="showError('firstName') ? form.firstName.$error?.message : ''"
            :error-state="showError('firstName')"
            @update:model-value="updateField('firstName', $event as string)"
            @blur="handleBlur('firstName')"
          />

          <InputForm
            v-model="form.lastName.$value"
            label-value="Nom *"
            input-name="lastName"
            type="text"
            placeholder="Nom"
            :error-message="showError('lastName') ? form.lastName.$error?.message : ''"
            :error-state="showError('lastName')"
            @update:model-value="updateField('lastName', $event as string)"
            @blur="handleBlur('lastName')"
          />
        </div>

        <InputForm
          v-model="form.email.$value"
          label-value="Email *"
          input-name="email"
          type="email"
          placeholder="email@exemple.com"
          :error-message="showError('email') ? form.email.$error?.message : ''"
          :error-state="showError('email')"
          @update:model-value="updateField('email', $event as string)"
          @blur="handleBlur('email')"
        />

        <InputForm
          v-model="form.phone.$value"
          label-value="Téléphone *"
          input-name="phone"
          type="tel"
          placeholder="+33 6 12 34 56 78"
          :error-message="showError('phone') ? form.phone.$error?.message : ''"
          :error-state="showError('phone')"
          @update:model-value="updateField('phone', $event as string)"
          @blur="handleBlur('phone')"
        />

        <InputForm
          v-model="form.address.$value"
          label-value="Adresse *"
          input-name="address"
          type="text"
          placeholder="Adresse complète"
          :error-message="showError('address') ? form.address.$error?.message : ''"
          :error-state="showError('address')"
          @update:model-value="updateField('address', $event as string)"
          @blur="handleBlur('address')"
        />

        <div class="grid gap-4 md:grid-cols-3">
          <InputForm
            v-model="form.postcode.$value"
            label-value="Code postal *"
            input-name="postcode"
            type="text"
            placeholder="75001"
            :error-message="showError('postcode') ? form.postcode.$error?.message : ''"
            :error-state="showError('postcode')"
            @update:model-value="updateField('postcode', $event as string)"
            @blur="handleBlur('postcode')"
          />

          <div class="md:col-span-2">
            <InputForm
              v-model="form.city.$value"
              label-value="Ville *"
              input-name="city"
              type="text"
              placeholder="Paris"
              :error-message="showError('city') ? form.city.$error?.message : ''"
              :error-state="showError('city')"
              @update:model-value="updateField('city', $event as string)"
              @blur="handleBlur('city')"
            />
          </div>
        </div>
      </div>
    </FormSection>
  </div>
</template>

<script setup lang="ts">
  import { reactive, watch } from 'vue';
  import SectionTitle from './common/SectionTitle.vue';
  import FormSection from './common/FormSection.vue';
  import InputForm from '@/components/form/InputForm.vue';
  import type { ContactInfo } from '@/interfaces';
  import { eventRegistrationErrorMessages } from '@/utils/errors/eventRegistration';
  import { defineForm, field } from 'vue-yup-form';
  import * as yup from 'yup';

  const props = defineProps<{
    contact: ContactInfo;
    formSubmitted?: boolean;
  }>();

  const emit = defineEmits<{
    'update:contact': [contact: ContactInfo];
  }>();

  const touchedFields = reactive({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    address: false,
    postcode: false,
    city: false,
  });

  type ContactFields =
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'phone'
    | 'address'
    | 'postcode'
    | 'city';

  const showError = (fieldName: ContactFields) => props.formSubmitted && !!form[fieldName].$error;

  const form = defineForm({
    firstName: field(
      '',
      yup
        .string()
        .required(eventRegistrationErrorMessages.contact.firstName.required)
        .min(2, eventRegistrationErrorMessages.contact.firstName.invalid)
    ),
    lastName: field(
      '',
      yup
        .string()
        .required(eventRegistrationErrorMessages.contact.lastName.required)
        .min(2, eventRegistrationErrorMessages.contact.lastName.invalid)
    ),
    email: field(
      '',
      yup
        .string()
        .required(eventRegistrationErrorMessages.contact.email.required)
        .email(eventRegistrationErrorMessages.contact.email.invalid)
    ),
    phone: field(
      '',
      yup
        .string()
        .required(eventRegistrationErrorMessages.contact.phone.required)
        .test(
          'phone',
          eventRegistrationErrorMessages.contact.phone.invalid,
          (value: string | undefined) => {
            if (!value) return false;
            return eventRegistrationErrorMessages.validation.phonePattern.test(value);
          }
        )
    ),
    address: field(
      '',
      yup
        .string()
        .required(eventRegistrationErrorMessages.contact.address.required)
        .min(5, eventRegistrationErrorMessages.contact.address.invalid)
    ),
    postcode: field(
      '',
      yup
        .string()
        .required(eventRegistrationErrorMessages.contact.postcode.required)
        .matches(
          eventRegistrationErrorMessages.validation.postcodePattern,
          eventRegistrationErrorMessages.contact.postcode.invalid
        )
    ),
    city: field(
      '',
      yup
        .string()
        .required(eventRegistrationErrorMessages.contact.city.required)
        .min(2, eventRegistrationErrorMessages.contact.city.invalid)
    ),
  });

  const handleBlur = (field: ContactFields) => {
    touchedFields[field] = true;
  };

  const updateField = (field: ContactFields, value: string) => {
    emit('update:contact', {
      ...props.contact,
      [field]: value,
    });
  };

  // Initialiser les valeurs du formulaire au montage
  form.firstName.$value = props.contact.firstName;
  form.lastName.$value = props.contact.lastName;
  form.email.$value = props.contact.email;
  form.phone.$value = props.contact.phone;
  form.address.$value = props.contact.address;
  form.postcode.$value = props.contact.postcode;
  form.city.$value = props.contact.city;

  // Synchroniser les valeurs du formulaire avec le contact
  watch(
    () => props.contact,
    (newContact: ContactInfo) => {
      form.firstName.$value = newContact.firstName;
      form.lastName.$value = newContact.lastName;
      form.email.$value = newContact.email;
      form.phone.$value = newContact.phone;
      form.address.$value = newContact.address;
      form.postcode.$value = newContact.postcode;
      form.city.$value = newContact.city;
    },
    { deep: true }
  );

  defineExpose({
    form,
  });
</script>
