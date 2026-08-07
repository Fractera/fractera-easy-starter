'use client'

// Shared deploy options for the partner surfaces (partner page mirror + embed
// widget), bringing them to parity with the live landing install form
// (components/install-form.tsx): the password-change security acknowledgment
// (step 78) — Fractera never stores the SSH password; the user must confirm
// they will change it after deploy.
//
// Step 500: the component-selection half (standard vs custom build) is gone.
// The catalog is empty — every deploy installs the same set — so there was
// nothing left to offer, and the switch would have shown two empty groups.
//
// These two partner surfaces use a self-contained bilingual `getTexts(lang)`
// pattern (they render on the partner mirror page /partner/<lang>/<slug> / inside
// an iframe, outside the main i18n context), so this component carries its own EN+RU copy
// (rule 4а — EN+RU coverage).

import { Checkbox } from '@/components/ui/checkbox'

type Lang = 'en' | 'ru'

function getTexts(lang: Lang) {
  const isRu = lang === 'ru'
  return {
    securityNote: isRu
      ? 'Fractera подключается по SSH один раз и не хранит ваш пароль. После развёртывания смените пароль сервера — это ваша ответственность.'
      : 'Fractera connects over SSH once and never stores your password. After deployment, change the server password — it is your responsibility.',
    passwordAck: isRu
      ? 'Я понимаю, что должен сменить пароль сервера после развёртывания.'
      : 'I understand I should change my server password after deployment.',
  }
}

export function PartnerDeployOptions({
  lang,
  passwordAck,
  setPasswordAck,
  disabled,
}: {
  lang: Lang
  passwordAck: boolean
  setPasswordAck: (v: boolean) => void
  disabled?: boolean
}) {
  const t = getTexts(lang)

  return (
    <div className="flex flex-col gap-3">
      {/* Password-change security acknowledgment (step 78) — gates the deploy button */}
      <div className="flex flex-col gap-3 bg-white/[0.04] border border-white/20 rounded-xl p-4">
        <p className="text-xs text-white/60 leading-relaxed">{t.securityNote}</p>
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <Checkbox
            checked={passwordAck}
            disabled={disabled}
            onCheckedChange={v => setPasswordAck(!!v)}
            className="mt-0.5"
          />
          <span className="text-sm text-white leading-snug">{t.passwordAck}</span>
        </label>
      </div>
    </div>
  )
}
