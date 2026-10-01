# SUP3RNOVA Reports

Reusable client-reporting shell for `reports.sup3rnova.com`.

## Current report

- Report: The Hottest Brunch x Absolut Tabasco
- Route target: `/Hottest_Brunch/`
- Data mode: live Supabase Lab dataset with mock benchmark assumptions
- Working modules: overview, live creator deck, content library, creator profiles, benchmark assumptions, and protected review queue
- Creator deck pairs each live profile snapshot with its approved image and video content
- Review decisions are persisted to Supabase through the protected admin API

## Run locally

```bash
npm install
npm start
```

Open `http://127.0.0.1:3000/Hottest_Brunch/`. Live data and media require the production environment variables.

## Production

- Public report: `https://reports.sup3rnova.com/Hottest_Brunch/`
- Admin review: `https://reports.sup3rnova.com/Hottest_Brunch/admin/`
- Admin protection: Cloudflare Access, restricted to `jual@sup3rnova.com`
- Coolify application UUID: `q95fxb54zv0zj7vi53523ozh`
- GitHub: `SUP3RNOVA3/sup3rnova-reports`
- Supabase migration: `supabase/migrations/001_reporting_core.sql`
- Media: private R2 bucket `sup3rnova-reports`, proxied by the application
- Health check: `https://reports.sup3rnova.com/healthz`

Production route shape:

```text
reports.sup3rnova.com/
  Hottest_Brunch/
  <future-report>/
```

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the proposed information architecture and data model.

## FEMBi YTD 2026

Public client report: `/FEMBi/YTD-2026/`. Approved snapshot report, not live ad-platform access. HeroUI branding uses client-supplied FEMBi logo and SUP3RNOVA wordmark. Only a fixed asset manifest is stored in this repository; client report data and bundled assets are kept in the existing private R2 bucket and streamed through an allowlisted route. No listing or arbitrary object access. HTML is no-cache; hashed JS/CSS immutable; noindex/nofollow on all report responses. Existing Hottest Brunch routes and moderation policies are unchanged.
