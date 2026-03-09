import type { RouteRecordRaw } from 'vue-router';
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: 'Accueil' },
  },
  {
    path: '/about-premium',
    name: 'AboutPremium',
    component: () => import('../views/AboutPremium.vue'),
    meta: { title: 'À propos du premium' },
  },
  {
    path: '/premium-payment/:associationId',
    name: 'PremiumPayment',
    component: () => import('../views/PremiumPayment.vue'),
    meta: {
      title: 'Paiement Premium',
      requiresAuth: true,
    },
  },
  {
    path: '/payment/premium-success',
    name: 'PremiumSuccess',
    component: () => import('../views/PremiumSuccess.vue'),
    meta: {
      title: 'Paiement Premium Réussi',
      requiresAuth: true,
    },
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
    path: '/create-association',
    name: 'CreateAssociation',
    component: () => import('../views/association/CreateAssociation.vue'),
    meta: {
      title: 'Créer une association',
      requiresAuth: true,
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
    path: '/association/:associationId/announcement/:id',
    name: 'AnnouncementDetail',
    component: () => import('../views/announcement/AnnouncementDetail.vue'),
    meta: {
      title: "Détails de l'annonce",
    },
  },
  {
    path: '/association/:id/event/:eventId/register',
    name: 'EventRegistration',
    component: () => import('../views/event/EventRegistration.vue'),
    meta: {
      title: "Inscription à l'événement",
    },
  },
  {
    path: '/event/:eventId/registration/success',
    name: 'EventRegistrationSuccess',
    component: () => import('../views/event/EventRegistrationSuccess.vue'),
    meta: {
      title: 'Inscription confirmée',
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
    path: '/blog',
    name: 'Blog',
    component: () => import('../views/Blog.vue'),
    meta: {
      title: 'Blog SolidHive',
    },
  },
  {
    path: '/newsletter',
    name: 'Newsletter',
    component: () => import('../views/Newsletter.vue'),
    meta: { title: 'Newsletter SolidHive' },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: { title: 'Qui sommes-nous ?' },
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: () => import('../views/FAQ.vue'),
    meta: { title: 'FAQ' },
  },
  {
    path: '/legal-notice',
    name: 'LegalNotice',
    component: () => import('../views/LegalNotice.vue'),
    meta: { title: 'Mentions légales' },
  },
  {
    path: '/cookies',
    name: 'CookiePolicy',
    component: () => import('../views/CookiePolicy.vue'),
    meta: { title: 'Gestion des cookies' },
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../views/Contact.vue'),
    meta: { title: 'Contact' },
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
        meta: { title: 'Accueil - CRM' },
      },
      {
        path: 'premium-required',
        name: 'CRMPremiumRequired',
        component: () => import('../views/crm/PremiumRequired.vue'),
        meta: { title: 'Premium requis - CRM' },
      },
      {
        path: 'statistics',
        name: 'CRMStatistics',
        component: () => import('../views/crm/Statistics.vue'),
        meta: { title: 'Statistiques - CRM' },
      },
      {
        path: 'members',
        name: 'CRMMembers',
        component: () => import('../views/crm/members/Read.vue'),
        meta: { title: 'Membres - CRM' },
        children: [
          {
            path: 'create',
            name: 'CRMMembersCreate',
            component: () => import('../views/crm/members/Create.vue'),
            meta: { title: 'Créer un membre - CRM' },
          },
          {
            path: 'update/:itemId',
            name: 'CRMMembersUpdate',
            component: () => import('../views/crm/members/Update.vue'),
            meta: { title: 'Modifier un membre - CRM' },
          },
          {
            path: 'delete/:itemId',
            name: 'CRMMembersDelete',
            component: () => import('../views/crm/members/Delete.vue'),
            meta: { title: 'Supprimer un membre - CRM' },
          },
        ],
      },
      {
        path: 'roles',
        name: 'CRMRoles',
        component: () => import('../views/crm/roles/Read.vue'),
        meta: { title: 'Rôles - CRM' },
        children: [
          {
            path: 'create',
            name: 'CRMRolesCreate',
            component: () => import('../views/crm/roles/Create.vue'),
            meta: { title: 'Créer un rôle - CRM' },
          },
          {
            path: 'update/:itemId',
            name: 'CRMRolesUpdate',
            component: () => import('../views/crm/roles/Update.vue'),
            meta: { title: 'Modifier un rôle - CRM' },
          },
          {
            path: 'delete/:itemId',
            name: 'CRMRolesDelete',
            component: () => import('../views/crm/roles/Delete.vue'),
            meta: { title: 'Supprimer un rôle - CRM' },
          },
        ],
      },
      {
        path: 'announcements',
        name: 'CRMAnnouncements',
        component: () => import('../views/crm/announcements/Read.vue'),
        meta: { title: 'Annonces - CRM', header: 'Annonces' },
        children: [
          {
            path: 'create',
            name: 'CRMAnnouncementsCreate',
            component: () => import('../views/crm/announcements/Create.vue'),
            meta: { title: 'Créer une annonce - CRM' },
          },
          {
            path: 'update/:itemId',
            name: 'CRMAnnouncementsUpdate',
            component: () => import('../views/crm/announcements/Update.vue'),
            meta: { title: 'Modifier une annonce - CRM' },
          },
          {
            path: 'delete/:itemId',
            name: 'CRMAnnouncementsDelete',
            component: () => import('../views/crm/announcements/Delete.vue'),
            meta: { title: 'Supprimer une annonce - CRM' },
          },
        ],
      },
      {
        path: 'fundraisings',
        name: 'CRMFundraisings',
        component: () => import('../views/crm/fundraisings/Read.vue'),
        meta: { title: 'Cagnottes - CRM', header: 'Cagnottes' },
        children: [
          {
            path: 'create',
            name: 'CRMFundraisingsCreate',
            component: () => import('../views/crm/fundraisings/Create.vue'),
            meta: { title: 'Créer une cagnotte - CRM' },
          },
          {
            path: 'update/:itemId',
            name: 'CRMFundraisingsUpdate',
            component: () => import('../views/crm/fundraisings/Update.vue'),
            meta: { title: 'Modifier une cagnotte - CRM' },
          },
          {
            path: 'delete/:itemId',
            name: 'CRMFundraisingsDelete',
            component: () => import('../views/crm/fundraisings/Delete.vue'),
            meta: { title: 'Supprimer une cagnotte - CRM' },
          },
        ],
      },
      {
        path: 'events',
        name: 'CRMEvents',
        component: () => import('../views/crm/events/Read.vue'),
        meta: { title: 'Événements - CRM', header: 'Événements' },
        children: [
          {
            path: 'create',
            name: 'CRMEventsCreate',
            component: () => import('../views/crm/events/Create.vue'),
            meta: { title: 'Créer un événement - CRM' },
          },
          {
            path: ':eventId',
            name: 'CRMEventDetail',
            component: () => import('../views/crm/events/Detail.vue'),
            meta: { title: 'Détail événement - CRM' },
          },
          {
            path: ':eventId/update',
            name: 'CRMEventUpdate',
            component: () => import('../views/crm/events/Update.vue'),
            meta: { title: 'Modifier un événement - CRM' },
          },
        ],
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
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/admin-dashboard/Shell.vue'),
    meta: {
      title: 'Dashboard Admin',
      dashboard: true,
    },
    redirect(to, _) {
      return { name: 'AdminDashboardHome', params: to.params };
    },
    children: [
      {
        path: 'home',
        name: 'AdminDashboardHome',
        component: () => import('../views/admin-dashboard/Home.vue'),
        meta: { title: 'Accueil - Dashboard Admin' },
      },
      {
        path: 'associations',
        name: 'AdminDashboardAssociations',
        component: () => import('../views/admin-dashboard/associations/Read.vue'),
        meta: { title: 'Associations - Dashboard Admin' },
      },
      {
        path: 'association/:associationId',
        name: 'AdminDashboardAssociationDetail',
        component: () => import('../views/admin-dashboard/associations/Detail.vue'),
        meta: { title: 'Détails Association - Dashboard Admin' },
      },
      {
        path: 'permissions-access',
        name: 'AdminDashboardPermissionsAccess',
        component: () => import('../views/admin-dashboard/permissions-access/Read.vue'),
        meta: { title: "Permissions d'accès - Dashboard Admin" },
        children: [
          {
            path: 'create',
            name: 'AdminDashboardPermissionsAccessCreate',
            component: () => import('../views/admin-dashboard/permissions-access/Create.vue'),
            meta: { title: 'Créer une permission - Dashboard Admin' },
          },
          {
            path: 'update/:itemId',
            name: 'AdminDashboardPermissionsAccessUpdate',
            component: () => import('../views/admin-dashboard/permissions-access/Update.vue'),
            meta: { title: 'Modifier une permission - Dashboard Admin' },
          },
          {
            path: 'delete/:itemId',
            name: 'AdminDashboardPermissionsAccessDelete',
            component: () => import('../views/admin-dashboard/permissions-access/Delete.vue'),
            meta: { title: 'Supprimer une permission - Dashboard Admin' },
          },
        ],
      },
      {
        path: 'users',
        name: 'AdminDashboardUsers',
        component: () => import('../views/admin-dashboard/users/Read.vue'),
        meta: { title: 'Gestion des utilisateurs - Dashboard Admin' },
        children: [
          {
            path: 'update/:itemId',
            name: 'AdminDashboardUsersUpdate',
            component: () => import('../views/admin-dashboard/users/Update.vue'),
            meta: { title: 'Modifier un utilisateur - Dashboard Admin' },
          },
          {
            path: 'delete/:itemId',
            name: 'AdminDashboardUsersDelete',
            component: () => import('../views/admin-dashboard/users/Delete.vue'),
            meta: { title: 'Supprimer un utilisateur - Dashboard Admin' },
          },
        ],
      },
      {
        path: 'announcements',
        name: 'AdminDashboardAnnouncements',
        component: () => import('../views/admin-dashboard/announcements/Read.vue'),
        meta: { title: 'Annonces Blog - Dashboard Admin' },
        children: [
          {
            path: 'create',
            name: 'AdminDashboardAnnouncementsCreate',
            component: () => import('../views/admin-dashboard/announcements/Create.vue'),
            meta: { title: 'Créer une annonce - Dashboard Admin' },
          },
          {
            path: 'update/:itemId',
            name: 'AdminDashboardAnnouncementsUpdate',
            component: () => import('../views/admin-dashboard/announcements/Update.vue'),
            meta: { title: 'Modifier une annonce - Dashboard Admin' },
          },
          {
            path: 'delete/:itemId',
            name: 'AdminDashboardAnnouncementsDelete',
            component: () => import('../views/admin-dashboard/announcements/Delete.vue'),
            meta: { title: 'Supprimer une annonce - Dashboard Admin' },
          },
        ],
      },
    ],
  },
  {
    path: '/invitation/:invitationId',
    name: 'Invitation',
    component: () => import('../views/Invitation.vue'),
    meta: {
      title: 'Invitation à rejoindre une association',
      requiresAuth: true,
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
