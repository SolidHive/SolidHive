import type { HasId } from './has_id.interface';

export interface Role extends HasId {
  name: string;
  description?: string;
  permissions: string[];
}
