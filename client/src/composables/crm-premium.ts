import type { Permissions } from '@/enums/permissions';
import type { PermissionAccess } from '@/interfaces/permission-access.interface';
import Database from '@/utils/database.utils';

export function useCrmPremiumAccess(associationPremiumUntil: string | null) {
  const hasAccessToPremiumFeatures = async (permissions: Permissions): Promise<boolean> => {
    const permissionAccess = await getPermissionAccessByPermission(permissions);
    console.log('Permission Access:', permissionAccess);
    if (!permissionAccess || !permissionAccess.requiresSubscription) {
      return true;
    }

    const validUntil = associationPremiumUntil ? new Date(associationPremiumUntil) : null;
    const today = new Date();
    console.log('Today:', today, 'Valid Until:', validUntil);
    console.log('isValid:', validUntil !== null && today <= validUntil);
    return validUntil !== null && today <= validUntil;
  };

  return { hasAccessToPremiumFeatures };
}

async function getPermissionAccessByPermission(
  permission: Permissions
): Promise<PermissionAccess | null> {
  try {
    const result = await Database.getOne('permission-access', permission);
    return result;
  } catch (err) {
    console.error('Error fetching permission access:', err);
    return null;
  }
}
