export interface Announcement {
  id: string;
  title: string;
  description: string;
  image: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
