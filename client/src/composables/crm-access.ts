import { Permissions } from '@/enums/permissions';
import type { Member } from '@/interfaces/member.interface';

export function useCrmAccess(member: Member) {
  const canAccessToMembers = member.role.permissions.some(
    (permission) => permission === Permissions.REGISTERS_VIEW || permission === Permissions.ALL
  );

  const canCreateMember = member.role.permissions.some(
    (permission) => permission === Permissions.ALL || permission === Permissions.REGISTERS_CREATE
  );

  const canUpdateMember = member.role.permissions.some(
    (permission) => permission === Permissions.ALL || permission === Permissions.REGISTERS_UPDATE
  );

  const canRemoveMember = member.role.permissions.some(
    (permission) => permission === Permissions.ALL || permission === Permissions.REGISTERS_DELETE
  );

  const canAccessToRoles = member.role.permissions.some(
    (permission) => permission === Permissions.ROLES_VIEW || permission === Permissions.ALL
  );

  const canCreateRole = member.role.permissions.some(
    (permission) => permission === Permissions.ALL || permission === Permissions.ROLES_CREATE
  );

  const canUpdateRole = member.role.permissions.some(
    (permission) => permission === Permissions.ALL || permission === Permissions.ROLES_UPDATE
  );

  const canRemoveRole = member.role.permissions.some(
    (permission) => permission === Permissions.ALL || permission === Permissions.ROLES_DELETE
  );

  const canCreateAnnouncement = member.role.permissions.some(
    (permission) =>
      permission === Permissions.ALL || permission === Permissions.ANNOUNCEMENTS_CREATE
  );

  const canUpdateAnnouncement = member.role.permissions.some(
    (permission) =>
      permission === Permissions.ALL || permission === Permissions.ANNOUNCEMENTS_UPDATE
  );

  const canRemoveAnnouncement = member.role.permissions.some(
    (permission) =>
      permission === Permissions.ALL || permission === Permissions.ANNOUNCEMENTS_DELETE
  );

  const canCreateFundraising = member.role.permissions.some(
    (permission) => permission === Permissions.ALL || permission === Permissions.FUNDRAISINGS_CREATE
  );

  const canUpdateFundraising = member.role.permissions.some(
    (permission) => permission === Permissions.ALL || permission === Permissions.FUNDRAISINGS_UPDATE
  );

  const canRemoveFundraising = member.role.permissions.some(
    (permission) => permission === Permissions.ALL || permission === Permissions.FUNDRAISINGS_DELETE
  );

  const canUpdateAssociation = member.role.permissions.some(
    (permission) => permission === Permissions.ALL || permission === Permissions.ASSOCIATION_UPDATE
  );

  const canRemoveAssociation = member.role.permissions.some(
    (permission) => permission === Permissions.ALL || permission === Permissions.ASSOCIATION_REMOVE
  );

  const canCreateEvent = member.role.permissions.some(
    (permission) => permission === Permissions.ALL || permission === Permissions.EVENTS_CREATE
  );

  const canUpdateEvent = member.role.permissions.some(
    (permission) => permission === Permissions.ALL || permission === Permissions.EVENTS_UPDATE
  );

  const canDeleteEvent = member.role.permissions.some(
    (permission) => permission === Permissions.ALL || permission === Permissions.EVENTS_DELETE
  );

  const canAccessToStatistics = member.role.permissions.some(
    (permission) => permission === Permissions.ALL || permission === Permissions.STATISTICS_VIEW
  );

  const isOwner = member.role.name === 'owner';

  return {
    canAccessToMembers,
    canCreateMember,
    canUpdateMember,
    canRemoveMember,
    canAccessToRoles,
    canCreateRole,
    canUpdateRole,
    canRemoveRole,
    canCreateAnnouncement,
    canUpdateAnnouncement,
    canRemoveAnnouncement,
    canCreateFundraising,
    canUpdateFundraising,
    canRemoveFundraising,
    canUpdateAssociation,
    canRemoveAssociation,
    canCreateEvent,
    canUpdateEvent,
    canDeleteEvent,
    canAccessToStatistics,
    isOwner,
  };
}
