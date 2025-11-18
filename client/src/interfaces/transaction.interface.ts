import type { HasId } from './has_id.interface';

export interface Transaction extends HasId {
  amount: number;
  relatedTo: string;
  relatedBy: string;
  invoicePath: string;
  solidHiveAmount?: number;
  timestamps: {
    createdAt: string;
    updatedAt: string;
  };
  user?: {
    id: string;
    name: string;
    firstname: string;
    email: string;
  };
}
