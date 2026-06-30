# App-Shell Authorization — the public login switch (raw standard)

This is the full document an AI agent reads to add or remove the **public login** of an app
shell correctly. It is English-only by design (raw over-docs ship in one language) and grows
with the platform. Companion skill: `manage-app-shell-auth`.

## What it is

Every workspace already contains an authorization **layer** (the auth service, sessions, roles,
guest promotion) and an always-present **admin login** you use to manage the app. This switch
does **not** build a login — it decides whether the **public, visitor-facing** login renders in
the app shell, and which side its account drawer opens from. Enabling it *connects* the existing
layer; it is never "developing auth from scratch".

## The states — one build-time key

`NEXT_PUBLIC_APP_SHELL_AUTH`:

| Value | Meaning |
|---|---|
| absent / empty | **OFF (default)** — no public login control ships; smaller bundle, faster deploy |
| `left` | ON — account drawer slides in from the left |
| `right` | ON — account drawer slides in from the right |

It is **build-time**: a change applies after a rebuild (a few minutes), exactly like the
language set.

## When to enable

- **Leave OFF** for a landing page, a company page, a portfolio — anything without accounts.
  A login you never use only adds weight to the page and time to each deploy.
- **Turn ON** for a store, a subscription service, a delivery app, a SaaS dashboard — anything
  where people sign in to track orders, keep a cart, manage a subscription.

**Auto-rule:** when asked to build an app that inherently needs accounts, enabling app-shell
auth is part of that job — do it without making the owner ask separately; the only thing to ask
is the drawer side (left or right).

## What the visitor sees when ON

The header is force-rendered (even with no menu groups) and gains an account control:

- a **guest** sees **Sign in** → the existing login flow;
- a **signed-in** visitor sees their **account** button → a full-height account drawer with
  sign out, their email, and their roles.

The three labels (sign in / account / sign out) ship translated into **82 languages**, chosen
idiomatically per language (e.g. "My account" / "Личный кабинет" / "Mein Konto"), with an
English fallback. No per-language authoring is required.

## Role-based access

When the login is on, access is role-based out of the box. Every registered visitor starts as
`user`. Roles (`ALL_ROLES`): access tiers `guest`/`user`/`architect`; customer-facing `buyer`,
`vip_user`, `subscriber_lite`/`standard`/`max`; staff `manager`, `senior_manager`,
`support_manager`, `delivery_manager`, `finance`, `content_editor`; `admin`. A role is granted
automatically by app settings (a paid subscription, a completed purchase) or by hand in the
admin panel by a manager or the architect.

## How to set it (never hand-edit the env if a setter exists)

1. **Skill** `manage-app-shell-auth` → **MCP** `owner_app_settings_set_app_shell_auth`
   `{ value: "left" | "right" | "off" }` (on the app-settings bridge, owner tier). Confirm with
   the owner first, then it writes the key and triggers the rebuild.
2. **Validated route** `POST /api/config/auth-shell` `{ value }` (when the bridge is
   unreachable but the panel is up).
3. **Panel** Admin → App Settings → App Authorization → off / left / right → Save.

## Where it lives (slot, co-located)

- Reader: `components/menu/account/account-config.ts` (`appShellAuthSide()` / `isAuthRequired()`).
- The control + its 82-language strings: `components/menu/account/` (button, drawer, i18n) —
  delete the folder and it all goes with it.
- The header reads the key to force-render and to place the account button
  (`components/menu/top/top-menu.server.tsx`).

The admin login that manages the app is a separate, always-present layer — this switch never
touches it.
