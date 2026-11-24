# 99x launcher

[English](#english) | [简体中文](#简体中文)

---

## English

A lightweight **WinUI 3 & Fluent 2** desktop community server launcher for **Counter-Strike 2 (CS2)**, supporting **EXG**, **ZED**, **FYS**, and custom servers.

### Features

- **WinUI 3 & Fluent 2 Design**: Automatic system light/dark theme adaptation, Windows 11 Mica/layer surfaces, NavigationView sidebar, and native-style caption controls.
- **Multi-Community Server Browser**: Instant switching between **EXG**, **ZED**, and **FYS** communities with per-community caching, startup pre-fetching, and custom server management via UDP `A2S_INFO` / `A2S_PLAYERS`.
- **Auto-Refresh & Grouping**: 3-second default auto-refresh, collapsible mode groups, player count / ping / map difficulty sorting, and card/table view modes.
- **Multi-Server Auto-Join Queue**: Queue multiple servers simultaneously with configurable UDP `A2S_INFO` polling (500ms default); automatically connects to the first server with an open slot, plays a crisp chime, sends a desktop notification, and stops remaining queues.
- **Map Change Monitor**: Per-server and keyword-based map change tracking with Windows desktop notifications.
- **CS2 CFG Studio**: Direct `autoexec.cfg` editor with EXG community command presets (`!bizon`, `!p90`, `!negev`, `!he`, `!hide`, `!ztele`, `!tp`, `!rtv`, `!nominate`, etc.) and automatic `.bak` backup.
- **Workshop Map Cleaner**: Scans Steam Workshop (`730`) and local community maps, resolves real Workshop titles via Steam Web API, and safely moves selected maps to the Recycle Bin.
- **Analytics & System Tray**: EXG 24h online trends, per-server sampled history, personal map playtime stats, and minimize/close-to-tray background operation.

### Download

Download the standalone portable `99x-launcher.exe` from [GitHub Releases](https://github.com/zhui-zi/99x-launcher/releases).

### Tech Stack

- Electron 33 + TypeScript + esbuild
- React 18 + Vite 5 + Tailwind CSS 3 + Recharts + Lucide Icons
- Native Node `dgram` Valve Source Engine A2S UDP queries

### Build from Source

```bash
npm install
npm run dev        # Development mode
npm run pack:exe   # Build single portable release/99x-launcher.exe
```

### License

Licensed under the [MIT License](LICENSE).

---

## 简体中文

一款基于 **WinUI 3 与 Fluent 2 设计语言** 的轻量化 **CS2 社区服桌面登录器**，支持 **EXG**、**ZED（僵尸乐园）**、**FYS（风云社）** 及自定义服务器。

### 核心功能

- **WinUI 3 & Fluent 2 视觉风格**：支持跟随 Windows 系统自动切换深浅色主题，原生风格标题栏、Mica 层次卡片与左侧 NavigationView 导航栏。
- **三社区瞬间切换**：原生支持 **EXG / ZED / FYS** 三大社区，内置分社区缓存与启动预加载，零延迟切换；同时支持自由添加自定义服务器（直接粘贴 `IP:端口` 或 `connect` 指令即可自动 A2S 探测）。
- **3 秒自动刷新与分组排序**：默认每 3 秒自动刷新在线人数、地图与 UDP 延迟，支持按玩法分组折叠、人数/延迟/地图难度排序、卡片与列表双视图切换。
- **多服并发自动挤服与提示音**：支持**同时挤多个服务器**（默认 500ms 轮询），任意一个服务器出现空位立即播放清脆提示音、弹出桌面通知、自动拉起 Steam 进服并自动停止其余挤服队列。
- **换图监控与提醒**：支持对指定服务器或全服地图关键词（如 `ze_ffxiv`、中文译名）进行换图监控，换图时立即发送 Windows 桌面通知。
- **CFG 配置与 EXG 指令绑定**：直接读写 CS2 `autoexec.cfg`（首次修改自动备份 `.bak`），内置 EXG 快捷买枪（`!bizon` / `!p90` / `!negev` / `!he` / `!kevlar` / `!ammo`）与 ZE 核心指令（`!hide` / `!ztele` / `!tp` / `!rtv` / `!nominate` / `!stopsound`）一键自定义按键绑定。
- **地图文件清理**：扫描 Steam 创意工坊（`730`）及本地社区地图，调用 Steam 官方接口自动解析真实地图名与中文译名，支持按体积/时间筛选并一键安全移至回收站。
- **数据统计与系统托盘**：展示 EXG 24 小时在线趋势、单服实时采样历史曲线与个人地图游玩统计；支持关闭/最小化到系统托盘，后台持续运行换图监控与自动挤服。

### 下载使用

前往 [GitHub Releases](https://github.com/zhui-zi/99x-launcher/releases) 下载单文件便携版 `99x-launcher.exe`，免安装双击即用。

### 本地开发与打包

```bash
npm install
npm run dev        # 启动开发热更新
npm run pack:exe   # 打包单文件便携版 release/99x-launcher.exe
```
