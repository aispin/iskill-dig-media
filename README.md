# iskill-dig-media

当用户要给视频/文案配素材、问「找些农场素材」「搜配图」「下几条视频素材」，需要 AI 生成图片/视频素材（「AI 生成一个镜头」「生成空镜视频」），要聚合多源图库/AI 文生视频（MoneyPrinterTurbo / MPT / Pexels / Seedance），或 iskill-video-clipper 缺素材/AIGC 模式需要补料时使用。触发词：找素材、搜素材、dig media、素材站、pixabay、pexels、AI 生成素材、moneyprinterturbo。四种供给：①Pixabay 图库（脚本化、免费、可商用免署名）；②AI 生成图片（ImageGen，5-10 credits/张）；③AI 生成视频（VideoGen，约 50-100 credits/5 秒）；④MPT 聚合素材档（MoneyPrinterTurbo CLI，聚合 Pexels/Coverr + 6+ 家 AI 文生视频，只借素材不借合成）。产物统一落 {工作区}/dig-media/ 并写 manifest.json 溯源。

完整用法见 [SKILL.md](SKILL.md)。

> 依赖同步：本仓库含 iskill 共享真源的 vendored 副本（清单见 `package.json` 的 `iskillDeps`），**不要手改**。使用前请同时安装 iskill-dep-sync：对 agent 说「请帮我安装 Skill：aispin/iskill-dep-sync」；用法见 SKILL.md「依赖同步」节。
