<template>
  <Header />
  <div class="p-6 md:px-12">
    <div class="mx-auto max-w-4xl space-y-6">
      <!-- En-tête -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">{{ association?.name || 'Chargement...' }}</h1>
          <p class="text-muted-foreground mt-1">Gérez les informations de votre association</p>
        </div>
      </div>

      <!-- Card avec les informations de l'association -->
      <div v-if="association" class="bg-card rounded-lg border p-6 shadow-sm">
        <div class="space-y-6">
          <!-- Logo et Image de couverture -->
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="text-sm font-medium">Logo</label>
              <div
                class="bg-muted mt-2 flex h-32 items-center justify-center rounded-lg border-2 border-dashed"
              >
                <img
                  v-if="association.logo"
                  :src="association.logo"
                  alt="Logo"
                  class="h-full w-full rounded-lg object-contain p-2"
                />
                <span v-else class="text-muted-foreground text-sm">Aucun logo</span>
              </div>
            </div>
            <div>
              <label class="text-sm font-medium">Image de couverture</label>
              <div
                class="bg-muted mt-2 flex h-32 items-center justify-center rounded-lg border-2 border-dashed"
              >
                <img
                  v-if="association.image"
                  :src="association.image"
                  alt="Image de couverture"
                  class="h-full w-full rounded-lg object-cover"
                />
                <span v-else class="text-muted-foreground text-sm">Aucune image</span>
              </div>
            </div>
          </div>

          <!-- Informations principales -->
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="text-muted-foreground text-sm">Nom de l'association</label>
              <p class="mt-1 font-medium">{{ association.name }}</p>
            </div>
            <div>
              <label class="text-muted-foreground text-sm">Statut</label>
              <p class="mt-1 font-medium capitalize">{{ getStatusLabel(association.status) }}</p>
            </div>
          </div>

          <div v-if="association.description">
            <label class="text-muted-foreground text-sm">Description</label>
            <p class="mt-1 break-all">{{ association.description }}</p>
          </div>

          <div v-if="association.contact">
            <label class="text-muted-foreground text-sm">Contact</label>
            <p class="mt-1">{{ association.contact }}</p>
          </div>

          <div v-if="association.aboutText">
            <label class="text-muted-foreground text-sm">À propos</label>
            <p class="mt-1">{{ association.aboutText }}</p>
          </div>

          <div v-if="association.siret">
            <label class="text-muted-foreground text-sm">SIRET</label>
            <p class="mt-1 font-mono">{{ association.siret }}</p>
          </div>

          <div v-if="association.additionalRequest" class="rounded-lg bg-yellow-50 p-4">
            <label class="text-sm font-medium text-yellow-900">
              Demande d'informations supplémentaires
            </label>
            <p class="mt-1 text-sm text-yellow-800">{{ association.additionalRequest }}</p>
          </div>

          <!-- Couleurs -->
          <div class="grid gap-4 md:grid-cols-2">
            <div v-if="association.primaryColor">
              <label class="text-muted-foreground text-sm">Couleur principale</label>
              <div class="mt-1 flex items-center gap-2">
                <div
                  class="h-8 w-8 rounded border"
                  :style="{ backgroundColor: association.primaryColor }"
                />
                <span class="font-mono text-sm">{{ association.primaryColor }}</span>
              </div>
            </div>
            <div v-if="association.secondaryColor">
              <label class="text-muted-foreground text-sm">Couleur secondaire</label>
              <div class="mt-1 flex items-center gap-2">
                <div
                  class="h-8 w-8 rounded border"
                  :style="{ backgroundColor: association.secondaryColor }"
                />
                <span class="font-mono text-sm">{{ association.secondaryColor }}</span>
              </div>
            </div>
          </div>

          <!-- Stripe -->
          <div v-if="association.stripeAccountId || crmAccess.isOwner">
            <label class="text-muted-foreground text-sm">Stripe Connect</label>
            <div v-if="association.stripeAccountId" class="mt-1 flex items-center gap-2">
              <span class="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                Connecté
              </span>
              <span
                v-if="association.canReceiveDonations"
                class="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
              >
                Peut recevoir des dons
              </span>
              <span class="text-muted-foreground font-mono text-xs">
                {{ association.stripeAccountId }}
              </span>
            </div>
            <div v-else class="mt-1">
              <p class="text-muted-foreground mb-2 text-sm">
                Aucun compte Stripe Connect configuré
              </p>
            </div>
            <div v-if="crmAccess.isOwner" class="mt-3">
              <Button variant="outline" size="sm" @click="openStripeDialog">
                <CreditCard class="mr-2 h-4 w-4" />
                {{ association.stripeAccountId ? 'Gérer le compte Stripe' : 'Configurer Stripe' }}
              </Button>
            </div>
          </div>

          <!-- Actions -->
          <div class="border-t pt-4">
            <div class="flex flex-wrap gap-3">
              <Button
                v-if="crmAccess.canUpdateAssociation"
                variant="default"
                @click="openEditDialog"
              >
                <Pencil class="mr-2 h-4 w-4" />
                Modifier l'association
              </Button>
              <Button
                v-if="crmAccess.canRemoveAssociation"
                variant="destructive"
                @click="openDeleteDialog"
              >
                <Trash2 class="mr-2 h-4 w-4" />
                Supprimer l'association
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Message de chargement -->
      <div v-else class="bg-card rounded-lg border p-12 text-center shadow-sm">
        <p class="text-muted-foreground">Chargement des informations...</p>
      </div>
    </div>
  </div>

  <!-- Dialog de modification -->
  <Dialog v-model:open="isEditDialogOpen">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Modifier l'association</DialogTitle>
        <DialogDescription>
          Modifiez les informations de votre association ci-dessous.
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-4 py-4">
        <!-- Images -->
        <div class="grid gap-4 md:grid-cols-2">
          <ImageUpload
            v-model="logoFile"
            v-model:preview="logoPreview"
            label="Logo"
            :button-text="logoPreview ? 'Changer le logo' : 'Ajouter un logo'"
            help-text="Format recommandé : PNG avec fond transparent (max 5 Mo)"
            height="sm"
          />
          <ImageUpload
            v-model="imageFile"
            v-model:preview="imagePreview"
            label="Image de couverture"
            :button-text="imagePreview ? 'Changer l\'image' : 'Ajouter une image'"
            help-text="Format recommandé : JPG ou PNG (max 5 Mo)"
            height="sm"
          />
        </div>

        <InputForm
          v-model="editForm.name.$value"
          input-name="association-name"
          type="text"
          placeholder="Nom de l'association"
          :error-message="editForm.name.$error?.message || ''"
          :error-state="showError('name')"
          @blur="() => (touchedFields.name = true)"
        >
          <template #label>
            Nom
            <span class="text-destructive">*</span>
          </template>
        </InputForm>

        <TextareaForm
          v-model="editForm.description.$value"
          input-name="association-description"
          placeholder="Description de l'association"
          :error-message="editForm.description.$error?.message || ''"
          :error-state="showError('description')"
          :rows="3"
          :max-length="1000"
          @blur="() => (touchedFields.description = true)"
        >
          <template #label>Description</template>
        </TextareaForm>

        <TextareaForm
          v-model="editForm.aboutText.$value"
          input-name="association-about"
          placeholder="Texte à propos de l'association"
          :error-message="editForm.aboutText.$error?.message || ''"
          :error-state="showError('aboutText')"
          :rows="3"
          :max-length="1000"
          @blur="() => (touchedFields.aboutText = true)"
        >
          <template #label>À propos</template>
        </TextareaForm>

        <InputForm
          v-model="editForm.contact.$value"
          input-name="association-contact"
          type="text"
          placeholder="Email ou téléphone"
          :error-message="editForm.contact.$error?.message || ''"
          :error-state="showError('contact')"
          @blur="() => (touchedFields.contact = true)"
        >
          <template #label>Contact</template>
        </InputForm>

        <InputForm
          v-model="editForm.siret.$value"
          input-name="association-siret"
          type="text"
          placeholder="14 chiffres"
          maxlength="14"
          :error-message="editForm.siret.$error?.message || ''"
          :error-state="showError('siret')"
          @blur="() => (touchedFields.siret = true)"
        >
          <template #label>
            SIRET
            <span class="text-destructive">*</span>
          </template>
          <template #hint>
            <span v-if="!showError('siret')">Le numéro SIRET doit contenir 14 chiffres</span>
          </template>
        </InputForm>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <label class="text-sm font-medium">Couleur principale</label>
            <input
              v-model="editForm.primaryColor.$value"
              type="color"
              class="border-input bg-background ring-offset-background h-10 w-full rounded-md border px-1"
              @blur="() => (touchedFields.primaryColor = true)"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">Couleur secondaire</label>
            <input
              v-model="editForm.secondaryColor.$value"
              type="color"
              class="border-input bg-background ring-offset-background h-10 w-full rounded-md border px-1"
              @blur="() => (touchedFields.secondaryColor = true)"
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="isEditDialogOpen = false">Annuler</Button>
        <Button :disabled="isLoading" @click="handleUpdate">
          {{ isLoading ? 'Enregistrement...' : 'Enregistrer' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Dialog de suppression -->
  <Dialog v-model:open="isDeleteDialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Supprimer l'association</DialogTitle>
        <DialogDescription>
          Êtes-vous sûr de vouloir supprimer définitivement cette association ? Cette action est
          irréversible et supprimera toutes les données associées.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="isDeleteDialogOpen = false">Annuler</Button>
        <Button variant="destructive" :disabled="isLoading" @click="handleDelete">
          {{ isLoading ? 'Suppression...' : 'Supprimer' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Dialog Stripe -->
  <Dialog v-model:open="isStripeDialogOpen">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Configuration Stripe Connect</DialogTitle>
        <DialogDescription>
          Configurez votre compte Stripe Connect pour recevoir des dons et des paiements.
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-4 py-4">
        <div v-if="association?.stripeAccountId" class="space-y-4">
          <div class="bg-muted rounded-lg p-4">
            <div class="mb-2 flex items-center gap-2">
              <span class="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                Connecté
              </span>
              <span
                v-if="association.canReceiveDonations"
                class="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
              >
                Peut recevoir des dons
              </span>
            </div>
            <p class="text-muted-foreground text-sm">
              ID du compte :
              <span class="font-mono">{{ association.stripeAccountId }}</span>
            </p>
          </div>

          <div class="flex gap-2">
            <Button variant="outline" :disabled="isStripeLoading" @click="checkStripeStatus">
              {{ isStripeLoading ? 'Vérification...' : 'Vérifier le statut' }}
            </Button>
            <Button
              variant="destructive"
              :disabled="isStripeLoading"
              @click="createNewStripeAccount"
            >
              {{ isStripeLoading ? 'Création...' : 'Remplacer le compte' }}
            </Button>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="bg-muted rounded-lg p-4">
            <p class="text-muted-foreground text-sm">
              Aucun compte Stripe Connect configuré. Créez-en un pour commencer à recevoir des
              paiements.
            </p>
          </div>

          <Button :disabled="isStripeLoading" @click="createNewStripeAccount">
            {{ isStripeLoading ? 'Création...' : 'Créer un compte Stripe' }}
          </Button>
        </div>

        <div
          v-if="stripeMessage"
          class="rounded-lg p-3"
          :class="
            stripeMessageType === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-yellow-50 text-yellow-800'
          "
        >
          <p class="text-sm">{{ stripeMessage }}</p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="isStripeDialogOpen = false">Fermer</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
  import Header from '@/components/dashboard/Header.vue';
  import Button from '@/components/ui/button/Button.vue';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
  import ImageUpload from '@/components/form/ImageUpload.vue';
  import InputForm from '@/components/form/InputForm.vue';
  import TextareaForm from '@/components/form/TextareaForm.vue';
  import { useCrmAccess } from '@/composables/crm-access';
  import type { Association } from '@/interfaces';
  import { useCrmStore } from '@/stores/crm';
  import Database from '@/utils/database.utils';
  import api from '@/utils/api.utils';
  import { Pencil, Trash2, CreditCard } from 'lucide-vue-next';
  import { onMounted, ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { defineForm, field, isValidForm } from 'vue-yup-form';
  import * as yup from 'yup';
  import { associationCrmErrorMessages, validationPatterns } from '@/utils/errors/crm/associations';
  import { useToast } from 'vue-toastification';

  const crmStore = useCrmStore();
  const router = useRouter();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);
  const toast = useToast();

  const association = ref<Association | null>(null);
  const isEditDialogOpen = ref(false);
  const isDeleteDialogOpen = ref(false);
  const isStripeDialogOpen = ref(false);
  const isLoading = ref(false);
  const isStripeLoading = ref(false);
  const formSubmitted = ref(false);
  const stripeMessage = ref<string>('');
  const stripeMessageType = ref<'success' | 'warning'>('success');

  // Schéma de validation avec yup
  const editForm = defineForm({
    name: field(
      '',
      yup
        .string()
        .required(associationCrmErrorMessages.required.name)
        .min(3, associationCrmErrorMessages.length.name.min)
        .max(100, associationCrmErrorMessages.length.name.max)
    ),
    description: field(
      '',
      yup.string().optional().max(1000, associationCrmErrorMessages.length.description)
    ),
    aboutText: field(
      '',
      yup.string().optional().max(1000, associationCrmErrorMessages.length.aboutText)
    ),
    contact: field('', yup.string().optional().email(associationCrmErrorMessages.format.email)),
    siret: field(
      '',
      yup
        .string()
        .required(associationCrmErrorMessages.required.siret)
        .matches(validationPatterns.siret, associationCrmErrorMessages.format.siret)
    ),
    primaryColor: field('', yup.string().optional()),
    secondaryColor: field('', yup.string().optional()),
  });

  // Gestion des champs touchés pour l'affichage des erreurs
  const touchedFields = reactive({
    name: false,
    description: false,
    aboutText: false,
    contact: false,
    siret: false,
    primaryColor: false,
    secondaryColor: false,
  });

  const showError = (fieldName: keyof typeof touchedFields) =>
    (touchedFields[fieldName] || formSubmitted.value) && !!editForm[fieldName].$error;

  const logoFile = ref<File | null>(null);
  const logoPreview = ref<string>('');
  const imageFile = ref<File | null>(null);
  const imagePreview = ref<string>('');

  async function fetchAssociation() {
    if (!crmStore.currentAssociationId) {
      console.error("Pas d'ID d'association dans le store");
      return;
    }

    console.log("Chargement de l'association:", crmStore.currentAssociationId);

    try {
      // Récupérer les données de l'association
      const associationData = await Database.getOne('association', crmStore.currentAssociationId);
      console.log('Association chargée:', associationData);

      // Récupérer les fichiers de l'association
      const files = await loadAssociationFiles(crmStore.currentAssociationId);

      // Construire l'objet association avec les URLs des images
      association.value = {
        ...associationData,
        logo: files.logo,
        image: files.banner,
      };
    } catch (error) {
      console.error("Erreur lors du chargement de l'association:", error);
    }
  }

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: 'En attente',
      approved: 'Approuvée',
      rejected: 'Rejetée',
      active: 'Active',
      inactive: 'Inactive',
    };
    return statusMap[status] || status;
  };

  const getFileUrl = (purpose: string, associationId: string): string => {
    // Ajouter un timestamp pour forcer le rechargement de l'image
    const timestamp = new Date().getTime();
    return `/files/Association/${associationId}?index=0&purpose=${purpose}&t=${timestamp}`;
  };

  const loadAssociationFiles = async (
    associationId: string
  ): Promise<{ logo?: string; banner?: string }> => {
    const files: { logo?: string; banner?: string } = {};

    // Charger le logo
    try {
      const logoResponse = await api.get(`/files/Association/${associationId}/metadata`, {
        params: { index: 0, purpose: 'logo' },
      });
      if (logoResponse.data) {
        files.logo = getFileUrl('logo', associationId);
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Error loading logo:', err);
      }
    }

    // Charger le banner
    try {
      const bannerResponse = await api.get(`/files/Association/${associationId}/metadata`, {
        params: { index: 0, purpose: 'banner' },
      });
      if (bannerResponse.data) {
        files.banner = getFileUrl('banner', associationId);
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Error loading banner:', err);
      }
    }

    return files;
  };

  function openEditDialog() {
    if (association.value) {
      // Initialiser les valeurs du formulaire
      editForm.name.$value = association.value.name || '';
      editForm.description.$value = association.value.description || '';
      editForm.aboutText.$value = association.value.aboutText || '';
      editForm.contact.$value = association.value.contact || '';
      editForm.siret.$value = association.value.siret || '';
      editForm.primaryColor.$value = association.value.primaryColor || '#000000';
      editForm.secondaryColor.$value = association.value.secondaryColor || '#ffffff';

      // Réinitialiser les champs touchés et l'état de soumission
      Object.keys(touchedFields).forEach((key) => {
        touchedFields[key as keyof typeof touchedFields] = false;
      });
      formSubmitted.value = false;

      // Charger les images existantes
      logoPreview.value = association.value.logo || '';
      imagePreview.value = association.value.image || '';
      logoFile.value = null;
      imageFile.value = null;

      isEditDialogOpen.value = true;
    }
  }

  function openDeleteDialog() {
    isDeleteDialogOpen.value = true;
  }

  async function handleUpdate() {
    if (!association.value) return;

    formSubmitted.value = true;

    // Valider le formulaire
    if (!(await isValidForm(editForm))) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    try {
      isLoading.value = true;

      // Préparer les données pour la mise à jour
      const updateData = {
        name: editForm.name.$value.trim(),
        description: editForm.description.$value?.trim() || undefined,
        aboutText: editForm.aboutText.$value?.trim() || undefined,
        contact: editForm.contact.$value?.trim() || undefined,
        siret: editForm.siret.$value.trim(),
        primaryColor: editForm.primaryColor.$value || undefined,
        secondaryColor: editForm.secondaryColor.$value || undefined,
      };

      // Mettre à jour les informations de base
      await Database.update('association', association.value.id, updateData);

      // Mettre à jour le logo si un nouveau fichier a été sélectionné
      if (logoFile.value) {
        console.log('Mise à jour du logo...');
        await Database.updateFile(logoFile.value, {
          relatedTo: 'Association',
          relatedBy: association.value.id,
          purpose: 'logo',
          index: 0,
        });
      }

      // Mettre à jour l'image de couverture si un nouveau fichier a été sélectionné
      if (imageFile.value) {
        console.log("Mise à jour de l'image de couverture...");
        await Database.updateFile(imageFile.value, {
          relatedTo: 'Association',
          relatedBy: association.value.id,
          purpose: 'banner',
          index: 0,
        });
      }

      await fetchAssociation();
      isEditDialogOpen.value = false;
      formSubmitted.value = false;
      toast.success(associationCrmErrorMessages.update.success);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'association:", error);
      toast.error(associationCrmErrorMessages.update.error);
    } finally {
      isLoading.value = false;
    }
  }

  function openStripeDialog() {
    stripeMessage.value = '';
    isStripeDialogOpen.value = true;
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

        // Attendre un peu puis ouvrir l'URL dans un nouvel onglet
        setTimeout(() => {
          window.open(response.data.onboardingUrl, '_blank');
        }, 1000);

        // Recharger les données de l'association après création
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

      // Recharger les données de l'association
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
      // Rediriger vers la page des associations
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
</script>
