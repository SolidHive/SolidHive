import type { HasId } from './has_id.interface';

export interface Announcement extends HasId {
  title: string;
  content: string;
  image: string | null;
  isActive: boolean;
  timestamps?: {
    createdAt?: Date;
    updatedAt?: Date;
  };
}
