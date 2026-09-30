---
name: iskill-dig-media
summary: 网络素材挖掘——从 Pixabay 等素材站按关键词搜照片/视频，下载到 dig-media 目录，附来源清单（可商用免署名）。
description: 当用户要给视频/文案配网络素材、问「找些农场素材」「搜配图」「下几条视频素材」，或 iskill-video-clipper 在无素材时需要补料时使用。触发词：找素材、搜素材、dig media、素材站、pixabay。走 Pixabay 官方 API（可商用、免署名），产物落 {工作区}/dig-media/<关键词slug>/ 并写 manifest.json 来源清单。需一次性配置免费 API key。
---

# iskill-dig-media

六步爆款工作流的**素材弹药库**：按关键词从 Pixabay（照片+视频，可商用免署名）搜素材、下载落盘，供 iskill-video-clipper 出片使用。

```
六步工作流：… → [6]成片(iskill-video-clipper)
              └─ 无素材时 ← 本 skill（raw/ 与 dig-media/ 都空时自动触发）
```

## 一次性配置（没有 key 时第一步永远先做这个）

1. 注册/登录 https://pixabay.com → 打开 https://pixabay.com/api/docs/ ，页面顶部即显示你的 API key（免费，100 次/分钟）
2. 落盘任选其一：
   ```bash
   echo '{"pixabay":"你的key"}' > ~/.iskill-dig-media.json   # 推荐，用户主目录、跨 agent 通用
   # 或 export PIXABAY_API_KEY=你的key
   ```

脚本发现 key 缺失时会打印上面这段指引并退出，原样转告用户即可。

## 快速开始

```bash
# 搜索预览（只看不下）：返回 JSON（id/尺寸/标签/页面链接）
node scripts/dig_media.mjs search --kw "farm harvest" --type all --per-page 12

# 下载 6 条到 {工作区}/dig-media/farm-harvest/
node scripts/dig_media.mjs get --kw "farm harvest" --n 6 --out ./dig-media

# 只搜视频 + 卡最小宽度（保证够竖屏放大）
node scripts/dig_media.mjs get --kw "rice field" --type video --n 4 --min-width 1280

# 挖 BGM 音乐（Wikimedia Commons 源，免 key）：CC0/PD 优先，CC BY 记录署名信息
node scripts/dig_media.mjs music --kw "happy ukulele" --n 3 --out ./dig-media
```

## 音乐（BGM）说明

- **为什么不是 Pixabay**：官方 API 没有音乐端点，音乐页有 Cloudflare 拦截（403）；FreePD 已关站。改用 **Wikimedia Commons API**（免 key、直链、许可元数据齐全）。
- **许可口径**：CC0 / Public domain 优先；**CC BY / CC BY-SA 可商用但需署名**——发布时在简介注明 manifest 里的 artist 与 license；NC/ND/未知许可一律跳过不下载。
- **产物**：`dig-media/music-<关键词slug>/` 下 `music-<pageid>.mp3|wav` + manifest.json（含标题/许可/作者/时长/来源页）。
- **网络注意**：Commons 直连不稳（node fetch 超时），脚本已内置 curl 多代理兜底（$ISKILL_PROXY → 环境 → http://127.0.0.1:10080）；仍失败时换时段重试。
- **关键词**：用英文音乐词（"happy ukulele" "acoustic folk" "upbeat corporate"），Commons 收录以英文曲名为主；词太长太泛会 0 命中（全词 AND）。

## 产出结构

```
dig-media/<关键词slug>/
├── photo-<id>.jpg        # 大图（约 1280px+）
├── video-<id>.mp4        # large/medium 首选档
└── manifest.json         # 查询词/时间/License/每条来源页+作者+尺寸
```

## 使用规则（给执行 agent）

1. **关键词用英文**——Pixabay 英文命中率高一个量级。中文选题词先翻译成 2-4 个英文查询词轮询
   （例：「晒秋」→ `autumn harvest` / `drying crops` / `rural village`）。
2. **先 search 后 get**：数量要求明确时可直接 get；拿不准搜到什么时先 search 看标签再挑。
3. **竖屏成片注意**：`--min-width 1280` 起步；横屏素材给竖屏用会裁切，提前想清楚画幅。
4. **manifest.json 是溯源凭证**：不删不改；视频里用了谁的内容可随时回查。
5. **License 口径**：Pixabay Content License 可商用免署名，但**别把素材里可辨识的人物/品牌当自家产品代言**；成品涉及广告投放时提示用户复核平台规则。
6. 下载量少或结果不对味：先换关键词再报错，别硬凑；`0 个素材落盘` 的告警要如实转告。
7. 与 iskill-video-clipper 的关系：它是**上游补给**——clipper 无素材时会调本 skill；素材已在 `dig-media/` 时 clipper 直接复用，不重复下载。

## 注意事项

- 脚本零依赖（Node 22 内置 fetch），不需要 pip/npm 安装任何东西。
- Pixabay 限频 100 次/60 秒；脚本已带 300ms 错峰，批量别超过几百条。
- 429（限频）等一分钟重试；BAD_KEY 按配置指引重新核对。
- 未来扩展 Pexels/其他站：key 写进同一个文件（`{"pixabay":"...","pexels":"..."}`），脚本加 `--source` 参数——目前只实现了 pixabay。
- **配置解藕约定**：本 skill 系列的配置文件一律存用户主目录 `~/.iskill-*`（如 `~/.iskill-dig-media.json`、`~/.iskill-weixin-cookies.txt`），不绑死任何 agent 的工作区；旧 agent 目录里的同名文件仅作遗留兼容读取。
