export interface Customer {
  customerId?: number;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string | Date | null;
  gender?: string;
  occupation?: string;
  isActive: boolean;
  imageUrl?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date | null;
}