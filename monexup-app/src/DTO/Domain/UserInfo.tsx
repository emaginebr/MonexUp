import UserAddressInfo from "./UserAddressInfo";
import UserPhoneInfo from "./UserPhoneInfo";

export interface UserRole {
  roleId: number;
  slug: string;
  name: string;
}

export default interface UserInfo {
  userId: number;
  email: string;
  slug: string;
  imageUrl: string;
  name: string;
  hash: string;
  password?: string | null;
  isAdmin: boolean;
  birthDate: string;
  idDocument: string;
  pixKey?: string;
  status?: number;
  roles?: UserRole[];
  phones: UserPhoneInfo[];
  addresses: UserAddressInfo[];
  createAt: string;
  updateAt: string;
}