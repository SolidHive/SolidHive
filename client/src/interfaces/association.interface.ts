export interface Association {
  id: string;
  name: string;
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
  contact?: string;
  siret: string;
  status: string;
  aboutText?: string;
  additionalRequest?: string;
  logo?: string;
  image?: string;
  aboutImage?: string;
  images?: string[];
  createdAt?: string;
  // Propriétés Stripe Connect
  stripeAccountId?: string;
  canReceiveDonations?: boolean;
}
