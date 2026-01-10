import type { User } from './user.interface';

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

export interface ParticipantCRM {
  id: string;
  participantEmail: string;
  participantFirstName: string;
  participantLastName: string;
  registeredAt: string;
  user: User;
}
