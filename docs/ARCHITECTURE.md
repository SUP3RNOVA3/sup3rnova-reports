# Reporting architecture draft

## Product model

One reusable reporting application serves many campaign reports. Each report is selected by a stable slug and configured by data, theme, modules, visibility, and methodology.

```text
Report shell
  Campaign configuration
  Overview modules
  Content library
  Creator profiles
  Benchmark methodology
  Review workspace
```

Initial route: `reports.sup3rnova.com/Hottest_Brunch/`

Recommended canonical slug after the prototype: `hottest-brunch`. The requested underscore route can remain as an alias so existing links do not break.

## Proposed Supabase Lab tables

No tables are applied during the UX/UI phase.

- `report_projects`: report identity, slug, client, brand, campaign dates, visibility, theme
- `report_sources`: scraper/provider configuration and last successful sync
- `report_creators`: platform identity, handle, profile image, follower count, profile metadata
- `report_content`: normalized post/story/reel/TikTok record and moderation status
- `report_content_assets`: ordered carousel/video/image assets and archive locations
- `report_metric_snapshots`: time-series public metrics per content item
- `report_creator_snapshots`: time-series creator/follower metrics
- `report_reviews`: decision, tags, notes, reviewer, timestamps, audit trail
- `report_benchmarks`: versioned assumptions by platform, format, market, and tier
- `report_emv_models`: versioned formulas and currency configuration

## Moderation statuses

- `pending`
- `relevant`
- `maybe`
- `discarded`

Discarding should be reversible. Client-facing totals include only `relevant` by default, with an explicit option to include `maybe`.

## Metric rules

- Followers are snapshots, not timeless creator properties.
- Public engagement: likes + comments + shares + saves when a provider exposes them.
- Video engagement rate: public engagements divided by views when views exist.
- Audience engagement rate: public engagements divided by follower snapshot.
- Stories without public engagement metrics remain coverage items, not zero-engagement items.
- Missing metrics stay `null`; they must not be converted to zero.

## EMV methodology

EMV must be a transparent, versioned estimate rather than a black-box total. Proposed model:

```text
Estimated EMV = qualified impressions / 1,000 x benchmark CPM x format multiplier
```

The UI exposes assumptions, source, effective date, market, format, and multiplier. The mock benchmark values in the prototype are presentation placeholders only and must be replaced with approved commercial assumptions before client delivery.
