import type { HasId } from './has_id.interface';

export interface Fundraising extends HasId {
  title: string;
  description: string;
  image: string | null;
  amount: number;
  wantedAmount: number;
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
  association?: {
    id: string;
    name: string;
  };
}

export interface FundraisingCard extends Fundraising {
  association: {
    id: string;
    name: string;
  };
}
