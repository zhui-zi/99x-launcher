# 99x launcher

A lightweight, WinUI 3 & Fluent 2 desktop community server launcher for Counter-Strike 2 (CS2), supporting EXG, ZED, FYS, and custom servers.

## Features

- **WinUI 3 & Fluent 2 UI**: Automatic system light/dark theme adaptation, Windows 11 Mica/layer surfaces, NavigationView sidebar, and native-style caption controls.
- **Multi-Community Server Browser**: Instant switching between **EXG**, **ZED**, and **FYS** communities with per-community caching, background pre-fetching, and custom server management via UDP `A2S_INFO` / `A2S_PLAYERS`.
- **Auto-Refresh & Grouping**: 3-second default auto-refresh, collapsible mode groups, player count / ping / map difficulty sorting, and card/table view modes.
- **Auto-Join Queue**: Configurable UDP `A2S_INFO` slot polling (1500ms default) with crisp chime audio alert, desktop notification, and automatic Steam connection.
- **Map Change Monitor**: Per-server and keyword-based map change tracking with Windows desktop notifications.
- **CS2 CFG Studio**: Direct `autoexec.cfg` editor with EXG community command presets (`!bizon`, `!p90`, `!negev`, `!he`, `!hide`, `!ztele`, `!tp`, `!rtv`, `!nominate`, etc.) and automatic `.bak` backup.
- **Workshop Map Cleaner**: Scans Steam Workshop (`730`) and local community maps, resolves real Workshop titles via Steam Web API, and safely moves selected maps to the Recycle Bin.
- **Analytics & System Tray**: EXG 24h online trends, per-server sampled history, personal map playtime stats, and minimize/close-to-tray background operation.

## Tech Stack

- Electron 33 + TypeScript + esbuild
- React 18 + Vite 5 + Tailwind CSS 3 + Recharts + Lucide Icons
- Native Node `dgram` Valve Source Engine A2S UDP queries

## Development

```bash
npm install
npm run dev
```

## Build Portable EXE

```bash
npm run pack:exe
```

Outputs a single self-contained portable executable to `release/99x-launcher.exe`.
