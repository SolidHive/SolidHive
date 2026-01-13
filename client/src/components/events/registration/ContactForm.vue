<template>
  <div class="space-y-6">
    <SectionTitle>Coordonnées</SectionTitle>

    <FormSection>
      <div class="space-y-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputForm
            v-model="formData.firstName"
            label-value="Prénom *"
            input-name="firstName"
            type="text"
            placeholder="Prénom"
            :error-message="getErrorMessage('firstName')"
            :error-state="showError('firstName')"
            @input="clearValidationErrors(validationErrors, 'firstName')"
            @update:model-value="updateField('firstName', $event as string)"
            @blur="handleBlur('firstName')"
          />

          <InputForm
            v-model="formData.lastName"
            label-value="Nom *"
            input-name="lastName"
            type="text"
            placeholder="Nom"
            :error-message="getErrorMessage('lastName')"
            :error-state="showError('lastName')"
            @input="clearValidationErrors(validationErrors, 'lastName')"
            @update:model-value="updateField('lastName', $event as string)"
            @blur="handleBlur('lastName')"
          />
        </div>

        <InputForm
          v-model="formData.email"
          label-value="Email *"
          input-name="email"
          type="email"
          placeholder="email@exemple.com"
          :error-message="getErrorMessage('email')"
          :error-state="showError('email')"
          @input="clearValidationErrors(validationErrors, 'email')"
          @update:model-value="updateField('email', $event as string)"
          @blur="handleBlur('email')"
        />

        <InputForm
          v-model="formData.phone"
          label-value="Téléphone *"
          input-name="phone"
          type="tel"
          placeholder="+33 6 12 34 56 78"
          :error-message="getErrorMessage('phone')"
          :error-state="showError('phone')"
          @input="clearValidationErrors(validationErrors, 'phone')"
          @update:model-value="updateField('phone', $event as string)"
          @blur="handleBlur('phone')"
        />

        <InputForm
          v-model="formData.address"
          label-value="Adresse *"
          input-name="address"
          type="text"
          placeholder="Adresse complète"
          :error-message="getErrorMessage('address')"
          :error-state="showError('address')"
          @input="clearValidationErrors(validationErrors, 'address')"
          @update:model-value="updateField('address', $event as string)"
          @blur="handleBlur('address')"
        />

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InputForm
            v-model="formData.postcode"
            label-value="Code postal *"
            input-name="postcode"
            type="text"
            placeholder="75001"
            :error-message="getErrorMessage('postcode')"
            :error-state="showError('postcode')"
            @input="clearValidationErrors(validationErrors, 'postcode')"
            @update:model-value="updateField('postcode', $event as string)"
            @blur="handleBlur('postcode')"
          />

          <div class="sm:col-span-2">
            <InputForm
              v-model="formData.city"
              label-value="Ville *"
              input-name="city"
              type="text"
              placeholder="Paris"
              :error-message="getErrorMessage('city')"
              :error-state="showError('city')"
              @input="clearValidationErrors(validationErrors, 'city')"
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
  import { contactFormValidationSchema } from '@/utils/errors/eventRegistration';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';

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

  // Données du formulaire
  const formData = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    postcode: '',
    city: '',
  });

  // Erreurs de validation
  const validationErrors = reactive<Record<string, string>>({});

  const showError = (fieldName: ContactFields) => {
    if (!props.formSubmitted) return false;
    return !!validationErrors[fieldName];
  };

  const getErrorMessage = (fieldName: ContactFields) => {
    if (!props.formSubmitted) return '';
    return validationErrors[fieldName] || '';
  };

  const validateForm = async () => {
    const result = await validateWithYup(contactFormValidationSchema, formData);

    if (result.isValid) {
      clearValidationErrors(validationErrors);
    } else {
      Object.assign(validationErrors, result.errors);
    }

    return result.isValid;
  };

  const handleBlur = (field: ContactFields) => {
    touchedFields[field] = true;
  };

  const updateField = (field: ContactFields, value: string) => {
    formData[field] = value;
    emit('update:contact', {
      ...props.contact,
      [field]: value,
    });
  };

  // Initialiser les valeurs du formulaire au montage
  const initializeForm = () => {
    formData.firstName = props.contact.firstName;
    formData.lastName = props.contact.lastName;
    formData.email = props.contact.email;
    formData.phone = props.contact.phone;
    formData.address = props.contact.address;
    formData.postcode = props.contact.postcode;
    formData.city = props.contact.city;
  };

  // Synchroniser les valeurs du formulaire avec le contact
  watch(
    () => props.contact,
    (newContact: ContactInfo) => {
      formData.firstName = newContact.firstName;
      formData.lastName = newContact.lastName;
      formData.email = newContact.email;
      formData.phone = newContact.phone;
      formData.address = newContact.address;
      formData.postcode = newContact.postcode;
      formData.city = newContact.city;
    },
    { deep: true }
  );

  // Initialiser au montage
  initializeForm();

  const isValid = async () => {
    return await validateForm();
  };

  defineExpose({
    validateForm,
    isValid,
  });
</script>
