#!/usr/bin/env node
// iskill-dig-media · ark_t2i.mjs —— 火山方舟(Agent Plan) seedream 文生图薄封装
//
// 为什么存在（2026-10-03 实测结论）：
//   ① Agent Plan 的 key 是专属 key，只能打 /api/plan/v3 端点，普通 /api/v3 必 401；
//   ② MPT 的 openai_image 源发不出 `watermark:false`（请求体写死 model/prompt/n/size），
//      出图必带「AI生成」角标 → 正式生产走本脚本直连；
//   ③ 档位矩阵：seedream 生图全档可用；seedance 生视频仅 Large/Max 档（勿在此走视频）。
//
// 用法:
//   node ark_t2i.mjs "<prompt>" [--out <dir>] [--name <file>] [--size 1024x1536]
//                    [--model <id>] [--style "<风格后缀>"] [--slug <目录slug>]
//   prompt 建议中文视觉描述；--style 默认追加纪实摄影风（与成片调性一致）。
// 凭据: ~/.iskill-dig-media.json 的 ark_plan_key / ark_plan_base_url / ark_plan_model
//       （没有则打印配置指引并退出 2，与 dig_media.mjs 同约定）
// 产物: <out>/<name> + 增量写 <out>/manifest.json（prompt/参数/时间，溯源凭证）
// 退出码: 0 成功 / 1 生成失败 / 2 配置缺失

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const DEFAULT_STYLE = "自然光，电影感纪实摄影，暖色调，细节丰富";
const CFG_PATH = path.join(os.homedir(), ".iskill-dig-media.json");

function parseArgs(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) a[argv[i].slice(2)] = argv[++i];
    else a._.push(argv[i]);
  }
  return a;
}

function slugify(s) {
  const w = s.toLowerCase().replace(/[^\p{Script=Han}a-z0-9]+/gu, "-").replace(/^-+|-+$/g, "");
  return w.slice(0, 40) || "ark-t2i";
}

const args = parseArgs(process.argv.slice(2));
if (!args._.length) {
  console.error('用法: node ark_t2i.mjs "<prompt>" [--out <dir>] [--name f.jpg] [--size 1024x1536] [--model <id>] [--style "<后缀>"] [--slug <目录>]');
  process.exit(2);
}
const cfg = fs.existsSync(CFG_PATH) ? JSON.parse(fs.readFileSync(CFG_PATH, "utf8")) : {};
const KEY = cfg.ark_plan_key, BASE = cfg.ark_plan_base_url, MODEL = cfg.ark_plan_model;
if (!KEY || !BASE || !MODEL) {
  console.error(`缺配置：请在 ${CFG_PATH} 补以下字段（Agent Plan 控制台获取，勿写进任何会推送的文件）：
  "ark_plan_key": "<专属key>",
  "ark_plan_base_url": "https://ark.cn-beijing.volces.com/api/plan/v3",
  "ark_plan_model": "doubao-seedream-5-0-pro-260628"
注意：只能用 Agent Plan 专属端点（/api/plan/v3）；生图全档可用，生视频仅 Large/Max 档。`);
  process.exit(2);
}

const prompt = [args._.join(" "), args.style || DEFAULT_STYLE].filter(Boolean).join("，");
const size = args.size || "1024x1536";
const model = args.model || MODEL;
const slug = args.slug || slugify(prompt);
const outDir = args.out || path.join(process.cwd(), "dig-media", `ai-${slug}`);
fs.mkdirSync(outDir, { recursive: true });

const endpoint = `${BASE.replace(/\/$/, "")}/images/generations`;
const body = { model, prompt, n: 1, size, response_format: "url", watermark: false };

const t0 = Date.now();
const res = await fetch(endpoint, {
  method: "POST",
  headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
const text = await res.text();
if (!res.ok) {
  console.error(`生成失败 HTTP ${res.status}: ${text.slice(0, 400)}`);
  console.error("提示：UnsupportedModel=模型不在套餐档位；AuthenticationError=key 不是 Agent Plan 专属 key。");
  process.exit(1);
}
let data;
try { data = JSON.parse(text); } catch { console.error("响应非 JSON:", text.slice(0, 300)); process.exit(1); }
const item = data?.data?.[0];
if (!item) { console.error("响应缺 data[0]:", text.slice(0, 300)); process.exit(1); }

let bytes;
if (item.url) {
  const ir = await fetch(item.url);
  if (!ir.ok) { console.error(`下载失败 HTTP ${ir.status}`); process.exit(1); }
  bytes = Buffer.from(await ir.arrayBuffer());
} else if (item.b64_json) {
  bytes = Buffer.from(item.b64_json, "base64");
} else { console.error("响应无 url/b64_json"); process.exit(1); }

const name = args.name || `ai-img-${Date.now()}.jpg`;
const outPath = path.join(outDir, name);
fs.writeFileSync(outPath, bytes);
const secs = ((Date.now() - t0) / 1000).toFixed(1);

// manifest 增量追加
const mpath = path.join(outDir, "manifest.json");
let manifest = fs.existsSync(mpath) ? JSON.parse(fs.readFileSync(mpath, "utf8")) : { source: "ark-agent-plan-seedream", items: [] };
manifest.endpoint = endpoint;
manifest.params = { size, watermark: false, protocol: "OpenAI /images/generations 兼容" };
manifest.items = manifest.items || [];
manifest.items.push({
  file: name, model, size,
  prompt: args._.join(" "), style: args.style || DEFAULT_STYLE,
  generated_at: new Date().toISOString(),
  billing: "AFP 套餐额度抵扣（Agent Plan），估算 75~300 AFP/张",
});
fs.writeFileSync(mpath, JSON.stringify(manifest, null, 2) + "\n");

console.log(`OK ${outPath} (${(bytes.length / 1024).toFixed(0)}KB, ${secs}s, ${size})`);
console.log(`manifest → ${mpath}`);
