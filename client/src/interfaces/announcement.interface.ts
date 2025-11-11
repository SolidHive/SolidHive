export interface Announcement {
  id: string;
  title: string;
  content: string;
  image: string | null;
  isActive: boolean;
  timestamps?: {
    createdAt?: Date;
    updatedAt?: Date;
  };
}
