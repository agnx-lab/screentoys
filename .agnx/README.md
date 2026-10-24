# Screen Toys 胶水说明

## 结构

- `dist/index.js` — 子应用入口（打包产物，必须入库）
- `dist/agnx-host-bridge.js` — 注入到每个游戏页的宿主桥（导航同步，禁止弹新窗）
- `assets/icon.png` — 图标
- `manifest.json` / `config.json` — 身份与上游出处

## game/ 资源从哪来

本子应用嵌入上游 `shapiro500/screentoys` 的静态游戏合集（`poms` / `roadtrip` /
`firewood` / `chess2` / `splitshift` / `bones` 等）。**这些资源不在本仓入库**，
因为它们是上游源码本身，重复入库会让仓库凭空多出 56 MB，且上游一更新就漂移。

上游仓克隆下来后，把需要暴露的静态目录整理到 `game/`，再执行构建：

```bash
git clone --filter=blob:none https://github.com/shapiro500/screentoys.git
npm run build        # 生成 dist/index.js 与 dist/game/
```

`dist/game/` 由构建脚本从 `game/` 复制而来，`dist/game` 属于产物，同样不入库。
