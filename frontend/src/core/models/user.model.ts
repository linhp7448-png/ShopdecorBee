export interface Address {
  id: number;
  fullName: string;
  phone: string;
  line1: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  addresses: Address[];
  createdAt: string;
}
