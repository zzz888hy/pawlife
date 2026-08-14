# PawLife 宠物数字生命空间

一个基于 **Taro + React + TypeScript** 的微信小程序（同时支持 H5），为宠物建立数字生命空间：大厅、宠物馆、集市、AI 助手、星光纪念馆等模块。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Taro 4.2.1（多端：微信小程序 weapp / H5） |
| UI | React 18 + TypeScript |
| 样式 | Sass（SCSS） |
| 状态管理 | zustand |
| 构建 | Webpack 5 |
| 后端 | 微信云开发（当前用 Mock 数据，无需后端即可运行） |

## 目录结构

```
pawlife-taro/
├── src/                      # 源码
│   ├── app.config.ts         # 全局配置（页面路由、tabBar、分包）
│   ├── app.tsx               # 应用入口
│   ├── pages/                # 页面（5 个 tab 页 + 13 个分包子页面）
│   ├── custom-tab-bar/       # 小程序自定义 tabBar（emoji + 中间发布按钮）
│   ├── components/           # 通用组件
│   ├── stores/               # zustand 状态管理（7 个 store）
│   ├── services/             # 服务层（cloud 云函数封装 / mock 数据 / request）
│   ├── types/                # TypeScript 类型定义
│   ├── hooks/                # 自定义 hooks
│   └── utils/                # 工具函数
├── cloudfunctions/           # 微信云函数（login / feed / pet / order 等）
├── config/                   # Taro 构建配置
├── dist/                     # 编译产物（不提交到 git，构建时生成）
├── project.config.json       # 微信开发者工具项目配置（AppID 等）
└── package.json              # 依赖与脚本
```

## 环境要求

- **Node.js** ≥ 18（建议 LTS 最新版）
- **npm**（随 Node.js 一起安装）
- **微信开发者工具**（运行小程序）
- **Git**（版本控制与协作）

## 新电脑搭建步骤

> 代码靠 `git clone` 获取；环境（Node、依赖、工具）需要重新安装一遍。

### 1. 克隆代码

```bash
git clone https://github.com/zzz888hy/pawlife.git
cd pawlife
```

### 2. 安装 Node.js

Windows 用 winget：

```powershell
winget install OpenJS.NodeJS.LTS
```

安装后**新开一个终端**让 PATH 生效，验证：

```bash
node -v
npm -v
```

### 3. 安装依赖

```bash
npm install
```

> 这一步会按 `package.json` 重新生成 `node_modules/`（该目录已通过 `.gitignore` 排除、不随仓库提交）。

### 4. 构建微信小程序

```bash
npm run build:weapp
```

编译产物输出到 `dist/` 目录。

### 5. 用微信开发者工具导入

1. 打开微信开发者工具 → 「导入项目」
2. 目录选择本项目的**根目录**（含 `project.config.json`）
3. AppID 填 `wxf15929f41c49a0ac`（或你自己的小程序 AppID）
4. 确认后即可在模拟器预览

## 开发命令

| 命令 | 说明 |
| --- | --- |
| `npm run build:weapp` | 构建微信小程序 |
| `npm run build:h5` | 构建 H5 |
| `npm run dev:weapp` | 小程序监听模式（改动自动重新构建） |
| `npm run dev:h5` | H5 监听模式 |

> 修改 `project.config.json` 里的 `appid` 即可切换成你自己的小程序 AppID。

## 关于数据（Mock vs 云开发）

项目默认使用 **Mock 数据**，无需后端即可完整运行和预览：

- 开关在 `src/services/mock/index.ts`：`MOCK_ENABLED = true`
- 想接入真实云开发时：
  1. 开通微信云开发，拿到环境 ID
  2. 把 `src/services/cloud.ts` 里的 `your-env-id` 替换成真实环境 ID
  3. 部署 `cloudfunctions/` 下的云函数
  4. 把 `MOCK_ENABLED` 改为 `false`

## 版本管理（日常 git 流程）

```bash
git add -A                        # 1. 加入所有改动
git commit -m "说明本次改动"        # 2. 提交本地存档
git push                          # 3. 推送到 GitHub
```

提交说明建议用清晰的动词开头，例如 `fix:`（修 bug）、`feat:`（新功能）、`chore:`（杂项）。
