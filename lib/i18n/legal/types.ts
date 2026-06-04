export type PrivacyLegal = {
  title: string
  s1: { title: string; p1: string }
  s2: { title: string; intro: string; items: string[] }
  s3: { title: string; intro: string; items: string[]; note: string }
  s4: { title: string; p1: string }
  s5: { title: string; intro: string; items: string[]; note: string }
  s6: { title: string; intro: string; items: string[]; p2: string }
  s7: { title: string; intro: string; items: string[]; p2: string }
  s8: { title: string; p1: string }
  s9: { title: string; p1: string }
  s10: { title: string; p1: string }
  s12: { title: string; p1: string; p2: string }
  s11: { title: string }
}

export type TermsLegal = {
  title: string
  s1: { title: string; p1: string }
  s2: { title: string; p1: string }
  s3: { title: string; p1: string }
  s4: { title: string; p1: string }
  s5: { title: string; p1: string; p2: string }
  s6: { title: string; intro: string; items: string[] }
  s7: { title: string; p1: string }
  s8: { title: string; p1: string }
  s9: { title: string; p1: string }
  s10: { title: string; p1: string }
  s11: { title: string; p1: string; p2: string; p3: string }
  s12: { title: string; p1: string }
  s14: { title: string; p1: string; p2: string; p3: string }
  s13: { title: string }
}

export type RefundLegal = {
  title: string
  s1: { title: string; p1: string }
  s2: { title: string; intro: string; items: string[] }
  s3: { title: string; p1: string; intro: string; items: string[]; p2: string }
  s4: { title: string; p1: string; p2: string; p3: string }
  s5: { title: string; p1: string }
  s6: { title: string; p1: string }
  s7: { title: string; p1: string }
  s8: { title: string; p1: string }
  s9: { title: string; p1: string }
}

export type LegalContent = {
  privacy: PrivacyLegal
  terms: TermsLegal
  refund: RefundLegal
}
