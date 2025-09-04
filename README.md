# 复古贪吃蛇（可调速度）

一个纯前端、复古像素风的贪吃蛇小游戏。支持调节蛇移动速度，支持键盘与触摸操作，自动记录最高分（localStorage）。

## 运行方式

- 直接双击打开 `index.html` 即可在浏览器游玩。
- 或使用任意本地静态服务器（如 VS Code 的 Live Server、`python -m http.server` 等）。

## 操作说明

- 方向：方向键 或 WASD
- 开始/暂停：空格键（或点击“开始/暂停”按钮）
- 重置：点击“重置”按钮
- 速度调节：右侧滑块，向右更快（默认中速）

## 文件结构

- `index.html`：页面结构与控制面板
- `styles.css`：复古像素风样式
- `script.js`：游戏逻辑（画布渲染、碰撞检测、速度调节等）

## 自定义

如需修改网格大小或像素风样式，可在 `script.js` 顶部调整：

```js
// 网格参数（逻辑像素）
const COLS = 24;
const ROWS = 24;
const CELL = 24; // 每格像素大小
```

速度映射也可自行修改：

```js
function speedToMs(val) {
  // 1 → 260ms，10 → 60ms
}
```

## 兼容性

- 现代浏览器（Chrome/Edge/Firefox/Safari）均可运行。
- 最高分使用 `localStorage` 存储，清除浏览器数据会重置记录。

## 截图

打开 `index.html` 即可预览复古墨绿像素风界面与滑块控制。

