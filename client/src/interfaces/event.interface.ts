export interface Event {
  id: string;
  title: string;
  description: string;
  image: string | null;
  startDate: string;
  endDate: string;
  amount?: number;
  association?: {
    id: string;
    name: string;
    primaryColor?: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
