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
    component: () => import('../views/Profile.vue'),
    meta: {
      title: 'Mon profil',
      requiresAuth: true,
    },
  },
  {
    path: '/profile/donations',
    name: 'Donations',
    component: () => import('../views/Donations.vue'),
    meta: {
      title: 'Mes dons',
      requiresAuth: true,
    },
  },
  {
    path: '/associations',
    name: 'Associations',
    component: () => import('../views/Associations.vue'),
    meta: {
      title: 'Associations',
    },
  },
  {
    path: '/association/:id',
    name: 'AssociationDetail',
    component: () => import('../views/AssociationDetail.vue'),
    meta: {
      title: "Détails de l'association",
    },
  },
  {
    path: '/events',
    name: 'Events',
    component: () => import('../views/Events.vue'),
    meta: {
      title: 'Événements',
    },
  },
  {
    path: '/crm/:id',
    name: 'CRM',
    component: () => import('../views/crm/Home.vue'),
    meta: {
      title: 'CRM',
      dashboard: true,
    },
  },
  {
    path: '/donation/success',
    name: 'DonationSuccess',
    component: () => import('../views/DonationSuccess.vue'),
    meta: {
      title: 'Don réussi',
    },
  },
];

export default routes;
