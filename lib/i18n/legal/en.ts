import type { LegalContent } from './types'

export const en: LegalContent = {
  privacy: {
    title: 'Privacy Policy',
    s1: {
      title: '1. Introduction',
      p1: 'Fractera, Inc. ("we", "our", or "us"), a Delaware corporation, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this policy carefully.',
    },
    s2: {
      title: '2. Information We Collect',
      intro: 'We collect the following categories of personal information:',
      items: [
        'Account data: email address, name, and authentication credentials when you create an account.',
        'Payment data: billing details processed by Stripe or other payment providers. We do not store full card numbers.',
        'Usage data: log data, IP address, device type, browser, pages visited, and feature usage.',
        'Server data: IP address and credentials of servers you provision through our platform (stored encrypted).',
        'Communications: messages you send to our support team.',
      ],
    },
    s3: {
      title: '3. How We Use Your Information',
      intro: 'We use the information we collect to:',
      items: [
        'Provide, operate, and improve our services.',
        'Process payments and manage subscriptions.',
        'Send transactional emails (account creation, billing receipts, password reset).',
        'Respond to support requests.',
        'Detect and prevent fraud or security incidents.',
        'Comply with legal obligations.',
      ],
      note: 'We do not sell your personal data to third parties.',
    },
    s4: {
      title: '4. Data Storage and Security',
      p1: 'Your account and subscription data is stored on servers located in the European Union (Neon managed PostgreSQL, EU region). We implement industry-standard technical and organizational measures including encryption at rest and in transit, access controls, and regular security reviews. Despite these measures, no system is completely secure.',
    },
    s5: {
      title: '5. Data Sharing and Third-Party Services',
      intro: 'We share your information only with the following categories of service providers:',
      items: [
        'Stripe — payment processing.',
        'Resend — transactional email delivery.',
        'Upstash — session caching (Redis).',
      ],
      note: 'We may also disclose your information if required by law, court order, or to protect the rights and safety of Fractera, Inc. or others.',
    },
    s6: {
      title: '6. EU / EEA Residents — GDPR Rights',
      intro: 'If you are located in the European Union or European Economic Area, the General Data Protection Regulation (GDPR) grants you the following rights:',
      items: [
        'Access: request a copy of the personal data we hold about you.',
        'Rectification: request correction of inaccurate data.',
        'Erasure: request deletion of your data ("right to be forgotten").',
        'Portability: receive your data in a machine-readable format.',
        'Object / Restrict: object to or restrict certain processing.',
      ],
      p2: 'Our legal basis for processing is performance of a contract (subscription services) and legitimate interests (security, fraud prevention). To exercise your rights, contact us by email. We will respond within 30 days.',
    },
    s7: {
      title: '7. California Residents — CCPA Rights',
      intro: 'If you are a California resident, the California Consumer Privacy Act (CCPA) grants you the following rights:',
      items: [
        'Know: request disclosure of what personal information we collect, use, disclose, and sell.',
        'Delete: request deletion of personal information we have collected from you.',
        'Opt-Out of Sale: we do not sell personal information. No opt-out is necessary.',
        'Non-Discrimination: we will not discriminate against you for exercising your CCPA rights.',
      ],
      p2: 'To submit a CCPA request, contact us by email or by mail at the address below. We will verify your identity before processing your request.',
    },
    s8: {
      title: '8. Data Retention',
      p1: 'We retain your personal data for as long as your account is active and for a reasonable period thereafter to comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your account and associated data at any time.',
    },
    s9: {
      title: '9. Cookies',
      p1: 'We use cookies and similar tracking technologies. Please see our Cookie Policy for details.',
    },
    s10: {
      title: '10. Changes to This Policy',
      p1: 'We may update this Privacy Policy from time to time. We will notify you of material changes by email or by posting a notice on our platform. Continued use of the service after changes constitutes acceptance of the updated policy.',
    },
    s11: {
      title: '11. Contact',
    },
  },

  terms: {
    title: 'Terms of Service',
    s1: {
      title: '1. Acceptance of Terms',
      p1: 'By accessing or using Fractera, you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree to these Terms, please do not use our services. These Terms constitute a binding legal agreement between you and Fractera, Inc.',
    },
    s2: {
      title: '2. About Fractera, Inc.',
      p1: 'Fractera, Inc. is a corporation incorporated under the laws of the State of Delaware, United States. We provide a platform for deploying and managing AI coding environments on your own server infrastructure.',
    },
    s3: {
      title: '3. Description of Service',
      p1: 'Fractera, Inc. provides a platform for deploying and managing AI coding environments on your own server infrastructure. We facilitate subdomain registration and server setup, but you retain full ownership and control of your server. We are not responsible for the content, security, or uptime of servers you provision.',
    },
    s4: {
      title: '4. Account Responsibilities',
      p1: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.',
    },
    s5: {
      title: '5. Subscriptions and Payments',
      p1: 'Some features of Fractera require a paid subscription. By subscribing, you agree to pay the fees set out at the time of purchase. Subscriptions are billed in advance on a monthly or annual basis. Most payments are processed by Stripe; alternative local payment providers may be used depending on your country of residence and will be displayed at checkout.',
      p2: 'Cancellations and refunds are governed by our Refund Policy, which includes country-specific rights (EU 14-day withdrawal, Brazil 7-day regret, UK cancellation rights, and Australian consumer guarantees).',
    },
    s6: {
      title: '6. Acceptable Use',
      intro: 'You agree not to use Fractera to:',
      items: [
        'Violate any applicable local, state, national, or international laws or regulations.',
        'Infringe intellectual property rights of Fractera, Inc. or third parties.',
        'Transmit harmful, unlawful, defamatory, or fraudulent content.',
        'Interfere with the proper functioning of our services or servers.',
        'Attempt to gain unauthorized access to our systems or other users\' accounts.',
      ],
    },
    s7: {
      title: '7. Intellectual Property',
      p1: 'The Fractera platform, including its software, design, trademarks, and content, is owned by Fractera, Inc. and protected by intellectual property laws. Your subscription grants you a limited, non-exclusive, non-transferable license to use the platform for your internal business purposes.',
    },
    s8: {
      title: '8. Limitation of Liability',
      p1: 'To the maximum extent permitted by applicable law, Fractera, Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service, including but not limited to loss of data, revenue, or service interruptions. Our total liability to you for any claim arising from these Terms shall not exceed the amount you paid us in the 12 months preceding the claim.',
    },
    s9: {
      title: '9. Disclaimer of Warranties',
      p1: 'The service is provided "as is" and "as available" without warranties of any kind, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.',
    },
    s10: {
      title: '10. Termination',
      p1: 'We reserve the right to terminate or suspend your account at any time for material violations of these Terms, with or without notice. You may terminate your account at any time by contacting us. Upon termination, your right to use the service ceases immediately.',
    },
    s11: {
      title: '11. Governing Law and Dispute Resolution',
      p1: 'These Terms are governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law principles.',
      p2: 'Any dispute arising from these Terms shall first be subject to good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to binding arbitration in Delaware under the rules of the American Arbitration Association (AAA), conducted in English.',
      p3: 'EU / EEA residents: Nothing in this clause limits your rights under mandatory consumer protection laws of your country of residence, including your right to bring a claim before your local courts or consumer authority.',
    },
    s12: {
      title: '12. Changes to Terms',
      p1: 'We reserve the right to modify these Terms at any time. We will notify you of material changes by email at least 14 days in advance. Continued use of the service after changes take effect constitutes acceptance of the revised Terms.',
    },
    s13: {
      title: '13. Contact',
    },
  },

  refund: {
    title: 'Refund Policy',
    s1: {
      title: '1. Overview',
      p1: 'Fractera offers subscription-based access to our AI infrastructure platform. This Refund Policy explains your rights regarding cancellations and refunds, including additional rights that may apply depending on your country of residence.',
    },
    s2: {
      title: '2. Subscription Cancellation',
      intro: 'You may cancel your subscription at any time from your account dashboard or by contacting us. Upon cancellation:',
      items: [
        'Your subscription remains active until the end of the current billing period.',
        'You will not be charged for subsequent billing cycles.',
        'Access to paid features ends when the billing period expires.',
        'Your server and data are not automatically deleted — you remain in control.',
      ],
    },
    s3: {
      title: '3. General Refund Policy',
      p1: 'Subscription fees are generally non-refundable for the current billing period once the service has been activated. We do not issue partial refunds for unused time within an active billing cycle.',
      intro: 'Exceptions may be granted at our sole discretion in cases of:',
      items: [
        'Documented technical failure on our side that prevented service access for more than 72 hours.',
        'Duplicate charges caused by a billing error.',
        'Fraudulent charges — contact us and your payment provider immediately.',
      ],
      p2: 'To request a refund under an exception, email us within 14 days of the charge with your account email and a description of the issue.',
    },
    s4: {
      title: '4. EU / EEA Residents — Right of Withdrawal',
      p1: 'If you are located in the European Union or European Economic Area, you have the right to withdraw from your subscription within 14 days of purchase without giving any reason (cooling-off period under EU Directive 2011/83/EU).',
      p2: 'Important: If you explicitly request that the service begins immediately upon purchase (e.g., your server is provisioned and you access the platform before the 14 days elapse), you acknowledge that you lose your right of withdrawal once the service has been fully performed, or you accept partial loss of this right proportional to services already delivered.',
      p3: 'To exercise your right of withdrawal, contact us with the subject line "Right of Withdrawal" before the 14-day period expires. Refunds will be issued within 14 days of receiving your withdrawal notice.',
    },
    s5: {
      title: '5. UK Residents',
      p1: 'Under the Consumer Rights Act 2015 and Consumer Contracts Regulations 2013, UK residents have a 14-day cancellation right for digital services purchased online, subject to the same conditions regarding early commencement of service described above.',
    },
    s6: {
      title: '6. Brazil Residents',
      p1: 'Under the Brazilian Consumer Protection Code (Código de Defesa do Consumidor, Art. 49), consumers who purchase online have a 7-day right of regret (direito de arrependimento) from the date of purchase or receipt of service. You are entitled to a full refund if you exercise this right within the 7-day period.',
    },
    s7: {
      title: '7. Australia Residents',
      p1: 'Under the Australian Consumer Law (ACL), you may be entitled to a refund if the service has a major failure, is not fit for purpose, or does not match our description. These consumer guarantees cannot be excluded by this policy.',
    },
    s8: {
      title: '8. Payment Processors',
      p1: 'Most payments are processed by Stripe. Depending on your country of residence, payments may be processed by an alternative local payment provider. The applicable provider will be displayed at checkout. Refund processing times depend on your payment provider and may take 5–10 business days to appear on your statement.',
    },
    s9: {
      title: '9. Contact',
      p1: 'For refund requests or questions about this policy, contact us by email. We aim to respond within 2 business days.',
    },
  },
}
