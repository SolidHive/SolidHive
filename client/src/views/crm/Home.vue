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
            <p class="mt-1">{{ association.description }}</p>
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
          <div v-if="association.stripeAccountId">
            <label class="text-muted-foreground text-sm">Stripe Connect</label>
            <div class="mt-1 flex items-center gap-2">
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

        <div class="space-y-2">
          <label class="text-sm font-medium">Nom *</label>
          <input
            v-model="editForm.name"
            type="text"
            required
            placeholder="Nom de l'association"
            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Description</label>
          <textarea
            v-model="editForm.description"
            placeholder="Description de l'association"
            rows="3"
            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">À propos</label>
          <textarea
            v-model="editForm.aboutText"
            placeholder="Texte à propos de l'association"
            rows="3"
            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Contact</label>
          <input
            v-model="editForm.contact"
            type="text"
            placeholder="Email ou téléphone"
            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">SIRET *</label>
          <input
            v-model="editForm.siret"
            type="text"
            required
            placeholder="14 chiffres"
            maxlength="14"
            pattern="[0-9]{14}"
            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 font-mono text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p class="text-muted-foreground text-xs">Le numéro SIRET doit contenir 14 chiffres</p>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <label class="text-sm font-medium">Couleur principale</label>
            <input
              v-model="editForm.primaryColor"
              type="color"
              class="border-input bg-background ring-offset-background h-10 w-full rounded-md border px-1"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">Couleur secondaire</label>
            <input
              v-model="editForm.secondaryColor"
              type="color"
              class="border-input bg-background ring-offset-background h-10 w-full rounded-md border px-1"
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
  import { useCrmAccess } from '@/composables/crm-access';
  import type { Association } from '@/interfaces';
  import { useCrmStore } from '@/stores/crm';
  import Database from '@/utils/database.utils';
  import api from '@/utils/api.utils';
  import { Pencil, Trash2 } from 'lucide-vue-next';
  import { onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';

  const crmStore = useCrmStore();
  const router = useRouter();
  const member = crmStore.getMember();
  const crmAccess = useCrmAccess(member);

  const association = ref<Association | null>(null);
  const isEditDialogOpen = ref(false);
  const isDeleteDialogOpen = ref(false);
  const isLoading = ref(false);

  const editForm = ref({
    name: '',
    description: '',
    aboutText: '',
    contact: '',
    siret: '',
    primaryColor: '',
    secondaryColor: '',
  });

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
      editForm.value = {
        name: association.value.name || '',
        description: association.value.description || '',
        aboutText: association.value.aboutText || '',
        contact: association.value.contact || '',
        siret: association.value.siret || '',
        primaryColor: association.value.primaryColor || '#000000',
        secondaryColor: association.value.secondaryColor || '#ffffff',
      };

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

    try {
      isLoading.value = true;

      // Mettre à jour les informations de base
      await Database.update('association', association.value.id, editForm.value);

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
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'association:", error);
    } finally {
      isLoading.value = false;
    }
  }

  async function handleDelete() {
    if (!association.value) return;

    try {
      isLoading.value = true;
      await Database.delete(`association/${association.value.id}`);
      isDeleteDialogOpen.value = false;
      // Rediriger vers la page des associations
      router.push('/associations');
    } catch (error) {
      console.error("Erreur lors de la suppression de l'association:", error);
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
