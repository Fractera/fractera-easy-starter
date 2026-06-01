import type { SiteContent } from '../../types'

type LoopShowcasePart = Pick<SiteContent, 'loopShowcase'>

export const loopShowcase: LoopShowcasePart = {
  loopShowcase: {
    label: 'Step by step, how it works',
    h2: 'Full Stack Ownership: Your Server, Your Domain, Your Product',
    description:
      'Modern AI coding is easy — the hard part is owning the infrastructure. Fractera makes ownership effortless: a dedicated Ubuntu VPS, an automatic custom domain with SSL, and a production-ready product stack — all yours, forever.',
    // Slide images live in /public/section-step-by-step-images/<file>.png
    slides: [
      // ── Block 1: stack ownership (1–3) ────────────────────────────────────
      {
        imageSrc: '/section-step-by-step-images/Step1.png',
        label: 'Your Own Server',
        sublabel: 'Credentials in, server out',
        title: 'Private AI infrastructure on your VPS',
        description:
          'Buy once, and minutes later your own web infrastructure is live. You only add your VPS credentials a single time. The site, the admin panel, AI agents, memory, database, and storage all deploy and sync automatically. Everything belongs to you alone — not a single byte in someone else’s cloud.',
      },
      {
        imageSrc: '/section-step-by-step-images/step2-optional.png',
        label: 'Your Own Domain',
        sublabel: 'Optional, attaches in a minute',
        title: 'Custom domain and SSL in a minute',
        description:
          'The moment it deploys, your project is reachable and ready — over plain HTTP, which is plenty for early experiments. For everything else, connect your own domain: buy it from any registrar and attach it in under a minute. SSL certificate, DNS, and Nginx routing configure themselves.',
      },
      {
        imageSrc: '/section-step-by-step-images/step3-required.png',
        label: 'Secure Mode',
        sublabel: 'You are the sole admin',
        title: 'Your domain triggers secure mode',
        description:
          'Activating your own domain flips the server into secure HTTPS mode automatically. You sign in as administrator inside your own authentication platform. Later you can add more admins — but by default you’re the only one with access to the AI agents. No shared SSO, no third-party access console.',
      },

      // ── Block 2: server map, panel, orchestrator (4–6) ────────────────────
      {
        imageSrc: '/section-step-by-step-images/step4-info.png',
        label: 'Server Map',
        sublabel: 'Every address, emailed to you',
        title: 'A full map of your server',
        description:
          'Every important server event is mirrored to your email. So domain activation hands you a full map of what was built for you: the admin panel with agents, your public site, your Hermes orchestrator agent, a LightRAG knowledge base, your own auth platform governing every service, plus a database server and object storage.',
      },
      {
        imageSrc: '/section-step-by-step-images/step5-info.png',
        label: 'Admin Panel',
        sublabel: 'Five orchestration tools',
        title: 'Admin panel: five core tools',
        description:
          'After signing in you land straight in the admin panel — mission control for your agents and web space. Five tools: a live preview of your main app; an agent selector carousel (Grok Builder lands soon); project settings; GitHub integration for local IDE work; and the Fractera skills marketplace.',
      },
      {
        imageSrc: '/section-step-by-step-images/step7-required.png',
        label: 'Hermes Agent',
        sublabel: 'Orchestrator of all agents',
        title: 'Hermes orchestrator — your project core',
        description:
          'Activate Hermes — the orchestrator agent you actually talk to. It routes tasks across AI agents, developers, and the memory agent. It can run on the OpenAI key you added earlier, but a Codex subscription is far more efficient: authorize in the browser and slash token spend on a powerful model. On a truly beefy server or home machine (AI company brain mode) you can skip subscriptions and use your own compute.',
      },

      // ── Block 3: memory + Claude + Codex (7–9) ────────────────────────────
      {
        imageSrc: '/section-step-by-step-images/step6-required.png',
        label: 'Project Memory',
        sublabel: 'LightRAG vector memory',
        title: 'LightRAG — your project’s memory',
        description:
          'Switch on your project’s global memory — it stores everything happening across your work and business. All it needs is an OpenAI key: the service is extremely frugal with tokens, just keep the balance positive. This vector memory is a future-defining edge: the more it knows, the fewer tokens your main AI agents burn.',
      },
      {
        imageSrc: '/section-step-by-step-images/step8-required.png',
        label: 'Claude Code',
        sublabel: 'Subscription via /login',
        title: 'Claude Code on your own server',
        description:
          'Want to code with the Anthropic agent? Run /login and activate your subscription by following the prompts. From there you can write code right inside this terminal. But the priority, recommended path is working through the Hermes agent from Telegram — one entry point to every platform.',
      },
      {
        imageSrc: '/section-step-by-step-images/step9-required.png',
        label: 'Codex',
        sublabel: 'Your key or subscription',
        title: 'Codex: your key or subscription',
        description:
          'Codex is available automatically the moment you activate your key in the previous step. To switch to a subscription, first leave registration mode with /logout, close the tab, and reopen it. Then repeat authorization, choose the subscription, and finish signing in by following the prompts.',
      },

      // ── Block 4: Gemini + Qwen + Kimi (10–12) ─────────────────────────────
      {
        imageSrc: '/section-step-by-step-images/step10.png',
        label: 'Gemini CLI',
        sublabel: 'Free start, every day',
        title: 'Gemini — free production coding',
        description:
          'No AI keys yet? Start with Gemini — it hands you a free trial and refreshes session limits every single day. The simplest way into production coding at zero cost. No command needed: just follow the authorization steps in order.',
      },
      {
        imageSrc: '/section-step-by-step-images/step11.png',
        label: 'Qwen Code',
        sublabel: 'Subscription, bolder UI',
        title: 'Qwen Code — an alternative engine',
        description:
          'Qwen Code also runs on a subscription right in the terminal and is driven through Hermes. Every platform tackles broadly similar tasks, but each styles app interfaces differently by default. The design Qwen generates often comes out noticeably bolder.',
      },
      {
        imageSrc: '/section-step-by-step-images/step12.png',
        label: 'Kimi Code',
        sublabel: 'Generous subscription credits',
        title: 'Kimi Code — generous credits',
        description:
          'Kimi Code runs on a subscription and serves as an alternative to the standard models. In certain scenarios it grants more generous credits for the same spend — a handy backup engine when you need more volume at the same price.',
      },

      // ── Block 5: data, storage, starter (13–15) ───────────────────────────
      {
        imageSrc: '/section-step-by-step-images/step13-info.png',
        label: 'Your Database',
        sublabel: 'Lightweight Postgres, web UI',
        title: 'Your own database, zero cloud',
        description:
          'The database is already installed on your server and wired into the project. For convenience the admin panel gives it a dedicated tab — a clear web UI to watch database health and make changes when needed. Under the hood it’s lightweight Postgres, and your AI agent already knows how to create and update data models with zero dependency on someone else’s paid cloud.',
      },
      {
        imageSrc: '/section-step-by-step-images/step14-info.png',
        label: 'Object Storage',
        sublabel: 'Images, out of the box',
        title: 'Your object storage, out of the box',
        description:
          'The image processing and storage service is part of your server too, deployed automatically. Nothing to configure: start adding images to your project right away. Files live on your own disk, not in someone else’s S3.',
      },
      {
        imageSrc: '/section-step-by-step-images/step15-info.png',
        label: 'Built-in Starter',
        sublabel: 'Public/private routing inside',
        title: 'A production starter from minute one',
        description:
          'Your server ships with an app already built in: public and private routing, a clean structure built to grow, modern patterns, and solid scaling. Best of all, the starter saves you tokens and time — almost everything you’d normally build and integrate before the real work is already done. A preview is always in your admin panel, and the same version lives at your main address.',
      },
    ],
  },
}
