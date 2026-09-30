export const siteConfig = {
  name: "WealthWiseGrow",
  url: "https://wealthwisegrow.com",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null,
} as const;
