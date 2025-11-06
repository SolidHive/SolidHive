export interface Association {
  id: string;
  name: string;
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
  contact?: string;
  status: string;
  aboutText?: string;
  logo?: string;
  image?: string;
  aboutImage?: string;
  images?: string[];
  createdAt?: string;
  // Propriétés Stripe Connect
  stripeAccountId?: string;
  canReceiveDonations?: boolean;
}
