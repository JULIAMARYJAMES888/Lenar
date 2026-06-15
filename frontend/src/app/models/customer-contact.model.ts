export interface CustomerContact {
  contactId?: number;
  phoneNumber?: string;
  email?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  customerId: number;
}
