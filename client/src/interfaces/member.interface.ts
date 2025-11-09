export interface Member {
  id: string;
  user: {
    id: string;
    name: string;
    firstname: string;
    email: string;
    phone?: string;
  };
  role: {
    id: string;
    name: string;
    description: string;
    permissions: string[];
  };
  status: string;
}
