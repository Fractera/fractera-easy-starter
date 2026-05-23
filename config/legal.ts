export const LEGAL = {
  companyName: 'Fractera, Inc.',
  companyAddressLine1: '1111B S Governors Ave',
  companyAddressLine2: 'STE 45122',
  companyCity: 'Dover',
  companyState: 'Delaware',
  companyZip: '19904',
  companyCountry: 'United States',
  ein: '35-2937218',
  lastUpdated: 'May 23, 2026',
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

// Pretty-printed single line: "Fractera, Inc., 1111B S Governors Ave STE 45122, Dover, DE 19904, USA"
// Used by emails (CAN-SPAM physical postal address) and the site footer.
export function legalAddressOneLine(): string {
  return `${LEGAL.companyName}, ${LEGAL.companyAddressLine1} ${LEGAL.companyAddressLine2}, ${LEGAL.companyCity}, DE ${LEGAL.companyZip}, USA`
}

// Multi-line for Privacy s11 "Contact" sections.
export function legalAddressBlock(): string[] {
  return [
    LEGAL.companyName,
    `${LEGAL.companyAddressLine1} ${LEGAL.companyAddressLine2}`,
    `${LEGAL.companyCity}, ${LEGAL.companyState} ${LEGAL.companyZip}`,
    LEGAL.companyCountry,
  ]
}
