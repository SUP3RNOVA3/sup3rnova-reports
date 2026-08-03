'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const REPORT_DIR = path.join(ROOT, 'Hottest_Brunch');
const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const R2_BUCKET = process.env.R2_BUCKET || 'sup3rnova-reports';
const ACCESS_TEAM = String(process.env.CF_ACCESS_TEAM_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
const ACCESS_AUD = process.env.CF_ACCESS_AUD || '';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const MIME = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4' };
let certCache = { expires: 0, keys: [] };

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, { 'Content-Type':'application/json; charset=utf-8','Content-Length':Buffer.byteLength(body),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff' });
  res.end(body);
}

function serveFile(res, filePath) {
  if (!filePath.startsWith(REPORT_DIR + path.sep) && filePath !== path.join(REPORT_DIR, 'index.html')) return sendJson(res, 403, { error:'forbidden' });
  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) return sendJson(res, 404, { error:'not found' });
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': path.extname(filePath)==='.html' ? 'no-cache' : 'public, max-age=3600',
      'X-Frame-Options':'SAMEORIGIN','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data: blob: https://images.unsplash.com; media-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'",
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

async function supabaseRpc(includeAll) {
  if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Supabase server configuration missing');
  const response = await fetch(SUPABASE_URL + '/rest/v1/rpc/get_report_payload', {
    method:'POST',
    headers:{ apikey:SERVICE_KEY, Authorization:'Bearer ' + SERVICE_KEY, 'Content-Type':'application/json' },
    body:JSON.stringify({ p_slug:'hottest-brunch', p_include_all:Boolean(includeAll) }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error('Supabase RPC ' + response.status + ': ' + JSON.stringify(payload).slice(0,300));
  return payload;
}

async function saveReview(input, email) {
  const allowed = ['pending','relevant','maybe','discarded'];
  if (!input || !input.contentId || !allowed.includes(input.decision)) throw new Error('Invalid review payload');
  const now = new Date().toISOString();
  const response = await fetch(SUPABASE_URL + '/rest/v1/report_reviews?on_conflict=content_id', {
    method:'POST',
    headers:{ apikey:SERVICE_KEY,Authorization:'Bearer '+SERVICE_KEY,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=representation' },
    body:JSON.stringify({ content_id:input.contentId,decision:input.decision,notes:input.notes||null,reviewed_by:email,reviewed_at:now,updated_at:now }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error('Supabase review ' + response.status + ': ' + JSON.stringify(payload).slice(0,300));
  return Array.isArray(payload) ? payload[0] : payload;
}

function decodeBase64Url(value) {
  return Buffer.from(value.replace(/-/g,'+').replace(/_/g,'/'), 'base64');
}

async function accessKeys() {
  if (certCache.expires > Date.now()) return certCache.keys;
  if (!ACCESS_TEAM) throw new Error('Cloudflare Access team domain missing');
  const response = await fetch('https://' + ACCESS_TEAM + '/cdn-cgi/access/certs');
  if (!response.ok) throw new Error('Cloudflare Access certs unavailable');
  const payload = await response.json();
  certCache = { expires:Date.now()+3600000, keys:payload.keys || payload.public_certs || [] };
  return certCache.keys;
}

async function verifyAccess(req) {
  if (process.env.NODE_ENV !== 'production' && process.env.REPORT_ADMIN_BYPASS === '1') return { email:'local-admin@sup3rnova.com' };
  const token = req.headers['cf-access-jwt-assertion'];
  if (!token || !ACCESS_AUD) throw new Error('Cloudflare Access authentication required');
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid Access token');
  const header = JSON.parse(decodeBase64Url(parts[0]).toString('utf8'));
  const payload = JSON.parse(decodeBase64Url(parts[1]).toString('utf8'));
  const keys = await accessKeys();
  const jwk = keys.find(key => key.kid === header.kid);
  if (!jwk) throw new Error('Unknown Access signing key');
  const publicKey = crypto.createPublicKey({ key:jwk, format:'jwk' });
  const valid = crypto.verify('RSA-SHA256', Buffer.from(parts[0]+'.'+parts[1]), publicKey, decodeBase64Url(parts[2]));
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!valid || !audiences.includes(ACCESS_AUD) || payload.exp*1000 < Date.now()) throw new Error('Access token rejected');
  if (payload.iss && payload.iss !== 'https://' + ACCESS_TEAM) throw new Error('Access issuer rejected');
  return { email:payload.email || payload.sub || 'access-user' };
}

async function proxyMedia(req, res, key) {
  if (!key.startsWith('hottest-brunch/')) return sendJson(res, 403, { error:'invalid media key' });
  const range = req.headers.range;
  try {
    const object = await s3.send(new GetObjectCommand({ Bucket:R2_BUCKET, Key:key, Range:range }));
    const headers = {
      'Content-Type':object.ContentType || MIME[path.extname(key).toLowerCase()] || 'application/octet-stream',
      'Accept-Ranges':'bytes','Cache-Control':'public, max-age=604800, immutable','X-Content-Type-Options':'nosniff',
    };
    if (object.ContentLength != null) headers['Content-Length'] = object.ContentLength;
    if (object.ContentRange) headers['Content-Range'] = object.ContentRange;
    if (object.ETag) headers.ETag = object.ETag;
    res.writeHead(range ? 206 : 200, headers);
    object.Body.pipe(res);
  } catch (error) {
    sendJson(res, error.name === 'NoSuchKey' ? 404 : 502, { error:'media unavailable' });
  }
}

async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  try {
    if (pathname === '/healthz') return sendJson(res, 200, { ok:true, service:'sup3rnova-reports' });
    if (pathname === '/') { res.writeHead(302,{Location:'/Hottest_Brunch/'}); return res.end(); }
    if (pathname === '/api/report/hottest-brunch' && req.method === 'GET') return sendJson(res, 200, await supabaseRpc(false));
    if (pathname === '/Hottest_Brunch/admin/api/data' && req.method === 'GET') { await verifyAccess(req); return sendJson(res, 200, await supabaseRpc(true)); }
    if (pathname === '/Hottest_Brunch/admin/api/review' && req.method === 'POST') {
      const identity = await verifyAccess(req);
      let body=''; for await (const chunk of req) { body += chunk; if (body.length > 65536) throw new Error('Request too large'); }
      return sendJson(res, 200, await saveReview(JSON.parse(body || '{}'), identity.email));
    }
    if (pathname.startsWith('/media/') && req.method === 'GET') return proxyMedia(req, res, pathname.slice('/media/'.length));
    if (pathname === '/Hottest_Brunch' || pathname === '/Hottest_Brunch/' || pathname === '/Hottest_Brunch/admin' || pathname === '/Hottest_Brunch/admin/') return serveFile(res, path.join(REPORT_DIR,'index.html'));
    if (pathname.startsWith('/Hottest_Brunch/')) {
      const relative = pathname.slice('/Hottest_Brunch/'.length).replace(/^admin\//,'');
      const filePath = path.normalize(path.join(REPORT_DIR, relative));
      return serveFile(res, filePath);
    }
    return sendJson(res, 404, { error:'not found' });
  } catch (error) {
    const status = /Access|authentication|token|issuer|signing/.test(error.message) ? 401 : /Invalid|large/.test(error.message) ? 400 : 500;
    console.error(error.message);
    return sendJson(res, status, { error:status===500 ? 'server error' : error.message });
  }
}

http.createServer(handler).listen(PORT, () => console.log('SUP3RNOVA Reports listening on ' + PORT));
