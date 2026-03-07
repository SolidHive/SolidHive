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
  [Permissions.FUNDRAISINGS_CREATE]: 'Créer donations',
  [Permissions.FUNDRAISINGS_UPDATE]: 'Modifier donations',
  [Permissions.FUNDRAISINGS_DELETE]: 'Supprimer donations',
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

const CATEGORY_LABELS: Record<string, string> = {
  registers: 'Membres',
  roles: 'Rôles',
  events: 'Événements',
  fundraisings: 'Dons',
  announcements: 'Annonces',
  association: 'Association',
  statistics: 'Statistiques',
};

function getCategoryLabel(type: string): string {
  return CATEGORY_LABELS[type] || type;
}

function groupedPermissions() {
  const permissions = availablePermissions();
  const grouped: Record<string, Array<{ label: string; value: string }>> = {};

  permissions.forEach((permission) => {
    const type = permissionType(permission.value);
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(permission);
  });

  return Object.entries(grouped).map(([type, perms]) => ({
    category: getCategoryLabel(type),
    type,
    permissions: perms,
  }));
}

// Value = roles_create, output = 'roles' (pour les permissions de type 'roles_create', 'roles_update', etc.)
function permissionType(value: string): string {
  const parts = value.split('_');
  if (parts.length > 1) {
    return parts[0] as string;
  }
  return value;
}

function permissionAction(value: string): string {
  const parts = value.split('_');
  if (parts.length > 1) {
    return parts[1] as string;
  }
  return value;
}

function onPermissionChange(event: Event, permissions: string[]): void {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  if (target.checked) {
    // Si on coche une permission create/update/delete, cocher automatiquement la permission view
    const action = permissionAction(value);
    if (['create', 'update', 'delete'].includes(action)) {
      const type = permissionType(value);
      const viewPermission = `${type}_view`;
      // Vérifier que la permission view existe réellement dans l'enum
      if (
        Object.values(Permissions).includes(viewPermission as Permissions) &&
        !permissions.includes(viewPermission)
      ) {
        permissions.push(viewPermission);
      }
    }
  } else {
    // Si on décoche une permission view, décocher toutes les permissions create/update/delete correspondantes
    const action = permissionAction(value);
    if (action === 'view') {
      const type = permissionType(value);
      const relatedPermissions = [`${type}_create`, `${type}_update`, `${type}_delete`];
      relatedPermissions.forEach((perm) => {
        const index = permissions.indexOf(perm);
        if (index > -1) {
          permissions.splice(index, 1);
        }
      });
    }
  }
}

export { formatPermissionLabel, availablePermissions, groupedPermissions, onPermissionChange };
