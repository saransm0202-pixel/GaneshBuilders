export interface NavLink {
  label: string;
  target: string;
}

export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export interface ConstructionPackage {
  id: string;
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

export interface Project {
  id: number;
  name: string;
  location: string;
  area: string;
  type: string;
  status: string;
  image: string;
}

export interface ServiceItem {
  title: string;
  description: string;
  icon: string;
}

export interface Advantage {
  title: string;
  description: string;
  icon: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface SocialLink {
  name: string;
  href: string;
}

export interface EnquiryPayload {
  name: string;
  phone: string;
  email: string;
  plotLocation: string;
  plotArea: string;
  package: string;
  message: string;
}
