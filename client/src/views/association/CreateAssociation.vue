<template>
  <PageContainer>
    <div class="mx-auto max-w-4xl py-8">
      <div class="bg-card rounded-3xl border p-8 shadow-xl sm:p-12">
        <!-- Header -->
        <div class="mb-10 text-center">
          <h1 class="font-title text-primary mb-3 text-4xl sm:text-5xl">Créer une association</h1>
          <p class="font-paragraph text-muted-foreground text-lg">
            Parlez-nous de votre association et commencez à collecter des dons
          </p>
        </div>

        <!-- Formulaire d'association -->
        <AssociationForm
          :is-loading="isLoading"
          :show-back-button="false"
          submit-button-text="Créer l'association"
          @submit="handleSubmit"
        />
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import PageContainer from '@/components/PageContainer.vue';
  import AssociationForm from '@/components/form/AssociationForm.vue';
  import { useToast } from 'vue-toastification';
  import { useAuthStore } from '@/stores/auth';

  const router = useRouter();
  const toast = useToast();
  const authStore = useAuthStore();
  const isLoading = ref(false);

  async function handleSubmit(data: {
    associationData: {
      name: string;
      description: string;
      contact: string;
      siret: string;
      primaryColor: string;
    };
    logoFile: File | null;
    backgroundFile: File | null;
  }) {
    isLoading.value = true;
    try {
      // 1. Créer l'association
      const response = await authStore.createAssociation(data.associationData);

      // 2. Upload du logo si présent
      if (data.logoFile) {
        await authStore.uploadAssociationFile(response.id, data.logoFile, 'logo');
      }

      // 3. Upload de la bannière si présent
      if (data.backgroundFile) {
        await authStore.uploadAssociationFile(response.id, data.backgroundFile, 'background');
      }

      toast.success('Association créée avec succès !');

      // Rafraîchir les informations de l'utilisateur pour inclure la nouvelle association
      await authStore.loadUser();

      // Rediriger vers le profil de l'utilisateur
      router.push('/profile');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Une erreur est survenue lors de la création de l'association";
      toast.error(errorMessage);
    } finally {
      isLoading.value = false;
    }
  }
</script>
