# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current landing page with a two-section layout: Hero + CTA button that opens claude.ai in a new tab, followed by a shadcn Carousel showing 3 steps with placeholder screenshots.

**Architecture:** Single `app/page.tsx` (server component) + one new client component `components/steps-carousel.tsx`. shadcn/ui Carousel component handles the carousel. No state, no API calls, no interactivity beyond the carousel swipe and the external link button.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS 4, shadcn/ui (Carousel, Card).

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `app/page.tsx` | Modify | Hero section + CTA button + import StepsCarousel |
| `components/steps-carousel.tsx` | Create | shadcn Carousel with 3 steps, placeholder images |
| `components/ui/carousel.tsx` | Create (shadcn) | shadcn Carousel primitive |
| `components/ui/card.tsx` | Create (shadcn) | shadcn Card primitive used inside carousel |

---

## Task 1: Install shadcn/ui and add Carousel + Card components

**Files:**
- Create: `components/ui/carousel.tsx` (via shadcn CLI)
- Create: `components/ui/card.tsx` (via shadcn CLI)

- [ ] **Step 1: Initialize shadcn/ui**

```bash
cd /Users/romanbolshiyanov/Documents/Code/Fractera/fractera-easy-starter
pnpm dlx shadcn@latest init -d
```

When prompted:
- Style: **Default**
- Base color: **Zinc**
- CSS variables: **Yes**

This creates `components/ui/` directory and updates `tailwind.config` and `globals.css`.

- [ ] **Step 2: Add Carousel component**

```bash
pnpm dlx shadcn@latest add carousel
```

Expected: creates `components/ui/carousel.tsx`.

- [ ] **Step 3: Add Card component**

```bash
pnpm dlx shadcn@latest add card
```

Expected: creates `components/ui/card.tsx`.

- [ ] **Step 4: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/ app/globals.css tailwind.config.* components.json
git commit -m "feat: add shadcn/ui with Carousel and Card components"
```

---

## Task 2: Create StepsCarousel component

**Files:**
- Create: `components/steps-carousel.tsx`

- [ ] **Step 1: Create the component**

Create `components/steps-carousel.tsx`:

```tsx
'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'

const STEPS = [
  {
    number: 1,
    title: 'Open claude.ai Settings',
    description: 'Go to Settings → Integrations → Add custom connector',
    image: '/screenshots/step-1.png',
    placeholder: 'Screenshot: claude.ai Settings → Integrations',
  },
  {
    number: 2,
    title: 'Paste the MCP URL',
    description: 'Name it "Fractera" and paste: https://fractera.ai/api/mcp',
    image: '/screenshots/step-2.png',
    placeholder: 'Screenshot: Add connector dialog with URL field',
  },
  {
    number: 3,
    title: 'Type "install fractera"',
    description: 'Start a new chat and Claude will guide you through the whole process',
    image: '/screenshots/step-3.png',
    placeholder: 'Screenshot: Claude chat with install fractera message',
  },
]

export function StepsCarousel() {
  return (
    <div className="w-full">
      <Carousel
        opts={{ align: 'start', loop: false }}
        className="w-full"
      >
        <CarouselContent>
          {STEPS.map((step) => (
            <CarouselItem key={step.number} className="md:basis-1/2 lg:basis-1/3">
              <Card className="bg-white/5 border-white/10 h-full">
                <CardContent className="p-0 flex flex-col h-full">
                  {/* Placeholder image area */}
                  <div className="aspect-video bg-white/5 rounded-t-xl flex items-center justify-center border-b border-white/10">
                    <p className="text-xs text-gray-600 text-center px-4">{step.placeholder}</p>
                  </div>
                  {/* Text */}
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {step.number}
                      </span>
                      <h3 className="font-semibold text-white text-sm">{step.title}</h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="border-white/20 text-white hover:bg-white/10 hover:text-white -left-4" />
        <CarouselNext className="border-white/20 text-white hover:bg-white/10 hover:text-white -right-4" />
      </Carousel>
    </div>
  )
}
```

- [ ] **Step 2: Create screenshots directory with .gitkeep**

```bash
mkdir -p /Users/romanbolshiyanov/Documents/Code/Fractera/fractera-easy-starter/public/screenshots
touch /Users/romanbolshiyanov/Documents/Code/Fractera/fractera-easy-starter/public/screenshots/.gitkeep
```

- [ ] **Step 3: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/steps-carousel.tsx public/screenshots/.gitkeep
git commit -m "feat: StepsCarousel component with 3 placeholder steps"
```

---

## Task 3: Rewrite landing page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace page.tsx**

Replace entire `app/page.tsx` with:

```tsx
import { StepsCarousel } from '@/components/steps-carousel'

const MCP_URL = 'https://fractera.ai/api/mcp'
const CLAUDE_URL = 'https://claude.ai'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col gap-20">

        {/* Hero */}
        <section className="flex flex-col gap-8 items-start">
          <div className="flex flex-col gap-4">
            <h1 className="text-6xl font-bold tracking-tight">
              Fractera
            </h1>
            <p className="text-2xl text-gray-400 max-w-xl">
              Your own AI workspace. On your own server. No coding required.
            </p>
          </div>

          {/* MCP URL */}
          <div className="flex flex-col gap-2 w-full max-w-xl">
            <p className="text-sm text-gray-500 uppercase tracking-widest">MCP Server URL</p>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
              <code className="text-sm text-green-400 flex-1 break-all select-all">{MCP_URL}</code>
            </div>
          </div>

          {/* CTA button */}
          <a
            href={CLAUDE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-black font-semibold px-8 py-4 rounded-xl text-base hover:bg-gray-100 transition-colors"
          >
            Open Claude
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 7h10v10"/><path d="M7 17 17 7"/>
            </svg>
          </a>
        </section>

        {/* Steps carousel */}
        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-gray-300">How to get started</h2>
          <StepsCarousel />
        </section>

        {/* Footer */}
        <p className="text-sm text-gray-700 text-center">
          Fractera is open source. fractera.ai handles subdomain registration only.
        </p>

      </div>
    </main>
  )
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Check in browser**

```bash
pnpm dev
```

Open http://localhost:3000 and verify:
- Black background, "Fractera" heading
- Green MCP URL visible and selectable
- White "Open Claude →" button opens claude.ai in new tab
- "How to get started" section with carousel showing 3 cards
- Carousel prev/next arrows work
- On mobile (resize window) cards stack to 1 per view

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: redesign landing — hero + MCP URL + carousel steps"
```

---

## Task 4: Push and verify on production

- [ ] **Step 1: Push to GitHub**

```bash
git push origin main
```

Vercel will deploy automatically in ~1 minute.

- [ ] **Step 2: Verify production**

```bash
curl -s -o /dev/null -w "%{http_code}" -L https://fractera.ai
```

Expected: `200`

- [ ] **Step 3: Open in browser**

Open https://fractera.ai and confirm the new landing page is live.

---

## Done checklist

- [ ] shadcn Carousel and Card components installed
- [ ] StepsCarousel shows 3 steps with placeholder image areas
- [ ] Hero shows MCP URL + "Open Claude" button
- [ ] Button opens claude.ai in new tab
- [ ] Page is live on fractera.ai
