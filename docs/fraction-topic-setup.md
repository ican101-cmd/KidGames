# 擴分、約分與通分主題

新增 fractions 主題；四個主題共用人物、裝備及金幣，但故事章節、解鎖與遠征進度分開保存。舊存檔缺少此主題時初始化為新進度，不改舊 key。JSON 匯出/匯入使用現有 MathTopics.ids，包含全部四個主題。

## 題庫與限時
- 悠閒冒險：35%擴分填空、30%約分填空、25%等值分數、10%觀念。
- 勇者試煉：30%最簡分數、25%指定分母擴分、25%最小共同分母、20%比較。
- 傳說挑戰：35%通分比較、25%先約後擴、25%同整體果汁比較、15%找錯與帶分數比較。
- 依既有規則 floor(原限時 × 1.2/1.4/1.5)，裝備加時沿用。限時7秒以下只抽小倍數一步驟換算。
- 必殺題採同難度題庫、兩選項與既有雙倍傷害/蓄力規則。
- 直式分數以 DOM + CSS 呈現，空格也保留分數位置；不依賴外部字型或套件。
- 使用整數分子/分母及交叉相乘比較，不使用浮點分數近似。通分題明確要求最小共同分母；約分題明確要求最簡分數。

## Supabase
請在 SQL Editor 再執行 backend/math-topics.sql 全文。此版放行 fractions，保留既有 arithmetic/factors/decimals 成績。尚未對線上資料庫執行。不要在此腳本後重跑舊的排行榜建立腳本。

## 測試
node tests/fraction-questions.cjs
node tests/fraction-topic.cjs
node tests/fraction-topic-database.cjs
node tests/fraction-topic-leaderboard.cjs
node tests/fraction-expedition.cjs

測試封鎖外部網路，排行榜使用模擬服務/本機資料庫，不提交真實戰績。

## 參考
參考學校公開單元練習卷之擴分、約分、通分與比較考點，重新產生題目；不直接重製考卷。
https://class.shes.tp.edu.tw/200/up_files/dl/04_%E5%9C%8B%E5%B0%8F%E6%95%B8%E5%AD%B85%E4%B8%8A%E5%9F%BA%E7%A4%8E%E8%83%BD%E5%8A%9B%E7%B7%B4%E7%BF%92%E5%8D%B7_%E7%AC%AC04%E5%96%AE%E5%85%83_%E5%AD%B8.pdf
