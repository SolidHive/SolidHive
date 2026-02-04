import { DataSource } from 'typeorm';
import { PermissionAccess } from '../modules/admin/permissions-access/entities/permission-access.entity';
import { Permissions } from '../common/enums/permissions';

export async function seedPermissionAccess(dataSource: DataSource): Promise<void> {
  console.log('🌱 Seeding permission access...');

  const permissionAccessRepository = dataSource.getRepository(PermissionAccess);

  const permissions = [
    { permission: Permissions.ALL, requiresSubscription: false },
    { permission: Permissions.ROLES_CREATE, requiresSubscription: false },
    { permission: Permissions.ROLES_DELETE, requiresSubscription: false },
    { permission: Permissions.ROLES_UPDATE, requiresSubscription: false },
    { permission: Permissions.ROLES_VIEW, requiresSubscription: false },
    { permission: Permissions.EVENTS_CREATE, requiresSubscription: true },
    { permission: Permissions.EVENTS_DELETE, requiresSubscription: true },
    { permission: Permissions.EVENTS_UPDATE, requiresSubscription: true },
    { permission: Permissions.REGISTERS_CREATE, requiresSubscription: true },
    { permission: Permissions.REGISTERS_DELETE, requiresSubscription: true },
    { permission: Permissions.REGISTERS_UPDATE, requiresSubscription: true },
    { permission: Permissions.REGISTERS_VIEW, requiresSubscription: true },
    { permission: Permissions.FUNDRAISINGS_CREATE, requiresSubscription: true },
    { permission: Permissions.FUNDRAISINGS_DELETE, requiresSubscription: true },
    { permission: Permissions.FUNDRAISINGS_UPDATE, requiresSubscription: true },
    { permission: Permissions.ANNOUNCEMENTS_CREATE, requiresSubscription: false },
    { permission: Permissions.ANNOUNCEMENTS_DELETE, requiresSubscription: false },
    { permission: Permissions.ANNOUNCEMENTS_UPDATE, requiresSubscription: false },
    { permission: Permissions.ASSOCIATION_UPDATE, requiresSubscription: false },
    { permission: Permissions.ASSOCIATION_REMOVE, requiresSubscription: false },
    { permission: Permissions.STATISTICS_VIEW, requiresSubscription: true },
  ];

  for (const perm of permissions) {
    const existing = await permissionAccessRepository.findOne({
      where: { permission: perm.permission },
    });

    if (!existing) {
      await permissionAccessRepository.save(permissionAccessRepository.create(perm));
      console.log(`Created permission access for ${perm.permission}`);
    }
  }

  console.log('✅ Permission access seeding completed!');
}
