<template>
  <PageContainer>
    <!-- Header avec logo et titre -->
    <DonationHeader :association="association" />

    <!-- Donation Form -->
    <DonationForm
      :association="association"
      :loading="loading"
      :submitting="submitting"
      @submit="handleDonationSubmit"
      @cancel="goBack"
    />
  </PageContainer>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import PageContainer from '@/components/PageContainer.vue';
  import DonationHeader from '@/components/donation/DonationHeader.vue';
  import DonationForm from '@/components/donation/DonationForm.vue';
  import Database from '@/utils/database.utils';
  import { useToast } from 'vue-toastification';
  import type { Association } from '@/interfaces/association.interface';
  import type { FileMetadata } from '@/interfaces/file.interface';

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();

  const association = ref<Association | null>(null);
  const loading = ref(true);
  const submitting = ref(false);

  const loadAssociation = async () => {
    try {
      loading.value = true;
      const id = route.params.id as string;

      // Récupérer l'association et ses fichiers
      const associationData = await Database.getOne('association', id);
      const files = await loadAssociationFiles(id);

      // Construire l'objet association avec les URLs des images
      association.value = {
        ...associationData,
        logo: getFileUrl('logo', files, id),
      };

      // Vérifier le statut du compte Stripe
      try {
        await Database.update(`payments/stripe-account/${id}/check-status`, '', {});
        // Recharger l'association mise à jour
        const updatedAssociationData = await Database.getOne('association', id);
        association.value = {
          ...updatedAssociationData,
          logo: getFileUrl('logo', files, id),
        };
      } catch {
        // Garder l'association avec le logo chargé
      }
    } catch (err) {
      console.error('Error loading association:', err);
      toast.error("Impossible de charger les informations de l'association");
      router.push('/associations');
    } finally {
      loading.value = false;
    }
  };

  const getFileUrl = (
    purpose: string,
    files: FileMetadata[],
    associationId: string
  ): string | undefined => {
    const file = files.find((f) => f.purpose === purpose);
    return file ? `/files/Association/${associationId}?index=${file.index}` : undefined;
  };

  const loadAssociationFiles = async (associationId: string): Promise<FileMetadata[]> => {
    const files: FileMetadata[] = [];
    let index = 0;

    while (true) {
      try {
        const response = await Database.getOne(`files/Association/${associationId}/metadata`, '', {
          index,
        });
        if (response) {
          files.push(response);
          index++;
        } else {
          break;
        }
      } catch (err: any) {
        if (err.response?.status === 404) break;
        console.error('Error loading file metadata:', err);
        break;
      }
    }

    return files;
  };

  const handleDonationSubmit = async (donationData: any) => {
    if (!association.value?.stripeAccountId) {
      toast.error("Cette association n'est pas configurée pour recevoir des dons");
      return;
    }

    try {
      submitting.value = true;

      const response = await Database.create('/payments/donate', {
        amount: donationData.amount,
        associationId: association.value.id,
        message: donationData.message,
        supportSolidHive: donationData.supportSolidHive,
        solidHivePercentage: donationData.solidHivePercentage,
      });

      // Rediriger vers Stripe Checkout
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (err: any) {
      console.error('Error creating donation:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la création du paiement');
    } finally {
      submitting.value = false;
    }
  };

  const goBack = () => {
    router.back();
  };

  onMounted(() => {
    loadAssociation();
  });
</script>
