export interface IConsultationRequest {
  accountId: number;
  name: string;
  phone: string;
  email: string;
  plotLocation: string;
  plotArea?: string;
  package?: string;
  message?: string;
}

export interface IConsultationResponse {
  success: boolean;
  message: string;
}