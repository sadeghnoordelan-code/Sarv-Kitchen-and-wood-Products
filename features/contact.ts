export type ContactDetail = {
  key:
    | "phone"
    | "mobile"
    | "email"
    | "instagram"
    | "website"
    | "showroom"
    | "factory"
    | "whatsapp";
  label: string;
  value: string | null;
  href: string | null;
};

// Replace null values and hrefs only after SARV approves the corresponding fact.
export const contactDetails: readonly ContactDetail[] = [
  { key: "phone", label: "Phone", value: null, href: null },
  { key: "mobile", label: "Mobile", value: null, href: null },
  { key: "email", label: "Email", value: null, href: null },
  { key: "instagram", label: "Instagram", value: null, href: null },
  { key: "website", label: "Website", value: null, href: null },
  { key: "showroom", label: "Showroom", value: null, href: null },
  { key: "factory", label: "Factory", value: null, href: null },
  { key: "whatsapp", label: "WhatsApp", value: null, href: null },
] as const;
