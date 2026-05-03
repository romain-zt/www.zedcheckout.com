export interface TenantBranding {
  logoUrl: string | null;
  primaryColor: string | null;
}

export interface Tenant {
  id: string;
  slug: string;
  displayName: string;
  timezone: string;
  defaultLocale: 'fr' | 'en';
  locales: Array<'fr' | 'en'>;
  branding: TenantBranding;
  createdAt: Date;
}
