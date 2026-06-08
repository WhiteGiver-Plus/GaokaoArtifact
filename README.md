# 请选择你的高考遗物

本分支只保留 GitHub Pages 本地静态游戏，以及它生成前端数据所需的遗物 JSON 数据源。旧 CLI、旧 `web_game`、旧 `gh-pages` 发布目录和 Wiki/测试/调研脚本不再作为本分支主体。

## 目录

```text
.
├─ gh_pages_local_game/        # Vite 静态网页游戏
│  ├─ index.html
│  ├─ assets/
│  ├─ scripts/buildArtifactsData.ts
│  └─ src/
│     ├─ main.ts
│     ├─ artifacts.generated.ts
│     └─ core/                 # 本地游戏内置规则引擎
├─ data/artifacts.json         # 遗物数据源
├─ package.json
└─ tsconfig.json
```

## 使用

玩法与状态说明见 [`gh_pages_local_game/HELP.md`](./gh_pages_local_game/HELP.md)。

安装依赖：

```powershell
npm install
```

重新从 `data/artifacts.json` 生成前端内嵌数据：

```powershell
npm run game:data
```

本地启动：

```powershell
npm run game:dev
```

构建静态页面：

```powershell
npm run game:build
```

类型检查：

```powershell
npm run typecheck
```

## Cloudflare Pages + D1

本分支使用 Cloudflare Pages 托管静态前端，使用 Pages Functions 提供同源 `/api` 后端，D1 数据库名为 `gaokao-artifact-stats`，Pages 项目名为 `gaokao-artifact`。D1 为空库上线，不导入旧 Supabase 数据；旧 Supabase migration 保留在 `supabase/migrations/` 作为 legacy 记录。

本地初始化 D1：

```powershell
npm run cf:d1:local
```

本地构建并启动 Cloudflare Pages Functions：

```powershell
npm run cf:dev
```

上线前先创建远端 D1，并把 Cloudflare 返回的 `database_id` 写入 `wrangler.jsonc`：

```powershell
npx wrangler login
npx wrangler d1 create gaokao-artifact-stats
npm run cf:d1:remote
npm run cf:deploy
```

生产环境建议在 Cloudflare Pages 项目设置中配置 `LEADERBOARD_SALT`。`EVENT_RAW_SAMPLE_RATE` 可选，默认 `0.1`，事件数据优先写入日聚合表，少量 raw payload 仅用于排查。

常用查数命令：

```powershell
npx wrangler d1 execute gaokao-artifact-stats --remote --command "select created_at, nickname, contact, message, seed from feedback order by created_at desc limit 20;"
npx wrangler d1 execute gaokao-artifact-stats --remote --command "select nickname, score, year, seed, created_at from leaderboard_entries order by year desc, score desc, created_at asc limit 20;"
npx wrangler d1 execute gaokao-artifact-stats --remote --command "select day, event_name, page_path, app_commit, count from analytics_event_counts order by day desc, count desc limit 50;"
npx wrangler d1 execute gaokao-artifact-stats --remote --command "select share_code, player_name, rank, created_at from share_reports order by created_at desc limit 20;"
```

也可以在 Cloudflare Dashboard 的 D1 控制台直接查看 `feedback`、`leaderboard_entries`、`analytics_event_counts`、`share_reports` 等表。
