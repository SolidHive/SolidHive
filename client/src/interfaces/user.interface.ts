import type { Association } from './association.interface';
import type { Role } from './roles.interface';
import type { HasId } from './has_id.interface';

export interface SystemRole {
  id: number;
  name: string;
  description?: string;
}

export interface User extends HasId {
  name: string;
  firstname: string;
  email: string;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  timestamps?: {
    createdAt: string;
    updatedAt: string;
  };
  associations?: UserAssociation[];
  roles?: SystemRole[];
}

export interface UserAssociation extends HasId {
  association: Association;
  role: Role | null;
  status: string;
}
