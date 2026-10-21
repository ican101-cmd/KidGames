# KidGames

水果王國大冒險：純靜態 HTML / CSS / JavaScript，支援 GitHub Pages。

## 本機執行

用任一靜態 HTTP server 在 repository 根目錄啟動，開啟 index.html。
不需要 npm install 或 build，所有執行期素材均為專案內 SVG / CSS。

## 回歸測試

安裝 Playwright 後執行 `node tests/regression.cjs`。
可用環境變數 PLAYWRIGHT_MODULE 指定模組位置，TEST_BROWSER 指定
`msedge`（預設）或 `chrome`。測試會自行啟動 localhost server，使用獨立
瀏覽器存檔，結果輸出到 tests/results.json，截圖不納入版本控制。

架構、存檔相容性與限制請參考 [docs/architecture.md](docs/architecture.md)。
