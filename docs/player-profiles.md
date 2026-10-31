# 同機雙冒險者

## 使用方式
角色選擇與首頁都有目前冒險者按鈕。開啟後可設定冒險者一/二的2～12字遊戲暱稱，以及男孩/女孩/史萊姆/巨龍頭像。使用另一位時先儲存目前遊戲，切換後重新載入至角色選擇，避免非同步請求混寫。

每人各有金幣、裝備、背景、性別、四主題進度、Boss解鎖、遠征進度/寶箱收據/獎勵收據、網路紀錄同意、匿名登入、待提交成績與暱稱。頭像是個人識別，可獨立於戰鬥角色選擇。

## 相容性
- 玩家一保留所有舊 localStorage key與原匿名session，不搬動、不刪除原紀錄。第一次建立資料時沿用舊排行榜暱稱。
- 玩家二使用 kidgames_player_p2:: 前綴。PlayerStorage 在每個頁面載入時固定玩家，其他分頁切換或延遲請求仍寫回原玩家。
- 共用設定只有 kidgames_players_v1（兩人暱稱/頭像及下次載入身分）。枚舉、清除與寶箱恢復只作用於當前命名空間。
- 匯出目前冒險者遊戲與暱稱/頭像，不包含登入token。匯入只覆蓋目前冒險者，不移轉雲端身分；匯入遠征會移除舊網路ticket資格。支援舊JSON。
- 重置只清目前冒險者遊戲進度，不影響另一位或清除匿名排行榜身分。

## 排行榜
自動使用目前冒險者暱稱/頭像，移除排行榜暱稱輸入欄。每人獨立匿名使用者，因此個人最佳不互相覆蓋。kg_player_profiles 以auth.uid為擁有者，新版讀榜即時合併個人暱稱/頭像，改名不用重刷成績。原有score/ticket/排序規則不變。

backend/player-profiles.sql 在既有 math-topics.sql 後執行，新增RLS保護的個人顯示資料表與限定authenticated的三個RPC。不改或刪舊成績與舊RPC。SQL可重複執行。未升級資料庫時新版會保留舊讀榜與暱稱提交，明確提示頭像需要SQL更新；非404連線錯誤不誤當成舊版。

本次已於2026-10-31在專案 zoqygcineggnqqdaqoqa 的SQL Editor執行，確認Success.No rows returned。

## 驗證
- player-profile-storage.cjs：舊key沿用、命名空間、兩分頁/延遲寫入、枚舉/重置隔離。
- player-profiles-browser.cjs：舊P1進度/裝備/登入承接、P2初始狀態、兩人往返、性別/主題/遠征/收據/同意/登入/重置隔離、各自自動提交暱稱頭像、舊SQL回退、匯出不帶token、舊匯入不影響另一人、五種版面。
- player-profiles-database.cjs：本機PGlite重複migration、舊成績保留、兩個owner、改名換頭像不重設分數、偽造owner/未登入/原表存取禁止。
- leaderboard.cjs、topic-ultimate-browser.cjs、factor-exam-expedition.cjs、topic-switch-return.cjs回歸。
- 本機網路測試使用模擬服務，不提交真實排行榜。
