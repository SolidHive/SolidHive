export interface Transaction {
  id: string;
  amount: number;
  relatedTo: string;
  relatedBy: string;
  invoicePath: string;
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
