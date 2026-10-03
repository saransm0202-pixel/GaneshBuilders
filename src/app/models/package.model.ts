export interface IPackageFeature {
  packageFeatureId: number;
  packageId: number;
  feature: string;
  isActive: boolean;
}

export interface IPackageSpec {
  packageSpecId: number;
  packageId: number;
  specLabel: string;
  specValue: string;
  specTypeId: number | null;
  isActive: boolean;
}

export interface IPackage {
  packageId: number;
  packageName: string;
  description: string | null;
  packagePrice: number | null;
  accountId: number | null;
  constructionTypeId: number | null;
  constructionType: string | null;
  isActive: boolean;
  createdBy: number | null;
  createdDate: string | null;
  modifiedBy: number | null;
  modifiedDate: string | null;
  features: IPackageFeature[];
  specs: IPackageSpec[];
}

export interface IConstructionType {
  constructionTypeId: number;
  constructionType: string;
  description: string | null;
  isActive: boolean;
}

export interface IPackageSpecType {
  packageSpecTypeId: number;
  packageSpecType: string;
  description: string | null;
  isActive: boolean;
}