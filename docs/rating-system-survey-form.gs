/**
 * 麻的🔥小辛辣｜評分制度意見調查（v2）— 自動建表腳本
 *
 * 用法：
 *   1. 到 https://script.google.com → 新增專案
 *   2. 貼上這整份程式，存檔
 *   3. 上方函式選 buildRatingSurvey → 執行（第一次會要你授權自己的 Google 帳號）
 *   4. 執行完成後看「執行紀錄 / Log」，會印出兩個網址：
 *        - 測試/填寫連結（發給同仁、也可自己先試填）
 *        - 編輯連結（要改題目就開這個）
 *
 * v2 特性：
 *   - 無個人背景題（不問身分/年資），強化匿名
 *   - 封閉題全部 1–5（線性刻度或 1–5 單選方格）
 *   - 開放題集中在最後 4 題（皆選填）
 *   - 填寫體驗改為中立、非負面引導
 *   - 報酬連動＝計時時薪 + 正職每季分紅（來自每季盈餘）
 *   - 反向題（同意＝負面）僅在註解標示，表單上不顯示
 */
function buildRatingSurvey() {
  var AGREE = ['非常不同意', '不同意', '普通', '同意', '非常同意'];

  var form = FormApp.create('麻的🔥小辛辣｜評分制度意見調查（匿名）');
  form.setDescription(
    '這套「互評打分、分數會連動報酬」的制度上線一段時間了。這份問卷想聽你真實的想法——哪裡好用、哪裡卡、哪裡覺得不公平，都請照實說。\n\n' +
    '・這套分數會影響計時同仁的時薪，以及正職每季的分紅（來自每季盈餘）。\n' +
    '・完全匿名，不問名字、不記錄是誰填的。\n' +
    '・大約 5 分鐘，最後幾題開放意見都可以留空。\n' +
    '・回答只會用來改制度，不會拿去調整任何人的分數、時薪或分紅。\n' +
    '・每題 1＝非常不同意、5＝非常同意；「普通／說不上來」就選 3。'
  );
  form.setCollectEmail(false);            // 匿名關鍵
  form.setLimitOneResponsePerUser(false); // 限一次需登入，會破壞匿名 → 關閉
  form.setProgressBar(true);
  form.setConfirmationMessage(
    '謝謝你。你的回答會直接影響下一版制度怎麼改。\n想進一步聊的，歡迎私下直接找老闆——這份問卷維持完全匿名。'
  );

  // ── A. 整體感受 ──
  form.addScaleItem()
    .setTitle('A1. 整體而言，你覺得目前這套評分制度合不合理？')
    .setBounds(1, 5).setLabels('很不合理', '很合理')
    .setRequired(true);

  // ── B. 介面與操作 ──
  form.addPageBreakItem().setTitle('介面與操作');
  form.addGridItem()
    .setTitle('以下說法，你同意嗎？')
    .setRows(['找到並打開評分頁面很容易', '每一題我都看得懂在問什麼', '實際點選、送出分數很順', '在手機上填寫整體很流暢'])
    .setColumns(AGREE)
    .setRequired(true);

  // ── C. 填寫體驗（中立，不預設好壞） ──
  form.addPageBreakItem().setTitle('填寫體驗');
  form.addGridItem()
    .setTitle('以下說法，你同意嗎？')
    .setRows(['這份問卷的填寫份量，我可以負荷', '5 天的填寫窗口，時間很充裕', '從第一位評到最後一位，我都能維持一樣的專注'])
    .setColumns(AGREE)
    .setRequired(true);

  // ── D. 評分題目本身 ──
  // ⚠️反向：第4列（常遇到不知道怎麼給），同意＝負面
  form.addPageBreakItem().setTitle('評分題目本身');
  form.addGridItem()
    .setTitle('以下說法，你同意嗎？')
    .setRows([
      '我被評到的項目，大多是我實際有在做的工作',
      '幫我評分的人，清楚我平常真正在做什麼',
      '21 個評分項目，對我的工作來說是合理的',
      '幫別人評分時，我常遇到「對方沒做過、我不知道怎麼給」的項目', // ⚠️反向
      '遇到不熟的項目，我會盡量想清楚再給分'
    ])
    .setColumns(AGREE)
    .setRequired(true);

  // ── E. 評分機制：互評與自評 ──
  // ⚠️反向：第1、3、5列；第6列同意＝支持調整自評權重
  form.addPageBreakItem().setTitle('評分機制：互評與自評');
  form.addGridItem()
    .setTitle('以下說法，你同意嗎？')
    .setRows([
      '大家互評時，普遍傾向給高分、不太願意給低分',        // ⚠️反向
      '現在的分數，能真實區分出誰做得好、誰只是普通',
      '因為分數會影響對方的時薪／分紅，我給低分時會有壓力', // ⚠️反向
      '自評和別人評的分數同樣重要，我覺得這樣公平',
      '這種算法下，敢給自己打高分的人比較占便宜',          // ⚠️反向
      '自評的份量應該再降低（或不算進正式分數）'
    ])
    .setColumns(AGREE)
    .setRequired(true);

  // ── F. 主管調整分數 ──
  form.addPageBreakItem().setTitle('主管調整分數');
  form.addGridItem()
    .setTitle('主管可以對態度分／表現分做加減調整。以下說法，你同意嗎？')
    .setRows([
      '這件事對我來說是透明的（我知道、看得到、也知道原因）',
      '我希望能看到自己被調整前／後的分數',
      '我希望知道每次被調整的理由',
      '我希望調整前後有人主動告知我'
    ])
    .setColumns(AGREE)
    .setRequired(true);

  // ── G. 時薪／分紅連動與信任 ──
  form.addPageBreakItem()
    .setTitle('時薪／分紅連動與信任')
    .setHelpText('這套分數會影響計時的時薪，與正職每季的分紅（來自每季盈餘）。');
  form.addGridItem()
    .setTitle('以下說法，你同意嗎？')
    .setRows([
      '我清楚自己的分數怎麼換算成時薪／分紅',
      '我相信這套分數算出來的時薪／分紅是公平的',
      '把工作做好，真的會反映在我的分數和時薪／分紅上',
      '用同事互評來決定彼此的時薪／分紅，我覺得合理',
      '知道分數會影響時薪／分紅，讓我更有動力把工作做好'
    ])
    .setColumns(AGREE)
    .setRequired(true);

  // ── H. 回饋與申訴 ──
  form.addPageBreakItem().setTitle('回饋與申訴');
  form.addGridItem()
    .setTitle('以下說法，你同意嗎？')
    .setRows([
      '分數出來後，有人會和我討論結果、幫我一起變好',
      '我曾因為看到自己的分數，而實際調整了某個做法',
      '對分數有疑問時，我知道可以找誰，也敢去找'
    ])
    .setColumns(AGREE)
    .setRequired(true);

  // ── I. 整體報酬 ──
  form.addPageBreakItem().setTitle('整體報酬');
  form.addScaleItem()
    .setTitle('I1. 整體來說，你對現在的報酬（時薪／分紅，加上全勤、三節、年終）滿意嗎？')
    .setBounds(1, 5).setLabels('很不滿意', '很滿意')
    .setRequired(true);

  // ── J. 最後：開放意見（皆選填） ──
  form.addPageBreakItem()
    .setTitle('最後：想多說的')
    .setHelpText('以下都可以留空。');
  form.addParagraphTextItem().setTitle('J1. 如果這套制度只能改一件事，你最想改的是什麼？');
  form.addParagraphTextItem().setTitle('J2. 關於「分數出來之後」的回饋或申訴，你有什麼想法或希望？');
  form.addParagraphTextItem().setTitle('J3. 關於薪資／分紅，你最希望店裡做的一件事是什麼？');
  form.addParagraphTextItem().setTitle('J4. 還有什麼前面沒問到、但想讓老闆知道的？');

  // ── 印出連結 ──
  Logger.log('✅ 表單建好了');
  Logger.log('填寫／測試連結： ' + form.getPublishedUrl());
  Logger.log('編輯連結：       ' + form.getEditUrl());
}
