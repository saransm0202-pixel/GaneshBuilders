export interface IAppConfig {
  appConfigId: number;
  accountId: number;
  appName: string;
  appDescription?: string | null;
  appLogo?: string | null;
  contactNumber?: string | null;
  contactMail?: string | null;
  enableFacebook?: boolean | null;
  facebookLink?: string | null;
  enableWhatsapp?: boolean | null;
  whatsappLink?: string | null;
  enableInstagram?: boolean | null;
  instagramLink?: string | null;
  enableYoutube?: boolean | null;
  youtubeLink?: string | null;
}