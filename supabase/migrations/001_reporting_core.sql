begin;

create extension if not exists pgcrypto;

create table if not exists public.report_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  client_name text not null,
  brand_name text not null,
  campaign_start date,
  campaign_end date,
  timezone text not null default 'America/Puerto_Rico',
  currency text not null default 'USD',
  visibility text not null default 'draft' check (visibility in ('draft','published','archived')),
  theme jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.report_projects(id) on delete cascade,
  provider text not null,
  source_key text not null,
  configuration jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  last_status text,
  created_at timestamptz not null default now(),
  unique(project_id, provider, source_key)
);

create table if not exists public.report_creators (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.report_projects(id) on delete cascade,
  platform text not null,
  platform_user_id text,
  handle text not null,
  display_name text,
  biography text,
  category text,
  profile_image_url text,
  profile_storage_key text,
  is_verified boolean not null default false,
  is_private boolean not null default false,
  raw_profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, platform, handle)
);

create table if not exists public.report_creator_snapshots (
  id bigint generated always as identity primary key,
  creator_id uuid not null references public.report_creators(id) on delete cascade,
  captured_at timestamptz not null,
  follower_count bigint,
  following_count bigint,
  media_count bigint,
  unique(creator_id, captured_at)
);

create table if not exists public.report_content (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.report_projects(id) on delete cascade,
  creator_id uuid references public.report_creators(id) on delete set null,
  platform text not null,
  source_content_id text not null,
  source_type text not null,
  media_type integer,
  shortcode text,
  caption text,
  permalink text,
  published_at timestamptz,
  first_seen_at timestamptz not null,
  last_seen_at timestamptz not null,
  source_classification text,
  classification_reason text,
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, platform, source_content_id)
);

create table if not exists public.report_content_assets (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.report_content(id) on delete cascade,
  position integer not null default 1,
  asset_kind text not null check (asset_kind in ('image','video','thumbnail','unknown')),
  storage_bucket text,
  storage_key text,
  source_url text,
  bytes bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(content_id, position, asset_kind)
);

create table if not exists public.report_metric_snapshots (
  id bigint generated always as identity primary key,
  content_id uuid not null references public.report_content(id) on delete cascade,
  captured_at timestamptz not null,
  like_count bigint,
  comment_count bigint,
  share_count bigint,
  save_count bigint,
  view_count bigint,
  play_count bigint,
  unique(content_id, captured_at)
);

create table if not exists public.report_reviews (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null unique references public.report_content(id) on delete cascade,
  decision text not null default 'pending' check (decision in ('pending','relevant','maybe','discarded')),
  relevance_tags text[] not null default '{}',
  notes text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_benchmarks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.report_projects(id) on delete cascade,
  benchmark_key text not null,
  platform text not null,
  format text not null,
  market text not null default 'Puerto Rico',
  value numeric not null,
  unit text not null,
  multiplier numeric not null default 1,
  status text not null default 'draft' check (status in ('draft','approved','retired')),
  source_note text,
  effective_from date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, benchmark_key)
);

create table if not exists public.report_emv_models (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.report_projects(id) on delete cascade,
  version text not null,
  name text not null,
  formula text not null,
  assumptions jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','approved','retired')),
  effective_from date,
  created_at timestamptz not null default now(),
  unique(project_id, version)
);

create index if not exists report_content_project_published_idx on public.report_content(project_id, published_at desc);
create index if not exists report_content_creator_idx on public.report_content(creator_id);
create index if not exists report_metrics_content_captured_idx on public.report_metric_snapshots(content_id, captured_at desc);
create index if not exists report_reviews_decision_idx on public.report_reviews(decision);
create index if not exists report_creator_snapshots_latest_idx on public.report_creator_snapshots(creator_id, captured_at desc);

alter table public.report_projects enable row level security;
alter table public.report_sources enable row level security;
alter table public.report_creators enable row level security;
alter table public.report_creator_snapshots enable row level security;
alter table public.report_content enable row level security;
alter table public.report_content_assets enable row level security;
alter table public.report_metric_snapshots enable row level security;
alter table public.report_reviews enable row level security;
alter table public.report_benchmarks enable row level security;
alter table public.report_emv_models enable row level security;

revoke all on public.report_projects, public.report_sources, public.report_creators,
  public.report_creator_snapshots, public.report_content, public.report_content_assets,
  public.report_metric_snapshots, public.report_reviews, public.report_benchmarks,
  public.report_emv_models from anon, authenticated;

create or replace function public.get_report_payload(p_slug text, p_include_all boolean default false)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
with project as (
  select * from report_projects where slug = p_slug limit 1
),
latest_metrics as (
  select distinct on (m.content_id) m.*
  from report_metric_snapshots m
  join report_content c on c.id = m.content_id
  join project p on p.id = c.project_id
  order by m.content_id, m.captured_at desc
),
latest_creator as (
  select distinct on (s.creator_id) s.*
  from report_creator_snapshots s
  join report_creators cr on cr.id = s.creator_id
  join project p on p.id = cr.project_id
  order by s.creator_id, s.captured_at desc
),
content_set as (
  select c.*, coalesce(r.decision, 'pending') as decision,
    lm.like_count, lm.comment_count, lm.share_count, lm.save_count,
    coalesce(lm.view_count, lm.play_count) as views,
    a.storage_key as primary_asset_key, a.asset_kind as primary_asset_kind,
    cr.handle, cr.display_name, cr.profile_storage_key, lc.follower_count
  from report_content c
  join project p on p.id = c.project_id
  left join report_reviews r on r.content_id = c.id
  left join latest_metrics lm on lm.content_id = c.id
  left join report_creators cr on cr.id = c.creator_id
  left join latest_creator lc on lc.creator_id = cr.id
  left join lateral (
    select storage_key, asset_kind from report_content_assets ca
    where ca.content_id = c.id order by position asc limit 1
  ) a on true
  where p_include_all or coalesce(r.decision, 'pending') = 'relevant'
),
creator_stats as (
  select cr.id, cr.handle, cr.display_name, cr.biography, cr.category,
    cr.profile_storage_key, cr.is_verified, lc.follower_count,
    count(cs.id) filter (where cs.decision = 'relevant') as qualified_content,
    count(cs.id) as scraped_content,
    coalesce(sum(coalesce(cs.like_count,0) + coalesce(cs.comment_count,0)) filter (where cs.decision = 'relevant'),0) as engagements,
    count(cs.id) filter (where cs.decision = 'relevant' and (cs.like_count is not null or cs.comment_count is not null)) as measured_content,
    coalesce(sum(cs.views) filter (where cs.decision = 'relevant'),0) as views
  from report_creators cr
  join project p on p.id = cr.project_id
  left join latest_creator lc on lc.creator_id = cr.id
  left join content_set cs on cs.creator_id = cr.id
  group by cr.id, lc.follower_count
),
decision_counts as (
  select coalesce(r.decision,'pending') decision, count(*) total
  from report_content c join project p on p.id=c.project_id
  left join report_reviews r on r.content_id=c.id group by 1
),
type_counts as (
  select c.source_type, count(*) total from report_content c
  join project p on p.id=c.project_id group by c.source_type
),
summary as (
  select jsonb_build_object(
    'totalScraped', (select count(*) from report_content c join project p on p.id=c.project_id),
    'qualified', coalesce((select total from decision_counts where decision='relevant'),0),
    'pending', coalesce((select total from decision_counts where decision='pending'),0),
    'maybe', coalesce((select total from decision_counts where decision='maybe'),0),
    'discarded', coalesce((select total from decision_counts where decision='discarded'),0),
    'creatorCount', (select count(*) from report_creators cr join project p on p.id=cr.project_id),
    'potentialAudience', coalesce((select sum(follower_count) from creator_stats),0),
    'views', coalesce((select sum(views) from content_set where decision='relevant'),0),
    'engagements', coalesce((select sum(coalesce(like_count,0)+coalesce(comment_count,0)+coalesce(share_count,0)+coalesce(save_count,0)) from content_set where decision='relevant'),0),
    'typeCounts', coalesce((select jsonb_object_agg(source_type,total) from type_counts),'{}'::jsonb)
  ) payload
),
benchmark_payload as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'key', benchmark_key, 'platform', platform, 'format', format, 'market', market,
    'value', value, 'unit', unit, 'multiplier', multiplier, 'status', status,
    'sourceNote', source_note, 'effectiveFrom', effective_from
  ) order by platform, format), '[]'::jsonb) value
  from report_benchmarks b join project p on p.id=b.project_id
)
select jsonb_build_object(
  'project', (select to_jsonb(p) - 'theme' || jsonb_build_object('theme',p.theme) from project p),
  'summary', (select payload from summary),
  'creators', coalesce((select jsonb_agg(jsonb_build_object(
    'id', id, 'handle', handle, 'displayName', display_name, 'biography', biography,
    'category', category, 'profileStorageKey', profile_storage_key, 'verified', is_verified,
    'followers', follower_count, 'content', qualified_content, 'scrapedContent', scraped_content,
    'engagements', engagements, 'views', views,
    'engagementRate', case when follower_count > 0 and measured_content > 0
      then round((engagements::numeric / (follower_count * measured_content)) * 100, 2) else null end
  ) order by engagements desc, follower_count desc) from creator_stats where scraped_content > 0), '[]'::jsonb),
  'content', coalesce((select jsonb_agg(jsonb_build_object(
    'id', id, 'handle', handle, 'displayName', display_name, 'profileStorageKey', profile_storage_key,
    'followers', follower_count, 'platform', platform, 'sourceType', source_type,
    'mediaType', media_type, 'shortcode', shortcode, 'caption', caption, 'permalink', permalink,
    'publishedAt', published_at, 'decision', decision, 'assetKey', primary_asset_key,
    'assetKind', primary_asset_kind, 'likes', like_count, 'comments', comment_count,
    'shares', share_count, 'saves', save_count, 'views', views
  ) order by published_at desc) from content_set), '[]'::jsonb),
  'benchmarks', (select value from benchmark_payload),
  'model', coalesce((select to_jsonb(m) from report_emv_models m join project p on p.id=m.project_id order by m.created_at desc limit 1),'{}'::jsonb)
);
$$;

revoke all on function public.get_report_payload(text, boolean) from public, anon, authenticated;
grant execute on function public.get_report_payload(text, boolean) to service_role;

commit;
