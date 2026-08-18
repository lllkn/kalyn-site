# Kalyn Site

鲁凯宁（Kalyn）的个人网站 — 纯前端静态版本。

## 内容

- `index.html` — 个人主页（作品、生活、联系）
- `preview.html` — 预览页
- `site/` — 静态资源（CSS / JS / 图片 / Spine 动画 / 字体）

## 本地预览

```bash
cd static-preview  # 或本目录
python3 -m http.server 8765
```

然后访问 http://localhost:8765/

## 说明

- 纯前端静态页面，无后端依赖（引用 CDN 资源除外）
- 项目卡片区为 3D coverflow 轮播：点击卡片直接放大预览；带链接的卡片先滑到中间再打开新窗口
- 中英文双语切换（`data-zh` / `data-en`，localStorage 记忆）
