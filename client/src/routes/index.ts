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

  // Attend que l'état soit chargé pour éviter les redirections inutiles
  if (authStore.isLoading) {
    await authStore.loadUser();
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
