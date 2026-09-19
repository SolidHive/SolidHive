import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';
import { useAuthStore } from '../stores/auth';
import { Status } from '../enums/status';

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // Scroll to top on route change
    return { top: 0 };
  },
});

router.beforeEach(async (to, _from, next) => {
  document.title = `${to.meta.title || 'Page'}`;

  const authStore = useAuthStore();

  // Tant que l'API n'a pas confirmé l'état, on la sollicite en arrière-plan.
  // Seules les pages qui dépendent de cet état l'attendent : une page publique
  // s'affiche tout de suite, même si l'API met une minute à se réveiller.
  if (authStore.isLoading) {
    const ready = authStore.loadUser();
    if (to.meta.requiresAuth || to.meta.guestOnly) {
      await ready;
    }
  }

  // Redirection si l'utilisateur est déjà connecté
  if (to.meta.guestOnly && authStore.isAuthenticated()) {
    return next('/');
  }

  // Redirection si la page nécessite une authentification
  if (to.meta.requiresAuth && !authStore.isAuthenticated()) {
    return next('/login');
  }

  // Vérification de l'accès aux routes CRM si l'association est en attente
  if (to.path.startsWith('/crm/')) {
    const associationId = to.params.id as string;
    if (associationId) {
      const userAssociation = authStore.associations.find(
        (ua) => ua.association.id === associationId
      );

      // Si l'association est en attente, on redirige vers la page d'accueil du CRM
      if (userAssociation?.association.status === Status.PENDING && to.name !== 'CRMHome') {
        return next({ name: 'CRMHome', params: { id: associationId } });
      }
    }
  }

  next();
});

export default router;
