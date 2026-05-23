export const LEGAL = {
  companyName: 'Fractera, Inc.',
  companyState: 'Delaware',
  companyCountry: 'United States',
  ein: '35-2937218',
  lastUpdated: 'May 19, 2026',
  // Single inbox for the whole stack until billed mailboxes are needed. The
  // policy / legal / cookies / refund pages keep their semantic field
  // (support / legal / privacy) so we can split later without touching every
  // page — just change a value here.
  emails: {
    support: 'admin@fractera.ai',
    legal: 'admin@fractera.ai',
    privacy: 'admin@fractera.ai',
  },
} as const
