# 遠征網路排行榜：安裝與限制

## 本版提供的功能
主選單「遠征排行榜」、匿名身分、暱稱提交、初階／中階／進階 × 安全／寶箱六個榜、每位玩家每榜最佳紀錄、前 50 名。
排序：通關時間升冪 → 正確率降冪 → 剩餘 HP 降冪 → 達成日期升冪。
第一版僅歷史榜，無週榜、聊天或跨裝置帳號綁定。

目前設定檔為空，畫面會明確顯示尚未啟用；這不是已部署的線上排行榜。

## 建立 Supabase（只需一次）
1. 前往 https://supabase.com/dashboard 建立帳號及新專案。專案名稱可用 KidGames。資料庫密碼自行保管，不需貼給 Codex 或放進遊戲。
2. 等專案建立完成，進入 SQL Editor → New query。
3. 將 `backend/leaderboard.sql` 全文貼上並執行。它建立兩張資料表、索引及四個受限 RPC 函式。不要另開資料表公開讀寫政策。
4. 進入 Authentication 的登入設定，開啟 Anonymous Sign-Ins（匿名登入）。儀表板標籤可能隨版本調整。
5. 到專案連線／API 設定取得 Project URL 與 **Publishable key**（或舊式 anon key）。不要使用 secret key、service_role、資料庫密碼。
6. 修改 `js/leaderboard-config.js` 的 `url` 與 `publicKey`。URL 格式為 `https://專案代號.supabase.co`。本版使用 Supabase 標準網域，未支援自訂網域。
7. 把完整遊戲檔案上傳至 GitHub 分支，建立並合併 PR；等待 Pages 成功。
8. 開啟正式遊戲 → 排行榜 → 勾選「為新遠征啟用網路紀錄」。再開始**新遠征**，完成後輸入暱稱提交。啟用前的舊遠征不能補登排名。
9. 以第二個瀏覽器檢查同一個分榜是否讀得到第一個玩家的成績，再確認較差紀錄不會覆蓋個人最佳。此步完成後才可宣告正式上線。

設定空白不會發出 Supabase 請求，也不需要額外前端套件／建置工具；相對資源路徑相容 GitHub Pages。

## 計時與離線行為
- 出發時由後端建立匿名身分所屬的 run ticket，後端紀錄開始時間。
- 通關時呼叫 finish，後端固定結束時間。計時包含戰鬥、事件選擇、返回選單及切換頁面。
- 開始時無法連線仍可玩，但不具本趟排行榜資格。登入初始化有網路延遲，第一版不適合作為正式競速賽。
- 通關時無法同步，會保存最近一次通關紀錄；稍後按提交會重試同步。後端尚未接到 finish 的斷線時間也計入總時間，可能使名次較差。
- 手動按提交後才發布暱稱及戰績；未主動提交的紀錄不出現在公開榜。
- 金幣仍按初階 250／中階 300／進階 400 發放，網路錯誤不影響金幣或離線進度。
- 只保留最近一次本機通關的待提交資料。開始並完成下一趟會取代前一筆，請先提交想保留的成績。

## 身分與隱私
匿名登入不要求真名、電話或電子郵件。玩家使用 2～12 字的中文、英文字母、數字、空格、底線或連字號暱稱。這不是實名去重：同一瀏覽器視為同一位玩家；換裝置、換瀏覽器或清除網站資料可能建立新身分。
公開 RPC 只回傳暱稱、武器、時間、正確率、HP、日期，不回傳使用者 UUID、ticket 或權杖。
權杖及更新權杖留在此瀏覽器 `kidgames_online_session_v1`，不含在遊戲匯出存檔。
原有 `fruit_*` key 不改名。新增遠征 stats 及 online ticket 隨遠征檢查點保存；舊遠征沒有 ticket 時維持可玩但不排名。清除遊戲存檔不會自動刪除已發布的排行榜紀錄；管理者可在 Supabase 刪除指定使用者的 scores／匿名帳號。

## 權限及防作弊界線
- 兩張表啟用 RLS，撤銷 anon／authenticated 直接表存取；瀏覽器只能呼叫指定 RPC。
- 修改函式檢查 auth.uid()、ticket 擁有者並鎖定該列，防止跨帳號提交及重複寫入。
- 後端驗證題數／正確數／HP 範圍、最短與最長時間；開始次數限制每帳號每小時 30 次。
- elapsed time 由後端決定；不信任瀏覽器提供的通關時間。完成後的結果不可用另一組統計覆寫。
- **仍是基礎檢核社群榜**：前端戰鬥及答題彙總仍可被修改，沒有逐題由後端出題驗證，也沒有裝備固定、Boss 分榜、強力防機器人或跨裝置單一真人驗證。不能宣稱防作弊競技榜。
- 若將來面向大量公開玩家，需補 CAPTCHA 對接／濫用防護、逐題驗證、檢舉及管理流程。不要直接在 Supabase 強制開 CAPTCHA 卻不修改此前端，否則匿名登入會失敗。
- 維運可定期刪除超過 7 天的 kg_runs；scores 獨立保留。匿名帳號及請求可能消耗服務額度，請由專案擁有者查看方案與用量。

## 本機測試（非真實 Supabase 部署）
- `node tests/leaderboard.cjs`：Playwright 攔截網路 API，測試未設定、匿名登入、ticket、真實答題計數、通關／提交、防重複點擊、惡意文字安全呈現、斷線、五種畫面寬度。
- `node tests/leaderboard-database.cjs`：使用 PGlite 的 PostgreSQL 執行實際 SQL，驗證表存取限制、擁有者、時長及數值驗證、中文暱稱、重複提交、只更新較佳成績、分榜及匿名拒絕。
  測試依賴可在外部資料夾安裝 `@electric-sql/pglite`，並將 `PGLITE_PATH` 指向其模組。此工作環境放在 `C:/Users/USER/.codex/leaderboard-test-runtime/package/dist/index.cjs`。不用將測試資料庫或模組上傳 GitHub Pages。
- 原有 regression、expedition、expedition-waves、expedition-rewards 套件保留。
- 尚未建立 Supabase 專案，未進行真實跨玩家網路測試，未部署 Pages。

官方參考：
- https://supabase.com/docs/guides/auth/auth-anonymous
- https://supabase.com/docs/guides/database/functions
- https://supabase.com/docs/guides/database/postgres/row-level-security
