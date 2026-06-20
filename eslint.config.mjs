import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Regression guard for the content-i18n architecture (see
// /code/CONTENT-I18N-ARCHITECTURE-STANDARD.md). User-facing strings must live in
// the i18n shell (lib/i18n/locales/<lang>) or be chosen by a data-driven
// discriminator field — never by a hardcoded `lang === 'ru'` / `=== 'en'`
// ternary in the render layer. Documentation alone does not hold this line as the
// page count and contributor count (incl. AI agents) grows, so it is enforced.
const NO_LANG_HARDCODE = {
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector:
          "BinaryExpression[operator=/^[!=]==?$/] > Literal[value='ru']",
        message:
          "Hardcoded language comparison (=== 'ru'). Move user-facing strings into the i18n shell (lib/i18n/locales/<lang>) or use a data-driven discriminator. See /code/CONTENT-I18N-ARCHITECTURE-STANDARD.md.",
      },
      {
        selector:
          "BinaryExpression[operator=/^[!=]==?$/] > Literal[value='en']",
        message:
          "Hardcoded language comparison (=== 'en'). Move user-facing strings into the i18n shell (lib/i18n/locales/<lang>) or use a data-driven discriminator. See /code/CONTENT-I18N-ARCHITECTURE-STANDARD.md.",
      },
    ],
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Enforce the no-language-hardcode rule across the UI render layer.
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    ...NO_LANG_HARDCODE,
  },
  // Backlog allowlist — the partner-cabinet / embed functional area still carries
  // the legacy `isRu = lang === 'ru'` UI pattern and the `langParam === 'ru'`
  // lang-normalization that narrows to its `'en' | 'ru'` props. It is a separate,
  // large i18n-audit task (see next-step.md). The rule stays OFF here until that
  // task lands; this list SHRINKS as each file is migrated, never grows.
  // NOTE: globs are anchored with `**/` — a literal `app/[lang]/...` path would be
  // mis-parsed because `[lang]` is a glob character class, not a literal segment.
  {
    files: [
      "**/partner-page-flow.tsx",
      "**/partner-cabinet-view.tsx",
      "**/partner-deploy-options.tsx",
      "**/company-brain-inquiry-drawer.tsx",
      "**/partner-registration-drawer.tsx",
      "**/partner-page-footer.tsx",
      "**/domain-dns-block.tsx",
      "**/embed-flow.tsx",
      "**/embed/page.tsx",
      "**/sponsors/page.tsx",
      "**/partners/page.tsx",
      "**/partners/*/page.tsx",
    ],
    rules: { "no-restricted-syntax": "off" },
  },
]);

export default eslintConfig;
