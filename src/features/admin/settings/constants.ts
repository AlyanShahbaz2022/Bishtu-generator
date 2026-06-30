export const SETTING_KEYS = [
  "company_name",
  "company_logo",
  "company_email",
  "company_phone",
  "whatsapp_number",
  "company_address",
  "currency",
] as const;

export type SettingsInput = Partial<
  Record<(typeof SETTING_KEYS)[number], string>
>;
