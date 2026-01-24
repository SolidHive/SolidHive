import type { HasId } from './has_id.interface';

export interface Role {
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
  roles?: Role[];
}

export interface UserAssociation extends HasId {
  association: {
    id: string;
    name: string;
    description?: string;
    primaryColor?: string;
    secondaryColor?: string;
    status: string;
  };
  role: {
    id: string;
    name: string;
    description?: string;
  } | null;
  status: string;
}
