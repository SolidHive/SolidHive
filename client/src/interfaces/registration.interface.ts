export interface Participant {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  pricingId: string;
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  city: string;
}

export interface RegistrationData {
  eventId: string;
  associationId: string;
  selectedTickets: Record<string, number>;
  participants: Participant[];
  contact: ContactInfo;
  supportSolidHive: boolean;
  solidHivePercentage: number;
}
