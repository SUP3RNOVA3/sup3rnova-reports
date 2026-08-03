# SUP3RNOVA Reports

Reusable client-reporting shell for `reports.sup3rnova.com`.

## Current prototype

- Report: The Hottest Brunch x Absolut Tabasco
- Route target: `/Hottest_Brunch/`
- Data mode: fixture/mock data only
- Working modules: overview, content library, creator profiles, benchmark assumptions, and review queue
- Review decisions persist in browser `localStorage` for prototype testing

## Run locally

```bash
cd projects/sup3rnova-reports
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/Hottest_Brunch/`.

## Production gates

The prototype intentionally does not modify DNS, deploy production infrastructure, or create Supabase Lab tables. Those actions begin after UX/UI approval.

Planned production shape:

```text
reports.sup3rnova.com/
  Hottest_Brunch/
  <future-report>/
```

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the proposed information architecture and data model.
