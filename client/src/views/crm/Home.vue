<template>
  <Header :can-create-items="false">
    <template #header>
      {{ association?.name || 'Chargement...' }}
    </template>
    <template #description>Gérez les informations de votre association</template>
  </Header>

  <div class="px-2 py-4 sm:p-6 md:px-12">
    <div class="mx-auto max-w-4xl space-y-6">
      <!-- Message d'avertissement selon le statut -->
      <div
        v-if="association?.status === Status.PENDING"
        class="rounded-lg border border-amber-500/30 bg-amber-50 p-3 sm:p-4"
      >
        <div class="flex items-start gap-2 sm:gap-3">
          <div class="mt-0.5 flex-shrink-0">
            <AlertTriangle class="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-amber-900">
              Association en attente de validation
            </h3>
            <p class="mt-1 text-sm text-amber-800">
              Votre association est en cours de validation par un administrateur. Vous pouvez
              modifier les informations de base, mais l'accès complet au CRM sera disponible une
              fois l'association acceptée.
            </p>
          </div>
        </div>
      </div>

      <div
        v-else-if="association?.status === Status.ADDITIONAL_REQUEST"
        class="rounded-lg border border-blue-500/30 bg-blue-50 p-3 sm:p-4"
      >
        <div class="flex items-start gap-2 sm:gap-3">
          <div class="mt-0.5 flex-shrink-0">
            <Info class="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-blue-900">
              Informations supplémentaires requises
            </h3>
            <p class="mt-1 text-sm text-blue-800">
              L'administrateur a demandé des informations complémentaires. Veuillez mettre à jour
              les informations de votre association pour que votre demande soit réexaminée.
            </p>
          </div>
        </div>
      </div>

      <div
        v-else-if="association?.status === Status.REJECTED"
        class="rounded-lg border border-red-500/30 bg-red-50 p-3 sm:p-4"
      >
        <div class="flex items-start gap-2 sm:gap-3">
          <div class="mt-0.5 flex-shrink-0">
            <XCircle class="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-red-900">Association rejetée</h3>
            <p class="mt-1 text-sm text-red-800">
              Votre demande d'enregistrement a été rejetée. Vous pouvez consulter les informations
              de votre association mais l'accès complet au CRM n'est pas disponible.
            </p>
          </div>
        </div>
      </div>

      <!-- Card avec les informations de l'association -->
      <AssociationInfoCard
        v-if="association"
        :association="association"
        :image-key="imageKey"
        :can-update="crmAccess.canUpdateAssociation"
        :can-delete="crmAccess.canRemoveAssociation"
        :show-stripe-for-owner="crmAccess.isOwner"
        @edit="openEditDialog"
        @delete="isDeleteDialogOpen = true"
        @manage-stripe="isStripeDialogOpen = true"
      />

      <!-- Message de chargement -->
      <div v-else class="bg-card rounded-lg border p-12 text-center shadow-sm">
        <p class="text-muted-foreground">Chargement des informations...</p>
      </div>
    </div>
  </div>

  <!-- Dialog de modification -->
  <EditAssociationDialog
    v-model="isEditDialogOpen"
    v-model:logo-file="logoFile"
    v-model:image-file="imageFile"
    v-model:about-image-file="aboutImageFile"
    v-model:logo-preview="logoPreview"
    v-model:image-preview="imagePreview"
    v-model:about-image-preview="aboutImagePreview"
    v-model:gallery-images="galleryImages"
    :association="association"
    :is-loading="isLoading"
    @submit="handleUpdate"
  />

  <!-- Dialog de suppression -->
  <DeleteAssociationDialog
    v-model="isDeleteDialogOpen"
    :is-loading="isLoading"
    @confirm="handleDelete"
  />

  <!-- Dialog Stripe -->
  <StripeConnectDialog
    v-model="isStripeDialogOpen"
    :association="association"
    :is-loading="isStripeLoading"
    :message="stripeMessage"
    :message-type="stripeMessageType"
    @create-account="createNewStripeAccount"
    @check-status="checkStripeStatus"
  />
</template>

<script setup lang="ts">
  import Header from '@/components/dashboard/Header.vue';
  import AssociationInfoCard from '@/components/crm/home/AssociationInfoCard.vue';
  import EditAssociationDialog from '@/components/crm/home/EditAssociationDialog.vue';
  import DeleteAssociationDialog from '@/components/crm/home/DeleteAssociationDialog.vue';
  import StripeConnectDialog from '@/components/crm/home/StripeConnectDialog.vue';
  import { useCrmAccess } from '@/composables/crm-access';
  import type { Association } from '@/interfaces';
  import type { FileMetadata } from '@/interfaces/file.interface';
  import { Status } from '@/enums/status';
  import { useCrmStore } from '@/stores/crm';
  import { useAuthStore } from '@/stores/auth';
  import Database from '@/utils/database.utils';
  import api from '@/utils/api.utils';
  import { onMounted, onActivated, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { associationCrmErrorMessages } from '@/utils/errors/crm/associations';
  import { useToast } from 'vue-toastification';
  import { AlertTriangle, Info, XCircle } from 'lucide-vue-next';

  const crmStore = useCrmStore();
  const authStore = useAuthStore();
  const router = useRouter();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const toast = useToast();

  const association = ref<Association | null>(null);
  const imageKey = ref(0);
  const isEditDialogOpen = ref(false);
  const isDeleteDialogOpen = ref(false);
  const isStripeDialogOpen = ref(false);
  const isLoading = ref(false);
  const isStripeLoading = ref(false);
  const stripeMessage = ref<string>('');
  const stripeMessageType = ref<'success' | 'warning'>('success');

  const logoFile = ref<File | null>(null);
  const logoPreview = ref<string>('');
  const imageFile = ref<File | null>(null);
  const imagePreview = ref<string>('');
  const aboutImageFile = ref<File | null>(null);
  const aboutImagePreview = ref<string>('');
  const galleryImages = ref<
    Array<{ index?: number; url?: string; file?: File; preview?: string; isNew?: boolean }>
  >([]);

  async function fetchAssociation() {
    if (!crmStore.currentAssociationId) {
      console.error("Pas d'ID d'association dans le store");
      return;
    }

    try {
      // Récupérer les données de l'association
      const associationData = await Database.getOne('association', crmStore.currentAssociationId);

      // Récupérer les fichiers de l'association
      const files = await loadAssociationFiles(crmStore.currentAssociationId);

      // Construire l'objet association avec les URLs des images
      association.value = {
        ...associationData,
        logo: getFileUrl('logo', files, crmStore.currentAssociationId),
        image: getFileUrl('banner', files, crmStore.currentAssociationId),
        aboutImage: getFileUrl('about_image', files, crmStore.currentAssociationId),
        images: getGalleryUrls(files, crmStore.currentAssociationId),
      };

      // Forcer le rechargement des images
      imageKey.value++;

      if (authStore.associations) {
        const userAssociation = authStore.associations.find(
          (ua) => ua.association.id === crmStore.currentAssociationId
        );
        if (userAssociation) {
          userAssociation.association.status = associationData.status;
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'association:", error);
    }
  }

  const getFileUrl = (
    purpose: string,
    files: FileMetadata[],
    associationId: string
  ): string | undefined => {
    const file = files.find((f) => f.purpose === purpose);
    const timestamp = Date.now() + Math.random();
    return file
      ? `/files/Association/${associationId}?index=${file.index}&t=${timestamp}`
      : undefined;
  };

  const getGalleryUrls = (files: FileMetadata[], associationId: string): string[] => {
    const galleryFiles = files
      .filter((f) => f.purpose === 'gallery')
      .sort((a, b) => a.index - b.index);

    return galleryFiles.map((file) => {
      const timestamp = Date.now() + Math.random();
      return `/files/Association/${associationId}?index=${file.index}&t=${timestamp}`;
    });
  };

  const loadAssociationFiles = async (associationId: string): Promise<FileMetadata[]> => {
    const files: FileMetadata[] = [];
    let index = 0;

    while (true) {
      try {
        const response = await api.get(`/files/Association/${associationId}/metadata`, {
          params: { index },
        });
        if (response.data) {
          files.push(response.data);
          index++;
        } else {
          break;
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          break;
        } else {
          console.error('Error loading file metadata:', err);
          break;
        }
      }
    }

    return files;
  };

  async function openEditDialog() {
    if (association.value) {
      logoPreview.value = association.value.logo || '';
      imagePreview.value = association.value.image || '';
      aboutImagePreview.value = association.value.aboutImage || '';
      logoFile.value = null;
      imageFile.value = null;
      aboutImageFile.value = null;

      await loadGalleryImages();

      isEditDialogOpen.value = true;
    }
  }

  const loadGalleryImages = async () => {
    if (!association.value) return;

    try {
      const files = await loadAssociationFiles(association.value.id);
      const galleryFiles = files.filter((f) => f.purpose === 'gallery');

      galleryImages.value = galleryFiles.map((file) => ({
        index: file.index,
        url: `/files/Association/${association.value!.id}?index=${file.index}&t=${Date.now()}`,
        isNew: false,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des images de la galerie:', error);
    }
  };

  async function handleUpdate(data: {
    name: string;
    description?: string;
    aboutText?: string;
    contact?: string;
    primaryColor?: string;
    galleryFiles?: { file: File }[];
    imagesToDelete?: number[];
  }) {
    if (!association.value) return;

    try {
      isLoading.value = true;

      const {
        galleryFiles: filesToUpload,
        imagesToDelete: imagesToRemove,
        ...associationData
      } = data;

      await Database.update('association', association.value.id, associationData);

      let currentFiles = await loadAssociationFiles(association.value.id);

      if (logoFile.value) {
        const existingLogo = currentFiles.find((f) => f.purpose === 'logo');
        const logoIndex = existingLogo ? existingLogo.index : 0;

        await Database.updateFile(logoFile.value, {
          relatedTo: 'Association',
          relatedBy: association.value.id,
          purpose: 'logo',
          index: logoIndex,
        });
      }

      if (imageFile.value) {
        const existingBanner = currentFiles.find((f) => f.purpose === 'banner');
        const bannerIndex = existingBanner ? existingBanner.index : 0;

        await Database.updateFile(imageFile.value, {
          relatedTo: 'Association',
          relatedBy: association.value.id,
          purpose: 'banner',
          index: bannerIndex,
        });
      }

      if (aboutImageFile.value) {
        const existingAbout = currentFiles.find((f) => f.purpose === 'about_image');
        const aboutIndex = existingAbout ? existingAbout.index : 2;

        await Database.updateFile(aboutImageFile.value, {
          relatedTo: 'Association',
          relatedBy: association.value.id,
          purpose: 'about_image',
          index: aboutIndex,
        });
      }

      if (imagesToRemove && imagesToRemove.length > 0) {
        for (const imageIndex of imagesToRemove) {
          await api.delete(
            `/files/Association/${association.value.id}?index=${imageIndex}&purpose=gallery`
          );
        }
        currentFiles = await loadAssociationFiles(association.value.id);
      }

      if (filesToUpload && filesToUpload.length > 0) {
        const galleryFiles = currentFiles.filter((f) => f.purpose === 'gallery');

        let nextAvailableIndex =
          galleryFiles.length > 0 ? Math.max(...galleryFiles.map((f) => f.index)) + 1 : 3;

        for (const { file } of filesToUpload) {
          const renamedFile = new File([file], `gallery_${nextAvailableIndex}`, {
            type: file.type,
          });

          await Database.updateFile(renamedFile, {
            relatedTo: 'Association',
            relatedBy: association.value.id,
            purpose: 'gallery',
            index: nextAvailableIndex,
          });

          nextAvailableIndex++;
        }
      }

      isEditDialogOpen.value = false;
      logoFile.value = null;
      imageFile.value = null;
      aboutImageFile.value = null;
      logoPreview.value = '';
      imagePreview.value = '';
      aboutImagePreview.value = '';
      galleryImages.value = [];

      await fetchAssociation();

      toast.success(associationCrmErrorMessages.update.success);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'association:", error);
      toast.error(associationCrmErrorMessages.update.error);
    } finally {
      isLoading.value = false;
    }
  }

  async function createNewStripeAccount() {
    if (!association.value) return;

    try {
      isStripeLoading.value = true;
      stripeMessage.value = '';

      const response = await api.post('/stripe-accounts', {
        associationId: association.value.id,
      });

      if (response.data.onboardingUrl) {
        stripeMessage.value = response.data.message || 'Compte créé. Redirection vers Stripe...';
        stripeMessageType.value = 'success';

        setTimeout(() => {
          window.open(response.data.onboardingUrl, '_blank');
        }, 1000);

        setTimeout(async () => {
          await fetchAssociation();
        }, 2000);
      }

      toast.success('Compte Stripe créé avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la création du compte Stripe:', error);
      stripeMessage.value =
        error.response?.data?.message || 'Erreur lors de la création du compte Stripe';
      stripeMessageType.value = 'warning';
      toast.error('Erreur lors de la création du compte Stripe');
    } finally {
      isStripeLoading.value = false;
    }
  }

  async function checkStripeStatus() {
    if (!association.value) return;

    try {
      isStripeLoading.value = true;
      stripeMessage.value = '';

      const response = await api.put(`/stripe-accounts/${association.value.id}/check-status`);

      stripeMessage.value = response.data.message || 'Statut vérifié';
      stripeMessageType.value = response.data.canReceiveDonations ? 'success' : 'warning';

      await fetchAssociation();

      toast.success('Statut Stripe vérifié');
    } catch (error: any) {
      console.error('Erreur lors de la vérification du statut:', error);
      stripeMessage.value = error.response?.data?.message || 'Erreur lors de la vérification';
      stripeMessageType.value = 'warning';
      toast.error('Erreur lors de la vérification du statut');
    } finally {
      isStripeLoading.value = false;
    }
  }

  async function handleDelete() {
    if (!association.value) return;

    try {
      isLoading.value = true;
      await Database.delete(`association/${association.value.id}`);
      isDeleteDialogOpen.value = false;
      toast.success(associationCrmErrorMessages.delete.success);
      router.push('/associations');
    } catch (error) {
      console.error("Erreur lors de la suppression de l'association:", error);
      toast.error(associationCrmErrorMessages.delete.error);
    } finally {
      isLoading.value = false;
    }
  }

  onMounted(() => {
    if (crmStore.currentAssociationId) {
      fetchAssociation();
    }
  });

  onActivated(() => {
    if (crmStore.currentAssociationId) {
      fetchAssociation();
    }
  });
</script>
