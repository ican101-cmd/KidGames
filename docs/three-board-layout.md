# 三種難度排行榜同頁呈現

保留測驗主題選單，移除難度選單。悠閒冒險、勇者試煉、傳說挑戰各自顯示獨立榜卡，預設前三名；有更多成績時可展開/收起。手機單欄，740px起三欄。

每次更新使用既有 kg_read_board 或 kg_read_topic_board，並行查詢三種難度。共用匿名登入請求、各榜獨立錯誤與空榜提示、requestVersion 避免較慢的舊主題覆蓋新主題。原有成績登錄和提交規則維持。

這次 UI 更新無需修改 Supabase schema。若尚未安裝小數與分數主題，仍須完成 backend/math-topics.sql 的四主題升級。

驗證：node tests/three-board-layout.cjs、node tests/three-board-loading.cjs、node tests/leaderboard.cjs、node tests/math-topic-leaderboard.cjs、node tests/decimal-topic-leaderboard.cjs。測試使用模擬網路，不提交真實排行榜。涵蓋主題/難度路由、資格及提交、重複防護、空榜、更多名次、部分失敗/重試、過期回應、375/390/430/768/1280px。
