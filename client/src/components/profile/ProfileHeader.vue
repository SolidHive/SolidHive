<template>
  <div class="bg-card border-border mb-6 rounded-3xl border p-4 shadow-sm sm:p-6">
    <div
      class="flex min-w-0 flex-col items-start gap-4 md:flex-row md:items-center md:justify-between md:gap-6"
    >
      <div class="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <div
          class="bg-secondary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-md sm:h-16 sm:w-16"
        >
          <UserIcon class="h-6 w-6 text-white sm:h-8 sm:w-8" :stroke-width="2" />
        </div>

        <div class="min-w-0 flex-1">
          <h1
            v-if="profile"
            class="font-title text-foreground mb-1 text-xl break-words sm:text-2xl"
          >
            {{ profile.name }} {{ profile.firstname }}
          </h1>
          <div class="flex flex-wrap items-center gap-2 text-sm">
            <span v-if="profile" class="font-paragraph text-muted-foreground break-words">
              Membre depuis {{ formatDate(profile.createdAt, true) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Notifications Bell -->
      <div class="relative">
        <Button variant="ghost" size="sm" class="relative" @click="toggleNotifications">
          <Bell class="h-5 w-5" />
          <span
            v-if="notificationsStore.pendingNotificationsCount > 0"
            class="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium"
          >
            {{ notificationsStore.pendingNotificationsCount }}
          </span>
        </Button>

        <!-- Notifications Dialog -->
        <Dialog :open="showNotifications" @update:open="showNotifications = $event">
          <DialogContent class="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle class="flex items-center gap-2">
                <Bell class="h-5 w-5" />
                Notifications
              </DialogTitle>
              <DialogDescription>Vos invitations en attente</DialogDescription>
            </DialogHeader>

            <div class="space-y-4">
              <div v-if="isLoadingNotifications" class="space-y-3">
                <div v-for="n in 3" :key="n" class="flex items-center space-x-3">
                  <Skeleton class="h-10 w-10 rounded-full" />
                  <div class="flex-1 space-y-2">
                    <Skeleton class="h-4 w-full" />
                    <Skeleton class="h-3 w-2/3" />
                  </div>
                </div>
              </div>

              <div v-else-if="pendingNotifications.length === 0" class="py-8 text-center">
                <Bell class="text-muted-foreground/50 mx-auto h-12 w-12" />
                <p class="font-paragraph text-muted-foreground mt-2">
                  Aucune notification en attente
                </p>
              </div>

              <div v-else class="max-h-64 space-y-3 overflow-y-auto">
                <div
                  v-for="notification in pendingNotifications"
                  :key="notification.id"
                  class="hover:bg-muted/50 flex items-start space-x-3 rounded-lg border p-3 transition-colors"
                >
                  <div
                    class="bg-secondary/10 flex h-10 w-10 items-center justify-center rounded-full"
                  >
                    <Mail class="text-secondary h-5 w-5" />
                  </div>
                  <div class="flex-1 space-y-1">
                    <p class="font-paragraph text-foreground text-sm">
                      <span class="font-medium">{{ notification.associationName }}</span>
                      vous invite à rejoindre l'association
                    </p>
                    <p class="font-paragraph text-muted-foreground text-xs">
                      {{ formatDate(notification.createdAt) }}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    @click="goToInvitation(notification.invitationId)"
                  >
                    Voir
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { User as UserIcon, Bell, Mail } from 'lucide-vue-next';
  import { Button } from '@/components/ui/button';
  import { Skeleton } from '@/components/ui/skeleton';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
  import Database from '@/utils/database.utils';
  import { useNotificationsStore } from '@/stores/notifications';
  import type { User } from '@/interfaces';

  const router = useRouter();
  const notificationsStore = useNotificationsStore();

  interface Props {
    profile: User | null;
  }

  const props = defineProps<Props>();

  const showNotifications = ref(false);
  const pendingNotifications = ref<any[]>([]);
  const isLoadingNotifications = ref(false);

  function formatDate(dateString: string, shortFormat = false): string {
    if (!dateString) {
      return 'Date inconnue';
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }

    if (shortFormat) {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    }

    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  function toggleNotifications() {
    showNotifications.value = true;
    loadPendingNotifications();
  }

  async function loadPendingNotifications() {
    if (!props.profile?.email) {
      return;
    }

    try {
      isLoadingNotifications.value = true;
      const userAssociations = await Database.getAll('users/me/associations');
      const invitations = userAssociations.filter((ua: any) => ua.status === 'pending');

      pendingNotifications.value = invitations.map((invitation: any) => ({
        id: invitation.id,
        invitationId: invitation.id,
        associationName: invitation.association?.name || 'Association',
        createdAt: invitation.createdAt || new Date().toISOString(),
      }));

      // Mettre à jour le store centralisé
      notificationsStore.pendingNotificationsCount = invitations.length;
    } catch (error) {
      console.error('Erreur lors du chargement des notifications :', error);
      pendingNotifications.value = [];
      notificationsStore.pendingNotificationsCount = 0;
    } finally {
      isLoadingNotifications.value = false;
    }
  }

  function goToInvitation(invitationId: string) {
    showNotifications.value = false;
    router.push(`/invitation/${invitationId}`);
  }

  onMounted(() => {
    loadPendingNotifications();
  });
</script>
