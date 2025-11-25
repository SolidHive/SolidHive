import type { HasId } from './has_id.interface';

export interface User {
  name: string;
  firstname: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  associations?: UserAssociation[];
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
