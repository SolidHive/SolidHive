import type { RouteRecordRaw } from 'vue-router';
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: 'Accueil' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: {
      title: 'Connexion',
      guestOnly: true,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue'),
    meta: {
      title: 'Inscription',
      guestOnly: true,
    },
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: () => import('../views/auth/VerifyEmail.vue'),
    meta: {
      title: "Vérification de l'email",
      requiresAuth: false,
    },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('../views/auth/ForgotPassword.vue'),
    meta: {
      title: 'Mot de passe oublié',
      requiresAuth: false,
    },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('../views/auth/ResetPassword.vue'),
    meta: {
      title: 'Réinitialiser le mot de passe',
      requiresAuth: false,
    },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/profile/Profile.vue'),
    meta: {
      title: 'Mon profil',
      requiresAuth: true,
    },
  },
  {
    path: '/profile/donations',
    name: 'Donations',
    component: () => import('../views/profile/Donations.vue'),
    meta: {
      title: 'Mes dons',
      requiresAuth: true,
    },
  },
  {
    path: '/associations',
    name: 'Associations',
    component: () => import('../views/association/Associations.vue'),
    meta: {
      title: 'Associations',
    },
  },
  {
    path: '/cagnottes',
    name: 'Cagnottes',
    component: () => import('../views/cagnotte/Cagnottes.vue'),
    meta: {
      title: 'Cagnottes',
    },
  },
  {
    path: '/association/:associationId/fundraising/:id',
    name: 'CagnotteDetail',
    component: () => import('../views/cagnotte/CagnotteDetail.vue'),
    meta: {
      title: 'Détails de la cagnotte',
    },
  },
  {
    path: '/association/:associationId/event/:id',
    name: 'EventDetail',
    component: () => import('../views/event/EventDetail.vue'),
    meta: {
      title: "Détails de l'événement",
    },
  },
  {
    path: '/association/:id',
    name: 'AssociationDetail',
    component: () => import('../views/association/AssociationDetail.vue'),
    meta: {
      title: "Détails de l'association",
    },
  },
  {
    path: '/association/:id/donate',
    name: 'Donation',
    component: () => import('../views/donation/Donation.vue'),
    meta: {
      title: 'Faire un don',
    },
  },
  {
    path: '/events',
    name: 'Events',
    component: () => import('../views/event/Events.vue'),
    meta: {
      title: 'Événements',
    },
  },
  {
    path: '/crm/:id',
    name: 'CRM',
    component: () => import('../views/crm/Shell.vue'),
    meta: {
      title: 'CRM',
      dashboard: true,
    },
    redirect(to, _) {
      return { name: 'CRMHome', params: to.params };
    },
    children: [
      {
        path: 'home',
        name: 'CRMHome',
        component: () => import('../views/crm/Home.vue'),
        meta: { title: 'Accueil - CRM', header: 'Accueil' },
      },
      {
        path: 'members',
        name: 'CRMMembers',
        component: () => import('../views/crm/Members.vue'),
        meta: { title: 'Membres - CRM', header: 'Membres' },
      },
      {
        path: 'roles',
        name: 'CRMRoles',
        component: () => import('../views/crm/Roles.vue'),
        meta: { title: 'Rôles - CRM', header: 'Rôles' },
      },
      {
        path: 'announcements',
        name: 'CRMAnnouncements',
        component: () => import('../views/crm/Announcements.vue'),
        meta: { title: 'Annonces - CRM', header: 'Annonces' },
      },
    ],
  },
  {
    path: '/donation/success',
    name: 'DonationSuccess',
    component: () => import('../views/donation/DonationSuccess.vue'),
    meta: {
      title: 'Don réussi',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: 'Page introuvable',
    },
  },
];

export default routes;
