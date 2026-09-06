export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePic: string;
  roleId: number | null;
  roleName: string;
  isActive: boolean;
  accountId: number;
  loginMsg?: string;
  expiresAt?: string;
}

export interface IRole {
  roleId: number;
  role: string;
}

export interface IResponseMsg {
  statusCode: number;
  message: string;
}
