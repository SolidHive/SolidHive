export enum Roles {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export const RoleDescriptions: Record<Roles, string> = {
  [Roles.USER]: 'Utilisateur standard',
  [Roles.ADMIN]: 'Administrateur du système',
};

export const RolesList = Object.values(Roles).map((name) => ({
  name,
  description: RoleDescriptions[name],
}));
