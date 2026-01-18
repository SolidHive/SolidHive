<template>
  <h2 class="text-secondary font-title mt-6 mb-6 text-center text-2xl sm:mt-8 sm:mb-8 sm:text-3xl">
    Nous contacter
  </h2>
  <form
    class="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-2xl bg-white p-4 shadow-xl sm:gap-6 sm:p-8"
    @submit.prevent="handleSubmit"
  >
    <div class="grid grid-cols-1 gap-4 sm:gap-4 md:grid-cols-2">
      <InputForm
        v-model="form.name"
        input-name="name"
        type="text"
        required
        :disabled="loading"
        placeholder="Doe"
        :error-message="getErrorMessage('name')"
        :error-state="showError('name')"
        @input="clearValidationErrors(validationErrors, 'name')"
        @blur="() => (touchedFields.name = true)"
      >
        <template #label>
          Nom
          <span class="text-destructive">*</span>
        </template>
      </InputForm>
      <InputForm
        v-model="form.firstname"
        input-name="firstname"
        type="text"
        required
        :disabled="loading"
        placeholder="John"
        :error-message="getErrorMessage('firstname')"
        :error-state="showError('firstname')"
        @input="clearValidationErrors(validationErrors, 'firstname')"
        @blur="() => (touchedFields.firstname = true)"
      >
        <template #label>
          Prénom
          <span class="text-destructive">*</span>
        </template>
      </InputForm>
      <InputForm
        v-model="form.email"
        input-name="email"
        type="email"
        required
        :disabled="loading"
        placeholder="john.doe@example.com"
        :error-message="getErrorMessage('email')"
        :error-state="showError('email')"
        @input="clearValidationErrors(validationErrors, 'email')"
        @blur="() => (touchedFields.email = true)"
      >
        <template #label>
          Email
          <span class="text-destructive">*</span>
        </template>
      </InputForm>
      <InputForm
        v-model="form.phone"
        :label-value="'Téléphone'"
        input-name="phone"
        type="tel"
        :disabled="loading"
        placeholder="+330102030405"
        :error-message="getErrorMessage('phone')"
        :error-state="showError('phone')"
        @input="clearValidationErrors(validationErrors, 'phone')"
        @blur="() => (touchedFields.phone = true)"
      />
    </div>
    <div>
      <TextareaForm
        v-model="form.message"
        input-name="message"
        rows="5"
        required
        :disabled="loading"
        placeholder="Bonjour..."
        :error-message="getErrorMessage('message')"
        :error-state="showError('message')"
        @input="clearValidationErrors(validationErrors, 'message')"
        @blur="() => (touchedFields.message = true)"
      >
        <template #label>
          Message
          <span class="text-destructive">*</span>
        </template>
      </TextareaForm>
    </div>
    <div class="mb-2 text-xs text-gray-500">* Champs obligatoire</div>
    <div class="flex justify-center">
      <Button
        type="submit"
        variant="secondary"
        size="lg"
        :disabled="loading"
        class="w-full sm:w-auto"
      >
        {{ loading ? 'Envoi...' : 'Envoyer le message' }}
        <Loader v-if="loading" class="ml-2 h-4 w-4 animate-spin" />
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { Loader } from 'lucide-vue-next';
  import InputForm from '@/components/form/InputForm.vue';
  import TextareaForm from '@/components/form/TextareaForm.vue';
  import { Button } from '@/components/ui/button';
  import Database from '@/utils/database.utils';
  import { useToast } from 'vue-toastification';
  import { validateWithYup, clearValidationErrors } from '@/utils/validation.utils';
  import { contactValidationSchema } from '@/utils/errors/contact';

  const props = defineProps<{ associationId: string }>();
  const toast = useToast();

  const form = ref({
    name: '',
    firstname: '',
    email: '',
    phone: '',
    message: '',
  });
  const loading = ref(false);
  const validationErrors = reactive<Record<string, string>>({});
  const touchedFields = reactive<Record<string, boolean>>({
    name: false,
    firstname: false,
    email: false,
    phone: false,
    message: false,
  });
  const formSubmitted = ref(false);

  function showError(field: string) {
    return (touchedFields[field] || formSubmitted.value) && !!validationErrors[field];
  }
  function getErrorMessage(field: string) {
    return touchedFields[field] || formSubmitted.value ? validationErrors[field] || '' : '';
  }

  const validateForm = async () => {
    const result = await validateWithYup(contactValidationSchema, form.value);
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
    loading.value = true;
    try {
      const payload = {
        name: form.value.name.trim(),
        firstname: form.value.firstname.trim(),
        email: form.value.email.trim(),
        message: form.value.message.trim(),
        phone: form.value.phone?.trim() || undefined,
      };
      await Database.create(`association/${props.associationId}/contact`, payload);
      toast.success('Message envoyé avec succès !');
      form.value = { name: '', firstname: '', email: '', phone: '', message: '' };
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Erreur lors de l'envoi du message.");
    } finally {
      loading.value = false;
    }
  };
</script>
