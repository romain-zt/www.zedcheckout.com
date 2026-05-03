export interface FlagDefinitions {
  checkout_variant: 'classic' | 'experimental';
  payment_method_order: 'apple_first' | 'card_first' | 'pack_first_if_available';
  pack_redemption_enabled: boolean;
  customer_account_auth_provider: 'magic_link_email' | 'shopify';
  language_default: 'fr' | 'en';
  experimental_room_only_renting: boolean;
  notifications_email_reminder_hours: number;
}

export const FLAG_DEFAULTS: FlagDefinitions = {
  checkout_variant: 'classic',
  payment_method_order: 'card_first',
  pack_redemption_enabled: true,
  customer_account_auth_provider: 'magic_link_email',
  language_default: 'fr',
  experimental_room_only_renting: false,
  notifications_email_reminder_hours: 24,
};
