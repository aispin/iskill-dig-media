window.PROMO = {
  name: "ISKILL-DIG-MEDIA",
  brand: "#8b5cf6",
  brand2: "#f59e0b",
  repo: "https://github.com/aispin/iskill-dig-media",
  repoLabel: "aispin/iskill-dig-media",
  license: "MIT",

  platform: "all",

  lang: {
    /* ── 中文 ───────────────────────────────────────────────────────── */
    zh: {
      meta: {
        title: "ISKILL-DIG-MEDIA · 缺素材时，图库 / AI / MPT 三线补给",
        description: "一条命令从 Pixabay 挖免费图库素材（可商用免署名），或用 ImageGen / VideoGen 生成镜头，也可走 MoneyPrinterTurbo 聚合 Pexels/Coverr 与 6+ 家 AI 文生视频；产物统一落 dig-media/ 并写 manifest.json 溯源。"
      },
      a11y: { skip: "跳到主要内容" },
      ui: { copy: "复制", copied: "已复制", failed: "复制失败" },
      nav: { features: "能力", shots: "截图", how: "上手", faq: "问答" },

      hero: {
        badge: "AI 技能",
        titlePre: "缺素材的时候，",
        titleAccent: "图库 / AI / MPT 三线补给",
        titlePost: "",
        sub: "一条命令从 Pixabay 挖免费图库素材（可商用免署名），或用会话内的 ImageGen / VideoGen 生成图片与镜头，也可走 MoneyPrinterTurbo 聚合 Pexels/Coverr 与 6+ 家 AI 文生视频；产物统一落 dig-media/ 并写 manifest.json 溯源，供 iskill-video-clipper 等下游直接复用。",
        ctaPrimary: "复制安装提示词",
        ctaSecondary: "看源码",
        meta1: "零依赖 Node",
        meta2: "三条供给线",
        meta3: "manifest 溯源"
      },
      chat: {
        title: "AI Agent · 对话现场",
        status: "在线",
        userLabel: "你",
        agentLabel: "AI",
        messages: [
          { role: "user", text: "给我的农场短视频找 6 条丰收素材" },
          { role: "agent", text: "先搜预览给你看标签和尺寸，确认后再下载；关键词用英文更准，图库素材免费可商用、免署名。", tag: "Pixabay 命中 42 条" },
          { role: "user", text: "再要一条 BGM" },
          { role: "agent", text: "音乐走 Wikimedia Commons 源：CC0/PD 优先，CC BY 的会把署名信息写进 manifest.json，免 key 直接下。" }
        ]
      },


      stats: [
        { value: "3", label: "脚本子命令", note: "search / get / music" },
        { value: "100/分钟", label: "Pixabay 限频", note: "脚本内置 300ms 错峰" },
        { value: "5–10", label: "ImageGen credits / 张", note: "生成前必须列清估算并获确认" },
        { value: "50–100", label: "VideoGen credits / 约 5 秒", note: "单条约 5 秒，失败重试也计费" }
      ],

      compare: {
        eyebrow: "对比",
        title: "以前 vs 现在",
        sub: "",
        before: { title: "没有这个技能", items: ["满网找素材，还得逐条核对能不能商用", "找不到合适镜头，剪辑就卡住", "用了谁的内容，事后查不回来"] },
        after: { title: "有了这个技能", items: ["一条命令搜 + 下到 dig-media/，可商用免署名", "缺镜头用 AI 补位（锚帧优先，成本事前确认）", "manifest.json 记来源 / 作者 / 许可 / credits，随时回查"] }
      },

      features: {
        eyebrow: "能力",
        title: "它能做什么",
        sub: "",
        items: [
          { icon: "camera", title: "图库挖掘", desc: "Pixabay 脚本下载，免费可商用免署名；先 search 看标签，再 get 落盘。" },
          { icon: "bolt", title: "AI 生成图片", desc: "ImageGen 出图或锚帧，约 5–10 credits/张，生成前必须确认。" },
          { icon: "monitor", title: "AI 生成视频", desc: "VideoGen 图生 / 文生视频约 5 秒，enable_audio 必关，锚帧优先保证风格一致。" },
          { icon: "layers", title: "MPT 聚合素材档", desc: "MoneyPrinterTurbo CLI 一个入口聚合 Pexels/Coverr 与 6+ 家 AI 文生视频（只借素材不借合成）；AI 源计费须事前确认。" },
          { icon: "grid", title: "统一落盘", desc: "素材落 dig-media/<关键词>/，photo / video / music 分开归档。" },
          { icon: "layers", title: "manifest 溯源", desc: "查询词、许可、作者、尺寸、credits 全部记进 manifest.json。" },
          { icon: "shield", title: "许可安全", desc: "CC0 / PD 优先，CC BY 记署名信息，NC / ND / 未知许可一律跳过。" }
        ]
      },

      showcase: {
        eyebrow: "实拍",
        title: "看一眼真东西",
        sub: "",
        items: []
      },

      steps: {
        eyebrow: "上手",
        title: "三步跑起来",
        sub: "命令由 agent 跑，你只说要什么、看结果。",
        items: [
          { title: "交给 AI 装", desc: "把这句话粘进对话框，agent 会自己拉代码、读文档，再告诉你用法。", codeKey: "install" },
          { title: "说要什么素材", desc: "关键词用英文更准；拿不准就让 agent 先搜预览再下。", codeName: "prompt", code: "给我的农场短视频找 6 条丰收的图库素材，下到 ./dig-media/" },
          { title: "翻清单挑素材", desc: "下载清单与署名信息在 manifest.json，你翻一遍挑要用的；要 BGM 就再让它挖一条。" }
        ]
      },


      faq: {
        eyebrow: "问答",
        title: "常见问题",
        items: [
          { q: "要 API key 吗？", a: "Pixabay 要，但免费。注册后在 pixabay.com/api/docs/ 能看到你的 key，写进 ~/.iskill-dig-media.json（推荐）或 export PIXABAY_API_KEY；音乐走 Wikimedia Commons，免 key。" },
          { q: "AI 生成要花钱吗？", a: "要 credits。ImageGen 约 5–10 credits/张，VideoGen 约 50–100 credits/条（约 5 秒）。任何生成动作前必须列出「镜头数 × 单价 = 估算 credits」并获得你明确确认。" },
          { q: "音乐为什么不用 Pixabay？", a: "Pixabay 官方 API 没有音乐端点，音乐页有 Cloudflare 拦截（403），FreePD 已关站。所以改用 Wikimedia Commons API（免 key、直链、许可元数据齐全）。" },
          { q: "关键词用中文行吗？", a: "建议用英文，Pixabay 英文命中率高一个量级。中文选题先翻成 2–4 个英文查询词轮询，例如「晒秋」→ autumn harvest / drying crops / rural village。" },
          { q: "素材能商用吗？", a: "Pixabay Content License 可商用免署名；但别把素材里可辨识的人物 / 品牌当自家产品代言，成品涉及广告投放时请复核平台规则。" },
          { q: "支持 Windows 吗？", a: "支持。脚本是纯 Node（Node 22 内置 fetch），已显式处理 .bat / .cmd，不需要 pip / npm 安装任何东西。" }
        ]
      },

      cta: { title: "现在就来一发", desc: "配好 key，把提示词粘给 AI，先挖一批免费素材看看。", primary: "去 GitHub 看看", secondary: "复制安装提示词" },
      footer: { license: "MIT 许可", madeWith: "由 iskill-promo-page 生成" }
    },

    /* ── English ────────────────────────────────────────────────────── */
    en: {
      meta: {
        title: "ISKILL-DIG-MEDIA · When you're short on assets, run three supply lines",
        description: "One command digs free stock from Pixabay (commercial use, no attribution), generates shots with ImageGen / VideoGen, or aggregates Pexels/Coverr and 6+ AI text-to-video providers via MoneyPrinterTurbo; everything lands in dig-media/ with a manifest.json for provenance."
      },
      a11y: { skip: "Skip to content" },
      ui: { copy: "Copy", copied: "Copied", failed: "Copy failed" },
      nav: { features: "Features", shots: "Screens", how: "Get started", faq: "FAQ" },

      hero: {
        badge: "AI skill",
        titlePre: "When you're short on assets: ",
        titleAccent: "stock, AI and MPT — three supply lines",
        titlePost: "",
        sub: "One command digs free stock from Pixabay (commercial use, no attribution), generates images and shots with the in-session ImageGen / VideoGen tools, or aggregates Pexels/Coverr and 6+ AI text-to-video providers via MoneyPrinterTurbo. Everything lands in dig-media/ with a manifest.json for provenance, ready for iskill-video-clipper and other downstream use.",
        ctaPrimary: "Copy install prompt",
        ctaSecondary: "View source",
        meta1: "Dependency-free Node",
        meta2: "Three supply lines",
        meta3: "Manifest provenance"
      },
      chat: {
        title: "AI Agent · live session",
        status: "online",
        userLabel: "You",
        agentLabel: "AI",
        messages: [
          { role: "user", text: "Find me 6 harvest clips for my farm video" },
          { role: "agent", text: "I'll search previews first so you can check tags and sizes, then download. English keywords match better, and stock clips are free for commercial use with no attribution.", tag: "42 Pixabay hits" },
          { role: "user", text: "I also need a BGM" },
          { role: "agent", text: "Music comes from Wikimedia Commons: CC0/PD first, and CC BY attribution gets written into manifest.json. No API key needed." }
        ]
      },


      stats: [
        { value: "3", label: "script subcommands", note: "search / get / music" },
        { value: "100/min", label: "Pixabay rate limit", note: "the script spaces requests by 300ms" },
        { value: "5–10", label: "ImageGen credits / image", note: "estimate must be listed and confirmed before generating" },
        { value: "50–100", label: "VideoGen credits / ~5s", note: "about 5 seconds each; retries are billed too" }
      ],

      compare: {
        eyebrow: "Comparison",
        title: "Before vs after",
        sub: "",
        before: { title: "Without it", items: ["Scouring the web for assets and checking each one's license", "No suitable shot means the edit stalls", "Afterwards you can't trace whose content you used"] },
        after: { title: "With it", items: ["One command searches and saves into dig-media/, commercial-use and no attribution", "Fill gaps with AI (anchor frame first, cost confirmed up front)", "manifest.json records source / artist / license / credits for future traceability"] }
      },

      features: {
        eyebrow: "Features",
        title: "What it does",
        sub: "",
        items: [
          { icon: "camera", title: "Stock digging", desc: "Scripted Pixabay downloads: free, commercial-use, no attribution. search to preview, get to save." },
          { icon: "bolt", title: "AI image generation", desc: "ImageGen for images or anchor frames, about 5–10 credits each, confirmed before generating." },
          { icon: "monitor", title: "AI video generation", desc: "VideoGen image-to-video or text-to-video ~5s; enable_audio must be off; anchor frames keep style consistent." },
          { icon: "layers", title: "MPT aggregated sourcing", desc: "MoneyPrinterTurbo CLI aggregates Pexels/Coverr and 6+ AI text-to-video providers in one entry (materials only, not composition); billable AI sources need up-front confirmation." },
          { icon: "grid", title: "One landing folder", desc: "Assets save to dig-media/<slug>/, with photo / video / music kept separate." },
          { icon: "layers", title: "Manifest provenance", desc: "Query, license, artist, size and credits all go into manifest.json." },
          { icon: "shield", title: "License safety", desc: "CC0 / PD first, CC BY records attribution, NC / ND / unknown are always skipped." }
        ]
      },

      showcase: {
        eyebrow: "Screens",
        title: "See the real thing",
        sub: "",
        items: []
      },

      steps: {
        eyebrow: "Get started",
        title: "Up and running in three steps",
        sub: "The agent runs the commands. You say what you want and check the result.",
        items: [
          { title: "Let your agent install it", desc: "Paste the line into the chat — it clones the repo, reads the docs, and tells you how to use it.", codeKey: "install" },
          { title: "Say what footage you need", desc: "English keywords match better. Unsure? Have it search and preview before downloading.", codeName: "prompt", code: "Find me 6 stock clips of a farm harvest for my short video and download them to ./dig-media/" },
          { title: "Pick from the manifest", desc: "Downloads and attribution land in manifest.json — skim it and choose. Need music? Ask it to dig up a BGM too." }
        ]
      },


      faq: {
        eyebrow: "FAQ",
        title: "Frequently asked",
        items: [
          { q: "Do I need an API key?", a: "Pixabay needs one, but it's free. Sign in and find your key at pixabay.com/api/docs/; save it to ~/.iskill-dig-media.json (recommended) or export PIXABAY_API_KEY. Music uses Wikimedia Commons, which is key-free." },
          { q: "Does AI generation cost money?", a: "Yes, in credits. ImageGen is about 5–10 credits per image, VideoGen about 50–100 per clip (~5s). Before any generation it must list “shots × unit price = estimated credits” and get your explicit confirmation." },
          { q: "Why not use Pixabay for music?", a: "Pixabay's official API has no music endpoint, its music pages are Cloudflare-blocked (403), and FreePD has shut down. So it uses the Wikimedia Commons API instead, which is key-free and returns license metadata." },
          { q: "Can I use Chinese keywords?", a: "Prefer English — Pixabay hits an order of magnitude more. Translate a Chinese topic into 2–4 English queries and rotate, e.g. 「晒秋」→ autumn harvest / drying crops / rural village." },
          { q: "Is the material commercial-use safe?", a: "The Pixabay Content License allows commercial use with no attribution; but don't present recognizable people or brands as endorsing your product, and review platform rules for ad campaigns." },
          { q: "Does it support Windows?", a: "Yes. The scripts are pure Node (Node 22 built-in fetch) and explicitly handle .bat / .cmd, with no pip / npm installs needed." }
        ]
      },

      cta: { title: "Give it a spin", desc: "Set up your key, paste the prompt into your agent, and dig up a free batch of assets first.", primary: "Open on GitHub", secondary: "Copy install prompt" },
      footer: { license: "MIT licensed", madeWith: "Built with iskill-promo-page" }
    }
  }
};
