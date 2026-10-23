# KidGames

水果王國大冒險：純靜態 HTML / CSS / JavaScript，支援 GitHub Pages。

原始專案：[tonygg0603-sys/KidGames](https://github.com/tonygg0603-sys/KidGames)。
此 Fork 加入原創 RPG 美術、六種武器動畫與命中同步效果，保留原遊戲數值與存檔格式。

## 本機執行

用任一靜態 HTTP server 在 repository 根目錄啟動，開啟 index.html。
不需要 npm install 或 build，所有執行期素材均為專案內 SVG / CSS。

## 回歸測試

安裝 Playwright 後執行 `node tests/regression.cjs`。
可用環境變數 PLAYWRIGHT_MODULE 指定模組位置，TEST_BROWSER 指定
`msedge`（預設）或 `chrome`。測試會自行啟動 localhost server，使用獨立
瀏覽器存檔，結果輸出到 tests/results.json，截圖不納入版本控制。

架構、存檔相容性與限制請參考 [docs/architecture.md](docs/architecture.md)。

## 第二輪插畫美術

新增原創手繪男女勇者、暮星巨龍、水果史萊姆、花朵精靈與深海小魚。
五關場景依序為王國草原、古木森林、碧海遺跡、夕照峽谷、星月龍堡；
原商店背景主題與倍率仍保留。11 張 WebP 圖片均位於 assets/art/。

素材規格與繪圖提示見 [docs/art-direction.md](docs/art-direction.md)。

## 冒險成長系統
五關敵人動作特徵、
巨龍半血覺醒，以及分難度的地圖解鎖與三枚通關星章。
原武器傷害、敵人傷害、血量與獎勵倍率維持既有設定。
新增獨立 fruit_adventure_v1 儲存地圖；原 14 個存檔鍵保持不變，
JSON 匯出／匯入支援新進度及舊版檔案。詳見 docs/adventure-progression.md。
新增驗證：node tests/adventure.cjs；裝備及音效測試分別執行
node tests/armor.cjs 和 node tests/audio.cjs。

## 覺醒流星雨
巨龍第二階段每三秒發射一波流星，右上往左下快速落下，整波命中扣 6 HP。
答題與攻擊期間均會持續，死亡、重試、離場及 Boss 倒下會停止。
支援降低動態效果。測試：node tests/meteors.cjs，細節見 docs/boss-meteors.md。

## 各難度專屬 Boss
普通第 5 關為蘋果布丁王，中等第 5 關為蒼潮甲龜；魔王難度保留覺醒巨龍。
勇氣蓄力及連答必殺已移除，星章改採通關、正確率 80%、全題答對。
素材與提示詞：docs/difficulty-bosses.md；測試：node tests/difficulty-bosses.cjs。

## 關卡 Boss 絕技
普通 Boss 半血後每 5 秒蓄力，預警 0.8 秒後發射兩次彈跳的皇家果凍彈，
命中扣 3 HP。中等 Boss 半血後每 4 秒蓄力，預警 1 秒後發出雙重潮汐，
兩道水浪相隔 0.4 秒命中，各扣 3 HP。兩者保留 7 秒作答時間及原答錯反擊，
特殊攻擊不影響答題正確率。死亡、通關、重試與離場會清除預警及飛行中的攻擊。
詳見 docs/chapter-boss-specials.md；測試：node tests/boss-specials.cjs。

## 手動必殺技
戰鬥底部新增必殺技按鈕，立即換成三數連加、兩個答案；答對造成目前武器兩倍傷害，
並保留武器動作加上能量斬、粒子、大字傷害與短促震動。保留剩餘倒數時間，
必殺題作答前不可重按洗題，答錯及超時照原反擊。無勇氣條、無額外存檔欄位。
詳見 docs/manual-ultimate.md；測試：node tests/ultimate.cjs。

## 各武器必殺特效
木劍烈焰、鐵劍電光、魔杖星環洪流、銀槍雷霆突刺、黃金弓烈陽箭、鑽石劍極光殘影。
特效資料在 weapons[].animation.ultimate，呈現由 js/ultimate-vfx.js 管理；
傷害、作答與存檔規則保持不變。詳見 docs/weapon-ultimate-vfx.md，
測試：node tests/weapon-ultimate-vfx.cjs。

## 手繪冒險遠征
通關巨龍後，從主選單進入七站手繪世界地圖；包含岔路、精英、營火、臨時能力與進度續玩。詳見 docs/expedition-implementation.md。

遠征普通戰鬥站連續三波，主角 HP 不重置，清完整站才給能力；菁英及終點 Boss 為單隻、HP ×1.5。

## 遠征網路排行榜（待設定後端）
第一版支援匿名暱稱、六個分榜及每人最佳成績。先依 docs/leaderboard-setup.md 建立 Supabase、執行 backend/leaderboard.sql，再填 js/leaderboard-config.js。空白設定保持離線遊戲可玩，不代表排行榜已上線。


## 繪本式序章
四段王國故事搭配原創場景與角色美術，支援翻頁、暫停、跳過與減少動態；最後由玩家按出發進入角色選擇。詳見 docs/storybook-prologue.md。

