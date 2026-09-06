import { IUser } from './user.model';

export interface ISendOtpReq {
  email: string;
  accountId: number;
}

export interface IVerifyOtpReq {
  email: string;
  otp: string;
  accountId: number;
}

export interface IOtpResponse {
  success: boolean;
  message: string;
}

export interface IAuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface ILoggedInUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePic: string;
  roleId: number | null;
  roleName: string;
  isActive: boolean;
}
