<template>
  <Header :title="`Association - ${association?.name || 'Chargement...'}`">
    <template #header>Association - {{ association?.name || 'Chargement...' }}</template>
  </Header>
  <div class="px-2 py-4 sm:p-6 md:px-12">
    <div class="mx-auto max-w-6xl space-y-6">
      <Button variant="ghost" class="gap-2" @click="router.back()">
        <ArrowLeft :size="16" />
        Retour
      </Button>

      <Card v-if="association">
        <CardHeader>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle class="text-base break-words sm:text-lg md:text-xl">
              {{ association.name }}
            </CardTitle>
            <StatusTag :status="association.status" class="shrink-0 self-start" />
          </div>
          <CardDescription v-if="association.description">
            {{ association.description }}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-4">
            <div>
              <label class="text-sm font-medium">SIRET</label>
              <p class="text-muted-foreground text-sm break-all">{{ association.siret }}</p>
            </div>
            <div>
              <label class="text-sm font-medium">Contact</label>
              <p class="text-muted-foreground text-sm break-all">
                {{ association.contact || 'N/A' }}
              </p>
            </div>
            <div v-if="association.createdBy">
              <label class="text-sm font-medium">Créé par</label>
              <p class="text-muted-foreground text-sm break-words capitalize">
                {{ association.createdBy.firstname }} {{ association.createdBy.name }} ({{
                  association.createdBy.email
                }})
              </p>
            </div>
            <div v-if="association.aboutText">
              <label class="text-sm font-medium">À propos</label>
              <p class="text-muted-foreground text-sm break-words">{{ association.aboutText }}</p>
            </div>
            <div v-if="association.stripeAccountId">
              <label class="text-sm font-medium">Stripe Account ID</label>
              <p class="text-muted-foreground text-sm break-all">
                {{ association.stripeAccountId }}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium">Peut recevoir des dons</label>
              <p class="text-muted-foreground text-sm">
                {{ association.canReceiveDonations ? 'Oui' : 'Non' }}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter
          v-if="association.status !== Status.ACCEPTED"
          class="flex flex-col gap-2 sm:flex-row"
        >
          <Button
            variant="default"
            class="w-full sm:flex-1"
            size="sm"
            @click="openStatusDialog(Status.ACCEPTED)"
          >
            <CheckCircle :size="16" class="mr-2" />
            <span class="text-xs sm:text-sm">Accepter</span>
          </Button>
          <Button
            variant="outline"
            class="w-full sm:flex-1"
            size="sm"
            @click="openStatusDialog(Status.ADDITIONAL_REQUEST)"
          >
            <AlertCircle :size="16" class="mr-2" />
            <span class="text-xs sm:text-sm">Demander des infos</span>
          </Button>
          <Button
            variant="destructive"
            class="w-full sm:flex-1"
            size="sm"
            @click="openStatusDialog(Status.REJECTED)"
          >
            <XCircle :size="16" class="mr-2" />
            <span class="text-xs sm:text-sm">Rejeter</span>
          </Button>
        </CardFooter>
      </Card>

      <Card v-if="members && members.length > 0">
        <CardHeader>
          <CardTitle>Membres ({{ members.length }})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="member in members" :key="member.id">
                <TableCell class="capitalize">
                  {{ member.user.firstname }} {{ member.user.name }}
                </TableCell>
                <TableCell>{{ member.user.email }}</TableCell>
                <TableCell>{{ member.user.phone || 'N/A' }}</TableCell>
                <TableCell class="capitalize">{{ member.role.name }}</TableCell>
                <TableCell><StatusTag :status="member.status" /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div v-if="!association" class="bg-card rounded-lg border p-12 text-center shadow-sm">
        <p class="text-muted-foreground">Chargement des informations...</p>
      </div>
    </div>
  </div>

  <Dialog v-model:open="isDialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription>
          {{ dialogDescription }}
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <label for="message" class="text-sm font-medium">Message (optionnel)</label>
          <TextareaForm
            v-model="statusMessage"
            input-name="message"
            :placeholder="dialogPlaceholder"
            :rows="4"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="isDialogOpen = false">Annuler</Button>
        <Button :disabled="isUpdating" @click="updateStatus">
          {{ isUpdating ? 'En cours...' : 'Confirmer' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
  import { onMounted, ref, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useToast } from 'vue-toastification';
  import Database from '@/utils/database.utils';
  import Header from '@/components/dashboard/Header.vue';
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { Button } from '@/components/ui/button';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
  import TextareaForm from '@/components/form/TextareaForm.vue';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import StatusTag from '@/components/dashboard/tags/StatusTag.vue';
  import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-vue-next';
  import type { Association } from '@/interfaces/association.interface';
  import { Status } from '@/enums/status';

  interface UserAssociation {
    id: string;
    user: {
      id: string;
      name: string;
      firstname: string;
      email: string;
      phone?: string;
    };
    role: {
      id: string;
      name: string;
    };
    status: string;
  }

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const association = ref<Association | null>(null);
  const members = ref<UserAssociation[]>([]);
  const isDialogOpen = ref(false);
  const selectedStatus = ref<Status | null>(null);
  const statusMessage = ref('');
  const isUpdating = ref(false);

  const dialogTitle = computed(() => {
    switch (selectedStatus.value) {
      case Status.ACCEPTED:
        return "Accepter l'association";
      case Status.REJECTED:
        return "Rejeter l'association";
      case Status.ADDITIONAL_REQUEST:
        return 'Demander des informations supplémentaires';
      default:
        return '';
    }
  });

  const dialogDescription = computed(() => {
    switch (selectedStatus.value) {
      case Status.ACCEPTED:
        return "L'utilisateur recevra un email de confirmation.";
      case Status.REJECTED:
        return "L'utilisateur sera informé du rejet de sa demande.";
      case Status.ADDITIONAL_REQUEST:
        return "L'utilisateur recevra un email avec vos demandes d'informations.";
      default:
        return '';
    }
  });

  const dialogPlaceholder = computed(() => {
    switch (selectedStatus.value) {
      case Status.ACCEPTED:
        return 'Message de félicitations (optionnel)...';
      case Status.REJECTED:
        return 'Raison du rejet (recommandé)...';
      case Status.ADDITIONAL_REQUEST:
        return 'Informations requises...';
      default:
        return '';
    }
  });

  const openStatusDialog = (status: Status) => {
    selectedStatus.value = status;
    statusMessage.value = '';
    isDialogOpen.value = true;
  };

  const updateStatus = async () => {
    if (!association.value || !selectedStatus.value) return;

    isUpdating.value = true;
    try {
      const payload: any = {
        status: selectedStatus.value,
      };

      if (statusMessage.value && statusMessage.value.trim()) {
        payload.message = statusMessage.value.trim();
      }

      await Database.patch(`admin/association/${association.value.id}/status`, payload);

      toast.success("Statut mis à jour avec succès. L'utilisateur a été notifié par email.");

      const associationResponse = await Database.getAll(`association/${association.value.id}`);
      association.value = associationResponse;

      isDialogOpen.value = false;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur: Impossible de mettre à jour le statut.');
    } finally {
      isUpdating.value = false;
    }
  };

  onMounted(async () => {
    const associationId = route.params.associationId as string;

    try {
      const associationResponse = await Database.getAll(`association/${associationId}`);
      association.value = associationResponse;

      const membersResponse = await Database.getAll(`association/${associationId}/users`);
      members.value = Array.isArray(membersResponse) ? membersResponse : membersResponse.data || [];
    } catch (error) {
      console.error("Erreur lors de la récupération de l'association:", error);
    }
  });
</script>
