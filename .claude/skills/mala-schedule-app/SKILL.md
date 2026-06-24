---
name: mala-schedule-app
description: 維護和修改「麻的🔥小辛辣」排班系統 Web App（eason0728.github.io/mala-schedule）的專用 skill。當使用者提到以下任何情境時，必須載入此 skill：修改排班 app、改班表、新增/編輯/刪除員工、調整薪資計算、加班費、津貼、固定成本（勞健保/團保/三節/年終攤提）、班別設定、國定假日、農曆做牙、自動排班、每日需求人數、外送、預估營業額/人事成本、匯出 PDF、雲端同步（Gist/啟用編輯）、debug 排班 app。即使只說「排班 app 改一下」或「班表出問題」也要載入。
---

# 麻的🔥小辛辣 排班系統

repo: `/Users/guoeason/mala-schedule/`
remote: `https://github.com/eason0728/mala-schedule.git`
主程式: `index.html`（**單一檔案**，約 2300 行，HTML + 原生 JS + 內嵌 CSS，無框架、無 build step）
部署: `git push` 到 main → 1-2 分鐘後上線到 `https://eason0728.github.io/mala-schedule`
> ⚠️ 舊路徑 `~/Desktop/AI/Claude/schedule-app/` 和舊 Gist `636d3670...` 已**廢棄，勿用**。本檔所在的 `/Users/guoeason/mala-schedule/` 才是權威工作副本。

純前端、離線可用、**執行期不消耗任何 AI/Claude token**；token 只花在開發時跟 Claude Code 對話。

## 介面結構（4 個分頁）

底部導覽：`班表` / `員工` / `薪資` / `設定`，對應 `id="page-schedule|employees|salary|settings"`。
各分頁的渲染進入點：`renderSchedule()` / `renderEmployees()` / `renderSalary()` / `renderSettings()`。

## ⚠️ 雲端同步模型（最重要、最容易出錯）

資料存在 GitHub Gist，內容是單一檔 `mala-schedule.json`（把所有 `mala_` localStorage key 包成一份 snapshot）。

- **Gist ID 寫死**：`const DEFAULT_GIST_ID='1f7ecf0be418990e24d7b2351572e4aa'`；`getGistId()` 永遠回傳它，**忽略** localStorage 裡可能殘留的舊 gistId，確保所有裝置（含曾連舊 Gist 的）匯流到同一份資料。
- **讀取免 token**：任何裝置打開連結就 `pullFromGist()` 自動拉同一份資料（公開 Gist）。
- **寫入需 token**：`pushToGist()` 需要 gist-scoped GitHub token，只存在瀏覽器 `localStorage['mala_gist_cfg']`。沒有 token 的裝置是唯讀（`scheduleGistPush()` 直接 return）。
- **🚫 token 絕不能寫進原始碼**：repo 是 public，GitHub secret scanning 會自動撤銷被 commit 的 token。啟用編輯的方式＝在設定頁貼 token，或開帶 `#gist=ID&token=TOKEN` 的連結（hash 讀完即用 `history.replaceState` 清掉）。
- **🚫 開發中不要從這端推資料到 Gist**：Gist 是正式使用中的資料，增量推送會在使用者跨裝置編輯時覆蓋班表。改 `index.html` → push GitHub Pages 沒問題（那是 app 本身）；**資料**的種子由使用者在自己有資料的裝置上按「啟用編輯」上傳。

防競態關鍵（改同步邏輯時務必保留）：
- `_suppressPush`：pull / 初始化 / 遷移時設 true，`save()` 在期間不觸發上傳，避免回音覆蓋雲端。
- `scheduleGistPush()`：本地改動後 debounce 2 秒才 push；`pullFromGist()` 若有 pending push（`_pushTimer`）就跳過，不蓋掉未上傳的本地編輯。
- `startGistPolling()`：每 30 秒 pull 一次。
- `init()`（檔尾）順序：先 `pullFromGist()` → 才補種子資料 → render，**雲端優先**，杜絕用空白/示範資料覆蓋雲端。`file://` 開啟會自動轉址到線上版（`file://` 無法連 GitHub API）。

## 資料模型（localStorage，全部以 `mala_` 開頭）

| Key | 內容 |
|---|---|
| `mala_employees` | 員工陣列。欄位：id, name, phone, hireDate, **isFullTime**(正職/計時), wage(時薪), base(月薪底薪), insurance, dormitory, leaveQuota(特休額度override), otRate(加班費 元/時), skillAllow/attendBonus/nightAllow/mgrAllow(津貼), active/termMonth(軟刪除) |
| `mala_shifts` | 自訂班別定義（覆蓋/新增於 DEFAULT_SHIFTS） |
| `mala_hidden_shifts` | 被「刪除」的班別代碼陣列（連內建班別也能隱藏） |
| `mala_sch_{y}_{m}` | 班表：`{ empId: { day: shiftCode } }` |
| `mala_hol_{y}_{m}` | 該月國定假日日期陣列；`mala_hol_ver` 是版本，bump 後強制各裝置以官方行事曆重種 |
| `mala_deliv_{y}_{m}` | 外送：`{lunch:{day:對象}, dinner:{day:對象}}` |
| `mala_notes_{y}_{m}` | 提醒列自訂備註 `{day:文字}`（換油、盤點…） |
| `mala_rev_{y}_{m}` | 預估營業額（覆蓋 DEFAULT_REVENUE） |
| `mala_settings` | 加班規則（regularHours, ot1, ot2, holRate） |
| `mala_fixedcost` | 固定成本可編輯項（見下） |
| `mala_store` | 店別名稱 |
| `mala_day_req` | 每日需求人數（DEFAULT_DAY_REQ 為預設） |
| `mala_auto_rules` | 自動排班規則（每位員工的排班偏好） |
| `mala_gist_cfg` | **寫入用 token（不進 snapshot、不同步）** |

`getSchedule/getHolidays/getDelivery/getNotes/getRevenue/getFixedCost/getDayReq/getAutoRules` 為對應 getter；寫入一律走 `save(key,val)`（自動觸發 debounced push，除非 `_suppressPush`）。

## 班別（shifts）

`DEFAULT_SHIFTS`（A/B/C/C1/C2/D/D1/E/F/H1 工作班 + 休/特/指/國 休假類），`isOff` 標記休假類。
- `getShifts()` = DEFAULT + 自訂 - 隱藏。
- `sortedShiftEntries()`：工作班依英文字母+數字排序，休假類（休→特→指→國）固定排最後。班別圖例、選班、設定都用它。
- 班別格顏色規則：工作班=無網底黑字；休假類（休/特/指/國）=淺色網底紅字；六日/國定假日整欄套淺色網底。
- 設定頁可新增/編輯/刪除班別（刪除會警示使用中格數，並加入 `mala_hidden_shifts`）。

## 薪資計算（calcSalary，最容易踩雷）

**正職（isFullTime）＝月薪制**：
- 月薪 = `base`（固定，工作未滿應出勤時數也照給）
- 加班 = 當月**平日**總工時超過 `calcRequiredHours()`（工作日×8）的部分；每小時費率 = `otRate`（有填）否則 `(base/應出勤時數)×ot1`
- 假日出勤另計；＋津貼（職能+全勤+夜間+店長，當月有上班才計）

**計時＝時薪制**：時薪×時數 + 逐日加班（前2h×ot1、超過×ot2，或 `otRate` 固定金額）+ 底薪。

`calcLeaveEntitlement()` 依到職年資算特休（勞基法級距），`leaveQuota>0` 可覆蓋；`calcLeaveUsed()` 數該年「特」班別天數。

## 固定成本（calcFixedCosts，計入 calcLaborCost → 影響班表「人事成本%」）

可編輯（存 `mala_fixedcost`，薪資頁點 ✎ 輸入）：勞保(正職)、勞保(計時)、健保、團保、負責人、團險、會計薪資(預設 7000)。
自動計算：
- **三節禮金** = `600 × 當月正職人數`，僅當月有春節/端午/中秋（用 `TW_HOLIDAY_NAMES` 名稱比對）。
- **年終獎金攤提** = 正職(底薪+全部津貼)總和 / 12，不含扣款與加班，每月都有。

## 國定假日 + 農曆

- `TW_HOLIDAY_NAMES[year][month][day]=名稱`：官方行事曆（含補假，週六→前一上班日、週日→次一上班日）。`TW_HOLIDAYS` 由名稱表自動產生日期陣列。改假日要 bump `HOLIDAY_VERSION` 才會強制各裝置重種、清掉舊的失效補假。
- 農曆：`LUNAR_INFO` 表 + `solarToLunar()`，用於提醒列自動標「初二/十六」（做牙）與三節判定。曾驗證 2026 端午6/19、中秋9/25、春節2/17 皆正確。

## 其他功能

- **自動排班**：`renderAutoScheduleModal()` + `getAutoRules()`，依每人規則 + `getDayReq()` 每日需求人數自動填班。
- **軟刪除員工**：`deleteEmployee` 設 `active=false`+`termMonth`，保留已排月份；`getEmployeesForMonth()` 控制顯示；可復職/永久刪除。
- **匯出 PDF**：`exportPDF`/`exportSalaryPDF` 走 `imageToA4()`——**用 html2canvas 截圖再放進 jsPDF**，因為 jsPDF 內建字型無法顯示中文（會亂碼）。A4 橫式滿版、`scale:3`+PNG（高清）、截圖前把 `.sticky-col` 改 `position:static`（否則 html2canvas 會把員工欄推到右邊）。摘要列放標題下方、日期上方。

## 維護注意事項

- **沒有 build / 測試框架**。驗證改動的方式：用 Node 跑無頭測試——mock `localStorage` 與 `document`（getElementById 回傳可寫 innerHTML 的物件），把 `<script>` 內容抽出、移除 `file://` 轉址與 `init()` IIFE 後 `eval`，再呼叫 `renderSchedule()`/`calcSalary()` 等檢查輸出。改完務必先這樣跑過再 push。
- 模板字串內的正則若含 `</...>`（如 `</td>`）會在 heredoc 裡誤判，測試腳本改用字串 `includes` 比對。
- **絕不 commit token**；token 只存在使用者瀏覽器 localStorage。
- 改 `index.html` → push 部署沒問題；但**不要**從開發端用 token 寫 Gist 資料。
- 之前 plugin/通用描述若與本檔不符，**以本檔為準**。

## 收尾：自我改進

請 review 我剛剛用完這個 skill 後的來回對話。把我重複糾正你的地方，整理成規則寫回 skill，讓下次同樣的錯不會再發生。
