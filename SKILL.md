---
name: iskill-dig-media
summary: 素材供给中心——Pixabay 图库挖掘（免费）+ AI 图片/视频生成（计费）双供给，统一落盘 dig-media/ 并写 manifest 溯源。
description: 当用户要给视频/文案配素材、问「找些农场素材」「搜配图」「下几条视频素材」，需要 AI 生成图片/视频素材（「AI 生成一个镜头」「生成空镜视频」），要聚合多源图库/AI 文生视频（MoneyPrinterTurbo / MPT / Pexels / Seedance），或 iskill-video-clipper 缺素材/AIGC 模式需要补料时使用。触发词：找素材、搜素材、dig media、素材站、pixabay、pexels、AI 生成素材、moneyprinterturbo。四种供给：①Pixabay 图库（脚本化、免费、可商用免署名）；②AI 生成图片（ImageGen，5-10 credits/张）；③AI 生成视频（VideoGen，约 50-100 credits/5 秒）；④MPT 聚合素材档（MoneyPrinterTurbo CLI，聚合 Pexels/Coverr + 6+ 家 AI 文生视频，只借素材不借合成）。产物统一落 {工作区}/dig-media/ 并写 manifest.json 溯源。
---

# iskill-dig-media

六步爆款工作流的**素材供给中心**：两条供给线——**图库挖掘**（Pixabay 脚本下载，免费）与 **AI 生成**（ImageGen/VideoGen 会话工具，计费），产物统一落盘 `dig-media/`、统一 manifest 溯源，供 iskill-video-clipper 等下游消费。

```
六步工作流：… → [6]成片(iskill-video-clipper)
              └─ 缺素材时 ← 本 skill
                   ├─ 免费级：图库搜索下载（优先）
                   └─ AI 级：ai-image / ai-video 生成协议（计费，事前确认）
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

# Ark seedream 文生图直连（Agent Plan 套餐，watermark 已关）：
node scripts/ark_t2i.mjs "秋天的板栗林小径，地面散落带刺的板栗壳与断枝，晨光" --out ./dig-media/ai-捡秋素材
```

## 音乐（BGM）说明

- **为什么不是 Pixabay**：官方 API 没有音乐端点，音乐页有 Cloudflare 拦截（403）；FreePD 已关站。改用 **Wikimedia Commons API**（免 key、直链、许可元数据齐全）。
- **许可口径**：CC0 / Public domain 优先；**CC BY / CC BY-SA 可商用但需署名**——发布时在简介注明 manifest 里的 artist 与 license；NC/ND/未知许可一律跳过不下载。
- **产物**：`dig-media/music-<关键词slug>/` 下 `music-<pageid>.mp3|wav` + manifest.json（含标题/许可/作者/时长/来源页）。
- **网络注意**：Commons 直连不稳（node fetch 超时），脚本已内置 curl 多代理兜底（$ISKILL_PROXY → 环境 → http://127.0.0.1:10080）；仍失败时换时段重试。
- **关键词**：用英文音乐词（"happy ukulele" "acoustic folk" "upbeat corporate"），Commons 收录以英文曲名为主；词太长太泛会 0 命中（全词 AND）。

## 产出结构

```
dig-media/<关键词slug>/          # 图库素材（脚本下载）
├── photo-<id>.jpg        # 大图（约 1280px+）
├── video-<id>.mp4        # large/medium 首选档
└── manifest.json         # 查询词/时间/License/每条来源页+作者+尺寸

dig-media/ai-<关键词slug>/       # AI 生成素材（协议产出，计费）
├── ai-img-<n>.png        # ImageGen 锚帧/图片
├── ai-vid-<n>.mp4        # VideoGen 视频（约 5s/条）
└── manifest.json         # prompt/参数/credits 估算/时间/缓存查重依据
```

## 使用规则（给执行 agent）

1. **关键词用英文**——Pixabay 英文命中率高一个量级。中文选题词先翻译成 2-4 个英文查询词轮询
   （例：「晒秋」→ `autumn harvest` / `drying crops` / `rural village`）。
2. **先 search 后 get**：数量要求明确时可直接 get；拿不准搜到什么时先 search 看标签再挑。
3. **竖屏成片注意**：`--min-width 1280` 起步；横屏素材给竖屏用会裁切，提前想清楚画幅。
4. **manifest.json 是溯源凭证**：不删不改；视频里用了谁的内容可随时回查。
5. **License 口径**：Pixabay Content License 可商用免署名，但**别把素材里可辨识的人物/品牌当自家产品代言**；成品涉及广告投放时提示用户复核平台规则。
6. 下载量少或结果不对味：先换关键词再报错，别硬凑；`0 个素材落盘` 的告警要如实转告。
7. 与 iskill-video-clipper 的关系：它是**上游补给**——clipper 无素材/AIGC 模式时会调本 skill；素材已在 `dig-media/` 时 clipper 直接复用，不重复下载、不重复计费。

## AI 生成供给（ai-image / ai-video 协议）

**机制说明（硬约束）**：AI 生成走 WorkBuddy 会话内置工具 **ImageGen / VideoGen**——它们没有命令行入口，由执行 agent 在对话中直接调用，**本 skill 不提供脚本**；本节是调用契约（何时调、参数怎么填、产物怎么落盘）。

**成本确认（每次必做）**：ImageGen 约 5-10 credits/张，VideoGen 约 50-100 credits/条（约 5 秒）。**任何生成动作前，必须列出「镜头数 × 单价 = 估算 credits」并获得用户明确确认**；这是工具方的强制要求，也是本 skill 的铁律。

### 调用契约

**ai-image（AI 生成图片）**
1. `生成前查缓存`：目标目录 `dig-media/ai-<关键词slug>/manifest.json` 里已有同 prompt 产物 → 直接复用，不重复计费
2. 调 ImageGen：`prompt`（英文视觉描述 + 统一 style 后缀）、`size` 竖屏成片用 `1024x1536`、`output_dir` 指向 `dig-media/ai-<slug>/`
3. 落盘后把文件改名为 `ai-img-<n>.png`，并在 manifest.json 追加记录：prompt / size / 生成时间 / credits 估算 / output_dir 实际路径
4. **失败降级**：生成失败最多重试 1 次；仍失败 → 回退图库挖掘补位，并在交付时说明

**ai-video（AI 生成视频）**
1. 同样先查缓存查重
2. **锚帧优先**（默认）：关键叙事镜先用 ai-image 出锚帧（风格锚点，图便宜），再调 VideoGen `image=<锚帧路径>` 图生视频；纯空镜/氛围镜直接文生视频即可
3. VideoGen 参数规范：竖屏成片 `resolution:"1080P"`、文生视频加 `aspect_ratio:"9:16"`（图生视频由锚帧决定）、**`enable_audio:false`（必关——AI 音轨与下游配音/BGM 冲突，声音一律由剪辑管线负责）**、`negative_prompt` 按需（如 "text, watermark, logo"）
4. 下载产物落 `dig-media/ai-<slug>/ai-vid-<n>.mp4`（工具默认 output_dir 是 generated-videos/，**必须显式指定 output_dir** 或生成后移动落位），manifest.json 追加 prompt / 参数 / credits / 时长
5. **单条约 5 秒**：下游剪辑段长 2-8s，段内用慢平移/crop 截取所需时长（clipper 已有此动效手段），与节拍卡点兼容
6. 失败重试最多 1 次（重试也计费）；仍失败 → 图库挖掘降级 + 交付说明

### 统一 style 后缀（风格一致性）
同一成片的所有 AI 镜头，prompt 末尾追加同一句风格描述（从选题调性推导），例：
- 纪实乡村：`cinematic documentary style, warm golden hour light, natural colors, 35mm film look`
- 清新美食：`bright food photography style, soft natural light, shallow depth of field`
锚帧法是更强的保障：关键镜共享同一张 ImageGen 锚帧的视觉基因。

### AI 生成使用规则（给执行 agent）
1. **credits 是真金白银**：宁可少生成，不批量囤积；每个 prompt 单独可追溯
2. prompt 用**英文**写视觉描述（与图库关键词同理，命中率高）；不写文字/水印要求（字幕由剪辑管线负责）
3. manifest.json 记录的 credits 是**估算值**（工具无余额查询），交付时注明「估算口径」
4. AI 画面有「AI 感」：真实感选题（纪实/人物/手作）把 AI 镜头限定在空镜/氛围/转场镜，不要替代实拍主体镜
5. 与 clipper 的关系：clipper 的 `--engine aigc-mix / aigc-full` 模式按本节协议取料；`--engine local` 时本节不启用——**例外：封面等「单点用途」用户明确要 AI 时，可单独走 ai-image，不影响引擎档位**
6. **封面单图用例**：用户要「封面用AI」时只调 ai-image 单张（竖屏 `1024x1536`，横版平台按 `1536x1024`），prompt = 选题核心画面 + 与成片一致的 style 后缀；单张 5-10 credits，事前确认；落 `dig-media/ai-封面-<slug>/` 并记 manifest

## MPT 聚合素材档（MoneyPrinterTurbo，可选装）

**定位**：第三条供给线——把 [MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo)（MIT，~123k stars）当**多源素材聚合器**用：一个入口聚合 Pexels / Pixabay / Coverr 图库 + **6+ 家 AI 文生视频**（火山 Seedance / WaveSpeed / MuAPI / MiniMax H3 / OFox / OpenAI 文生图）。**只借素材，不借合成**——它的合成档位弱于 iskill-video-clipper 主链路（无 blur-fill、无节拍卡点、CLI 字幕是坏的，2026-10-03 实测，见 clipper 仓 `docs/MoneyPrinterTurbo-接入调研.md`）。

**安装（一次性，沙箱内可跑）**：
```bash
git clone --depth 1 https://github.com/harry0703/MoneyPrinterTurbo.git /Users/lv/WorkBuddy/ISkills/deps/moneyprinterturbo
cd /Users/lv/WorkBuddy/ISkills/deps/moneyprinterturbo && ~/.local/bin/uv run python cli.py --help
```
> ⚠️ 用 **uv** 别用 pip——沙箱里 pip 安装被 broker 拦，`uv run` 实测 **17s** 装完全量锁死依赖（uv 在 `~/.local/bin/uv`，不在默认 PATH）。

**只借素材（推荐姿势）**：
```bash
cd /Users/lv/WorkBuddy/ISkills/deps/moneyprinterturbo
~/.local/bin/uv run python cli.py \
  --video-script "<成稿>" --video-terms "<英文关键词,逗号分隔>" \
  --video-source pexels --stop-at materials
```
- `--stop-at materials` = 只跑到素材阶段就停（另可 `--stop-at terms` 只拿「文案→搜索关键词」的中间产物）
- `--video-source` 可选：`pexels` / `pixabay` / `coverr`（免费图库）｜ `wavespeed` / `volcengine_seedance` / `ofox` / `metaso_minimax` / `muapi` / `openai_image`（AI 文生视频/图，**计费**）
- 产物在它仓库的 `storage/tasks/<task-id>/` 与 `storage/local_videos/`，**输出路径不可指定** → 搬回 `dig-media/<slug>/` 并补 manifest.json 溯源
- **AI 源计费确认机制**：未确认时 CLI 以退出码 10 返回 `XXX_CHARGE_CONFIRMATION_REQUIRED`，**必须**把成本讲给用户、拿到明确同意后加 `--confirm-<源>-charge` 重跑——与本项目「credits 事前确认」铁律同构，**不得静默加旗标**
- `--video-materials` 只收**逗号分隔的文件路径**（不收目录），配合 `--video-source local`

**零 key 冒烟**（2026-10-03 P1 实测六项全通过）：`--video-script + --video-terms + --custom-audio-file + --video-source local` 可全程不配 key 跑通整条流水线（含整片直出，1m15s）。

**key 配置**：MPT 用仓库内自己的 `config.toml`（首跑从 `config.example.toml` 自动生成），Pexels / 各 AI 源 key 填在那里；**不要把 key 写进任何会被推送的文件**。

**硬约束**：
1. **只走 CLI，永不起它的 WebUI/API 服务**——无鉴权，v1.2.x 及更早还有 6 个已知 CVE
2. **不支持并发任务**——操盘团多分支并行时排队跑
3. 它的内置曲库来自 YouTube，**别用**（版权）；BGM 一律走本 skill 的 `music` 命令
4. 本地素材喂它时横屏图会被 `cover` 裁切腰斩——**这只是素材预处理损失**；素材仍要回到我们自己的管线出片

## Ark 生图直连（Agent Plan seedream，scripts/ark_t2i.mjs）

**定位**：ai-image 协议的**第二供给源**——不走会话 ImageGen（计 credits），走用户自己的火山方舟 Agent Plan 订阅额度（AFP），单张成本更低且可关水印。2026-10-03 实测全链路可用。

**硬事实（实测，别凭记忆改）**：
1. Agent Plan 的 key 是**专属 key**，只能打 `https://ark.cn-beijing.volces.com/api/plan/v3`（OpenAI 兼容）；打普通 `/api/v3` 必 401
2. **档位矩阵**：`doubao-seedream-5-0-pro` 生图 **Small/Medium/Large/Max 全档可用**；`doubao-seedance-*` **生视频仅 Large(¥500/月)/Max(¥1000/月)**，Small/Medium 调用报 `UnsupportedModel: does not support the agent plan feature`
3. **`watermark:false` 可关「AI生成」角标**——MPT 的 openai_image 源发不出这参数，所以正式生产用本脚本
4. ⚠️ **合规红线**：官方明确文本/向量化模型不可用于 API 调用（非 AI 工具使用可能封号）；生图/生视频有专用任务路由属套餐范围
5. 计费=AFP 燃料值（1 AFP≈¥0.002），seedream 5.0 pro 官方 75~300 AFP/张；图/视频模型无 5 小时/周限额，仅日额度（=月额度一半）+月额度；**额度按月清零不累积**
6. 零费用探测法：POST 带 model 不带 content——缺 content 400=模型在套餐内；`UnsupportedModel` 404=不在

**用法**：`node scripts/ark_t2i.mjs "<中文视觉描述>" --out ./dig-media/ai-<slug> [--aspect 9:16|3:4|2:3|1:1|16:9|4:3] [--size WxH] [--style "<后缀>"]`
**⚠️ 生图前先定视频画幅，`--aspect` 让尺寸与画幅一致**（1K 档：9:16→864x1536、3:4→1152x1536、16:9→1536x864…；seedream 实测接受任意 WxH。图比例≠画幅 → 合成必出暗带或裁切损失，2026-10-03 教训）。
凭据在 `~/.iskill-dig-media.json`（`ark_plan_key/ark_plan_base_url/ark_plan_model`）。出图自动落 `<out>/` 并增量写 manifest.json。

## 注意事项

- 脚本零依赖（Node 22 内置 fetch），不需要 pip/npm 安装任何东西。
- Pixabay 限频 100 次/60 秒；脚本已带 300ms 错峰，批量别超过几百条。
- 429（限频）等一分钟重试；BAD_KEY 按配置指引重新核对。
- 未来扩展 Pexels/其他站：key 写进同一个文件（`{"pixabay":"...","pexels":"..."}`），脚本加 `--source` 参数——目前只实现了 pixabay。
- **配置解藕约定**：本 skill 系列的配置文件一律存用户主目录 `~/.iskill-*`（如 `~/.iskill-dig-media.json`、`~/.iskill-weixin-cookies.txt`），不绑死任何 agent 的工作区；旧 agent 目录里的同名文件仅作遗留兼容读取。
