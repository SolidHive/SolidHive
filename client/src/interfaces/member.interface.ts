import type { HasId } from './has_id.interface';

export interface Member extends HasId {
  user: {
    id: string;
    name: string;
    firstname: string;
    email: string;
    phone?: string;
  };
  role: {
    id: string;
    name: string;
    description: string;
    permissions: string[];
  };
  status: string;
}
