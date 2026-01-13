import type { Permissions } from '@/enums/permissions';
import type { HasId } from './has_id.interface';

export interface PermissionAccess extends HasId {
  permission: Permissions;
  requiresSubscription: boolean;
}
