import type { HasId } from './has_id.interface';

export interface Announcement extends HasId {
  title: string;
  content: string;
  image: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  timestamps?: {
    createdAt?: Date;
    updatedAt?: Date;
  };
}
