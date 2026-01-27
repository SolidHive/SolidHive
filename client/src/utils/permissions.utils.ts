import { Permissions } from '@/enums/permissions';

const PERMISSION_LABELS: Record<string, string> = {
  [Permissions.REGISTERS_VIEW]: 'Voir membres',
  [Permissions.REGISTERS_CREATE]: 'Créer membres',
  [Permissions.REGISTERS_UPDATE]: 'Modifier membres',
  [Permissions.REGISTERS_DELETE]: 'Supprimer membres',
  [Permissions.ROLES_VIEW]: 'Voir rôles',
  [Permissions.ROLES_CREATE]: 'Créer rôles',
  [Permissions.ROLES_UPDATE]: 'Modifier rôles',
  [Permissions.ROLES_DELETE]: 'Supprimer rôles',
  [Permissions.EVENTS_CREATE]: 'Créer événements',
  [Permissions.EVENTS_UPDATE]: 'Modifier événements',
  [Permissions.EVENTS_DELETE]: 'Supprimer événements',
  [Permissions.FUNDRAISINGS_CREATE]: 'Créer collectes',
  [Permissions.FUNDRAISINGS_UPDATE]: 'Modifier collectes',
  [Permissions.FUNDRAISINGS_DELETE]: 'Supprimer collectes',
  [Permissions.ANNOUNCEMENTS_CREATE]: 'Créer annonces',
  [Permissions.ANNOUNCEMENTS_UPDATE]: 'Modifier annonces',
  [Permissions.ANNOUNCEMENTS_DELETE]: 'Supprimer annonces',
  [Permissions.ASSOCIATION_UPDATE]: 'Modifier association',
  [Permissions.ASSOCIATION_REMOVE]: 'Supprimer association',
  [Permissions.STATISTICS_VIEW]: 'Voir statistiques',
};

function formatPermissionLabel(permission: string): string {
  if (permission === '*') {
    return 'Tous';
  }
  return PERMISSION_LABELS[permission] || permission;
}

function availablePermissions() {
  const permissions = Object.entries(Permissions)
    .filter(([_, value]) => value !== Permissions.ALL)
    .map(([_, value]) => ({
      label: formatPermissionLabel(value),
      value: value,
    }));
  return permissions;
}

export { formatPermissionLabel, availablePermissions };
