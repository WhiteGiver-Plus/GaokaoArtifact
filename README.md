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
