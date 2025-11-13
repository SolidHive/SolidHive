export interface User {
  name: string;
  firstname: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  associations?: UserAssociation[];
}

export interface UserAssociation {
  id: string;
  association: {
    id: string;
    name: string;
    description?: string;
    primaryColor?: string;
    secondaryColor?: string;
    status: string;
  };
  role: {
    id: string;
    name: string;
    description?: string;
  } | null;
  status: string;
}
