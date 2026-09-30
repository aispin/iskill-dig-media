#!/usr/bin/env node
// iskill-dig-media — 从 Pixabay 搜索并下载照片/视频素材（官方 API，免署名 License）
// 用法:
//   dig_media.mjs search --kw "farm harvest" [--type video|photo|all] [--per-page 12]
//   dig_media.mjs get    --kw "farm harvest" [--type all] [--n 6] [--out ./dig-media]
//                        [--min-width 1280] [--force] [--sizes large,medium]
// API key 查找顺序: $PIXABAY_API_KEY → ~/.iskill-dig-media.json → ~/.workbuddy/dig-media.json(遗留) → ./.dig-media.json ({"pixabay":"xxx"})
// 解藕约定：配置一律存用户主目录 ~/.iskill-*，不绑死任何 agent 的工作区

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import process from "node:process";

// ---------- args ----------
function parseArgs() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const o = { cmd };
  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === "--kw") o.kw = args[++i];
    else if (a === "--type") o.type = args[++i]; // video|photo|all
    else if (a === "--per-page") o.perPage = +args[++i];
    else if (a === "--n") o.n = +args[++i];
    else if (a === "--out") o.out = args[++i];
    else if (a === "--min-width") o.minWidth = +args[++i];
    else if (a === "--force") o.force = true;
    else if (a === "--sizes") o.sizes = args[++i].split(",");
  }
  return o;
}

// ---------- key ----------
function loadKey() {
  if (process.env.PIXABAY_API_KEY) return { key: process.env.PIXABAY_API_KEY, src: "env" };
  const candidates = [
    { p: join(homedir(), ".iskill-dig-media.json"), tag: "user" },
    { p: join(homedir(), ".workbuddy", "dig-media.json"), tag: "legacy" },
    { p: resolve(".dig-media.json"), tag: "local" },
  ];
  for (const { p, tag } of candidates) {
    if (existsSync(p)) {
      try {
        const j = JSON.parse(readFileSync(p, "utf8"));
        if (j.pixabay) return { key: j.pixabay, src: tag === "legacy" ? `${p}（遗留路径，建议迁移到 ~/.iskill-dig-media.json）` : p };
      } catch {}
    }
  }
  return null;
}

function dieNoKey() {
  console.error(`[dig-media] 未找到 Pixabay API key。
一次性配置（免费，1 分钟）：
  1) 注册/登录 https://pixabay.com → 打开 https://pixabay.com/api/docs/ 页面会显示你的 key
  2) 任选一种落盘：
     a. echo '{"pixabay":"你的key"}' > ~/.iskill-dig-media.json   # 推荐，用户主目录、跨 agent 通用
     b. export PIXABAY_API_KEY=你的key
之后重跑即可。`);
  process.exit(2);
}

// ---------- helpers ----------
const UA = "iskill-dig-media/1.0 (WorkBuddy skill)";
async function apiGet(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (r.status === 429) throw new Error("RATE_LIMIT: Pixabay 限频（100 req/60s），等 1 分钟再试");
  if (r.status === 400) {
    const t = await r.text().catch(() => "");
    if (/invalid/i.test(t)) throw new Error("BAD_KEY: API key 无效，重新到 pixabay.com/api/docs/ 核对");
    throw new Error(`HTTP 400: ${t.slice(0, 200)}`);
  }
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "dig";
}

async function download(url, dest) {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`download HTTP ${r.status}: ${url}`);
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(dest, buf);
  return buf.length;
}

const sleep = (ms) => new Promise((s) => setTimeout(s, ms));

// ---------- search ----------
async function doSearch(o) {
  const key = loadKey();
  if (!key) dieNoKey();
  const type = o.type || "all";
  const perPage = o.perPage || 12;
  const out = [];

  if (type === "photo" || type === "all") {
    const j = await apiGet(
      `https://pixabay.com/api/?key=${key.key}&q=${encodeURIComponent(o.kw)}&per_page=${perPage}&safesearch=true&image_type=photo`
    );
    for (const h of j.hits || []) {
      out.push({
        kind: "photo", id: h.id, tags: h.tags, user: h.user,
        width: h.imageWidth, height: h.imageHeight,
        page: h.pageURL, best_url: h.largeImageURL,
      });
    }
  }
  if (type === "video" || type === "all") {
    const j = await apiGet(
      `https://pixabay.com/api/videos/?key=${key.key}&q=${encodeURIComponent(o.kw)}&per_page=${perPage}&safesearch=true`
    );
    for (const h of j.hits || []) {
      const v = h.videos || {};
      const pick = v.large?.url ? "large" : v.medium?.url ? "medium" : null;
      if (!pick) continue;
      out.push({
        kind: "video", id: h.id, tags: h.tags, user: h.user,
        width: v[pick].width, height: v[pick].height, duration: h.duration,
        page: h.pageURL, best_url: v[pick].url, size_label: pick,
      });
    }
  }
  console.log(JSON.stringify({ query: o.kw, total: out.length, hits: out }, null, 2));
}

// ---------- get ----------
async function doGet(o) {
  const key = loadKey();
  if (!key) dieNoKey();
  if (!o.n) o.n = 6;
  if (!o.out) o.out = "./dig-media";
  const type = o.type || "all";
  const minW = o.minWidth || 0;
  const outDir = resolve(o.out, slug(o.kw));
  mkdirSync(outDir, { recursive: true });

  const manifest = [];
  const perSource = o.n * 2; // 多取一倍做宽度/去重冗余
  const jobs = [];

  if (type === "photo" || type === "all") {
    const j = await apiGet(
      `https://pixabay.com/api/?key=${key.key}&q=${encodeURIComponent(o.kw)}&per_page=${perSource}&safesearch=true&image_type=photo`
    );
    for (const h of j.hits || []) {
      if (minW && h.imageWidth < minW) continue;
      jobs.push({ kind: "photo", id: h.id, url: h.largeImageURL, ext: ".jpg",
        tags: h.tags, user: h.user, page: h.pageURL, w: h.imageWidth, h: h.imageHeight });
    }
  }
  if (type === "video" || type === "all") {
    const j = await apiGet(
      `https://pixabay.com/api/videos/?key=${key.key}&q=${encodeURIComponent(o.kw)}&per_page=${perSource}&safesearch=true`
    );
    const sizes = o.sizes || ["large", "medium"];
    for (const h of j.hits || []) {
      for (const s of sizes) {
        if (h.videos?.[s]?.url) {
          jobs.push({ kind: "video", id: h.id, url: h.videos[s].url,
            ext: h.videos[s].url.match(/\.(mp4|webm|avi|mov)$/i)?.[1] || ".mp4",
            tags: h.tags, user: h.user, page: h.pageURL,
            w: h.videos[s].width, h: h.videos[s].height, size_label: s });
          break; // 每条视频只要首选尺寸
        }
      }
      if (minW) jobs.filter(x => x.id === h.id).forEach(x => { if (x.w < minW) x._skip = true; });
    }
  }

  let saved = 0;
  for (const job of jobs) {
    if (saved >= o.n) break;
    if (job._skip) continue;
    const fname = `${job.kind}-${job.id}${job.ext}`;
    const dest = join(outDir, fname);
    if (existsSync(dest) && !o.force) {
      manifest.push({ file: fname, cached: true, ...job });
      saved++;
      continue;
    }
    try {
      const bytes = await download(job.url, dest);
      if (bytes < 5 * 1024) { // 坏缩略图剔除（沿用 clipper 实锤阈值）
        console.error(`[skip] ${fname} 过小(${bytes}B)，疑似坏文件`);
        continue;
      }
      manifest.push({ file: fname, bytes, ...job });
      saved++;
      console.error(`[ok] ${fname} (${(bytes / 1024 / 1024).toFixed(1)}MB) ${job.w}x${job.h} "${job.tags}"`);
    } catch (e) {
      console.error(`[fail] ${fname}: ${e.message}`);
    }
    await sleep(300); // 轻错峰，避免限频
  }

  const mf = { query: o.kw, key_source: key.src, fetched_at: new Date().toISOString(),
    license: "Pixabay Content License（可商用、免署名，见 https://pixabay.com/service/license-summary/）",
    items: manifest };
  writeFileSync(join(outDir, "manifest.json"), JSON.stringify(mf, null, 2));
  console.log(`\n[dig-media] 完成：${saved} 个素材 → ${outDir}\n清单: ${join(outDir, "manifest.json")}`);
  if (saved === 0) {
    console.error(`[warn] 0 个素材落盘。排查：① 换更简单的英文关键词（如 "farm" 而非 "生态农场秋收"）② 提高 --n 或放宽 --min-width`);
    process.exit(1);
  }
}

// ---------- main ----------
const o = parseArgs();
if (o.cmd === "search" && o.kw) await doSearch(o);
else if (o.cmd === "get" && o.kw) await doGet(o);
else {
  console.log(`用法:
  dig_media.mjs search --kw "farm harvest" [--type video|photo|all] [--per-page 12]
  dig_media.mjs get    --kw "farm harvest" [--type all] [--n 6] [--out ./dig-media]
                       [--min-width 1280] [--force] [--sizes large,medium]`);
  process.exit(1);
}
