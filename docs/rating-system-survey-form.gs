/**
 * 麻的🔥小辛辣｜評分制度意見調查 — 自動建表腳本
 *
 * 用法：
 *   1. 到 https://script.google.com → 新增專案
 *   2. 貼上這整份程式，存檔
 *   3. 上方函式選 buildRatingSurvey → 執行（第一次會要你授權自己的 Google 帳號）
 *   4. 執行完成後看「執行紀錄 / Log」，會印出兩個網址：
 *        - 測試/填寫連結（發給同仁、也可自己先試填）
 *        - 編輯連結（要改題目就開這個）
 *   表單本身會存在你的 Google 雲端硬碟，之後用手機/電腦都能開。
 *
 * 特性：已設為匿名（不收 email）、必填題已標好、量表方向一致。
 * 反向題（Q14 三列）不在表單上標記，分析時參考本檔註解即可。
 */
function buildRatingSurvey() {
  var AGREE = ['非常不同意', '不同意', '普通', '同意', '非常同意'];

  var form = FormApp.create('麻的🔥小辛辣｜評分制度意見調查（匿名）');
  form.setDescription(
    '這套「互評打分、分數會影響時薪」的制度上線一段時間了。這份問卷想聽你真實的想法——哪裡好用、哪裡卡、哪裡覺得不公平，都請照實說。\n\n' +
    '• 完全匿名，不問名字、不記錄是誰填的。\n' +
    '• 大約 5–7 分鐘，開放題都可以留空。\n' +
    '• 回答只會用來改制度，不會拿去調整任何人的分數或時薪。\n' +
    '• 「不知道／沒感覺」也是重要答案，照選沒關係。'
  );
  form.setCollectEmail(false);        // 匿名關鍵：不收 email
  form.setLimitOneResponsePerUser(false); // 限一次需登入，會破壞匿名 → 關閉
  form.setProgressBar(true);
  form.setConfirmationMessage(
    '謝謝你。你的回答會直接影響下一版制度怎麼改。\n想進一步聊的，歡迎私下直接找老闆——這份問卷維持完全匿名。'
  );

  // ── 區段一　你是誰 ──
  form.addMultipleChoiceItem()
    .setTitle('Q1. 你目前主要的身分是？')
    .setChoiceValues(['計時人員', '正職人員', '有幹部／主管職（會幫別人做加減分調整）'])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Q2. 你在店裡多久了？')
    .setChoiceValues(['未滿 3 個月', '3 個月–1 年', '1–2 年', '2 年以上'])
    .setRequired(false);

  // ── 區段二　整體感受 ──
  form.addPageBreakItem().setTitle('整體感受');
  form.addScaleItem()
    .setTitle('Q3. 整體而言，你覺得目前這套評分制度合不合理？')
    .setBounds(1, 5).setLabels('很不合理', '很合理')
    .setRequired(true);
  form.addParagraphTextItem()
    .setTitle('Q4. 一句話，你對這套制度最大的感受或意見是？');

  // ── 區段三　介面與操作 ──
  form.addPageBreakItem().setTitle('介面與操作');
  form.addGridItem()
    .setTitle('Q5. 以下操作，你覺得順不順？')
    .setRows(['找到並打開評分頁面', '看懂每一題在問什麼', '實際點選、送出分數', '在手機上填的整體流暢度'])
    .setColumns(['很不順', '不太順', '普通', '還算順', '很順'])
    .setRequired(true);
  form.addParagraphTextItem()
    .setTitle('Q6. 操作上最讓你卡住、或最想抱怨的是什麼？');

  // ── 區段四　填寫負擔 ──
  form.addPageBreakItem().setTitle('填寫負擔');
  form.addMultipleChoiceItem()
    .setTitle('Q7. 一次要評 7 位同事、每人 21 題（約 147 顆星）再加自評，你覺得？')
    .setChoiceValues(['太多，填到後面會開始隨便點', '有點多，但還撐得住', '剛好', '不會多'])
    .setRequired(true);
  form.addScaleItem()
    .setTitle('Q8. 填到後半段時，你點星的認真程度大概是？')
    .setBounds(1, 5).setLabels('幾乎用猜的', '每題都認真想')
    .setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('Q9. 目前只有 5 天填寫窗口，對你來說？')
    .setChoiceValues(['太趕', '剛好', '太長，反而拖到最後一天亂填', '沒感覺'])
    .setRequired(true);

  // ── 區段五　評分題目本身 ──
  form.addPageBreakItem().setTitle('評分題目本身');
  form.addGridItem()
    .setTitle('Q10. 針對「你被別人評分」時，請表達同意程度：')
    .setRows(['我被評到的項目，大多是我實際有在做的工作', '幫我評分的人，清楚我平常真正在做什麼', '21 個項目，對我的工作來說是合理的'])
    .setColumns(AGREE)
    .setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('Q11. 你「幫別人評分」時，會不會遇到「這項目他根本沒在做，不知道怎麼給」？')
    .setChoiceValues(['常常遇到', '偶爾', '幾乎不會'])
    .setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('Q12. 遇到不熟、或對方沒做過的項目時，你通常會？')
    .setChoiceValues(['憑印象隨便給個中間分', '乾脆一律給高分帶過', '盡量跳過／給不適用', '會去想清楚再給'])
    .showOtherOption(true)
    .setRequired(true);
  form.addParagraphTextItem()
    .setTitle('Q13. 有沒有哪些項目你覺得「根本不該評我」或「不該由不清楚的人評」？請舉例：');

  // ── 區段六　評分機制（互評／自評／主管調整） ──
  // ⚠️ 反向題（同意＝壞消息）：第1列(放水)、第3列(人情壓力)、第5列(謙虛吃虧)。分析時分組看，勿加總。
  form.addPageBreakItem().setTitle('評分機制：互評／自評／主管調整');
  form.addGridItem()
    .setTitle('Q14. 請就下列說法表達同意程度：')
    .setRows([
      '大家互評時，普遍傾向給高分、不太願意給低分',              // ⚠️反向
      '現在的分數，能真實區分出誰做得好、誰只是普通',
      '因為分數會影響對方時薪，我給低分時會有壓力',              // ⚠️反向
      '自評和別人評的分數同樣重要，我覺得這樣公平',
      '這種算法下，敢給自己打高分的人比較占便宜'                // ⚠️反向
    ])
    .setColumns(AGREE)
    .setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('Q15. 如果可以改「自評」的份量，你希望？')
    .setChoiceValues(['自評不要算進正式分數（只當參考）', '自評份量調低', '維持現在一樣重', '自評份量調高', '沒意見'])
    .setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('Q16. 你知道主管可以對你的態度分／表現分做加減調整嗎？')
    .setChoiceValues(['知道，而且看得到自己被調了多少、為什麼', '知道有這功能，但看不到自己被調的細節或理由', '完全不知道有這回事'])
    .setRequired(true);
  form.addCheckboxItem()
    .setTitle('Q17. 對於「主管調整分數」，你最希望的是？（可複選）')
    .setChoiceValues(['讓我看到自己被調整前／後的分數', '讓我知道被調整的理由', '事前或事後有人跟我說一聲', '有機會表達不同意見', '維持現狀就好'])
    .showOtherOption(true)
    .setRequired(true);

  // ── 區段七　時薪連動與信任 ──
  form.addPageBreakItem().setTitle('時薪連動與信任');
  form.addGridItem()
    .setTitle('Q18. 請就下列說法表達同意程度：')
    .setRows(['我清楚自己的分數是怎麼換算成時薪的', '我相信這套分數算出來的時薪是公平的', '我覺得把工作做好，真的會反映在分數和時薪上'])
    .setColumns(AGREE)
    .setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('Q19. 「用同事互評來決定彼此時薪」這個做法本身，你覺得？')
    .setChoiceValues(['合理，同事最清楚彼此', '方向對，但需要配套（例如加入主管或客觀指標）', '不太合理，容易變成人情分', '很有問題，應該換方式', '說不上來'])
    .setRequired(true);
  form.addParagraphTextItem()
    .setTitle('Q20. 如果要讓分數更可信，你會加什麼、拿掉什麼？');

  // ── 區段八　回饋與申訴 ──
  form.addPageBreakItem().setTitle('回饋與申訴');
  form.addMultipleChoiceItem()
    .setTitle('Q21. 分數出來後，有沒有人跟你談過你的評分結果？')
    .setChoiceValues(['有，會一起看並討論怎麼進步', '有，但只是通知我分數／時薪的數字', '完全沒有', '不確定'])
    .setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('Q22. 你有沒有因為看到自己的分數，而真的改變某個做法？')
    .setChoiceValues(['有，明確調整了', '有想過，但不知道具體要改什麼', '沒有，分數跟我的工作方式沒連結', '我根本不太看分數'])
    .setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('Q23. 如果你對自己的分數有疑問，你知道可以找誰、也敢去找嗎？')
    .setChoiceValues(['知道找誰，也敢', '知道找誰，但不太敢', '不知道可以找誰', '知道也沒用，講了不會改'])
    .setRequired(true);
  form.addParagraphTextItem()
    .setTitle('Q24. 關於「分數出來之後」——回饋、申訴、或你希望被怎麼對待——你想說的：');

  // ── 區段九　報酬與分紅（前瞻） ──
  form.addPageBreakItem()
    .setTitle('報酬與分紅')
    .setHelpText('目前報酬是「時薪／月薪＋全勤、三節、年終這些」，制度裡沒有和店裡營收連動的分紅。以下想了解你的想法。');
  form.addScaleItem()
    .setTitle('Q25. 除了時薪，你對整體報酬（含全勤、三節、年終）的感受是？')
    .setBounds(1, 5).setLabels('很不滿意', '很滿意')
    .setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle('Q26. 如果未來加入「和店裡業績連動的分紅」，你的看法是？')
    .setChoiceValues(['很期待，會更有動力', '看怎麼設計，公平才有意義', '沒差，我比較在意穩定的時薪', '不用，容易製造比較和糾紛'])
    .showOtherOption(true)
    .setRequired(true);
  form.addParagraphTextItem()
    .setTitle('Q27. 關於薪資／獎金／分紅，你最希望店裡做的一件事是？');

  // ── 區段十　最後 ──
  form.addPageBreakItem().setTitle('最後');
  form.addParagraphTextItem()
    .setTitle('Q28. 還有什麼想讓老闆知道、但前面沒問到的？');

  // ── 印出連結 ──
  Logger.log('✅ 表單建好了');
  Logger.log('填寫／測試連結： ' + form.getPublishedUrl());
  Logger.log('編輯連結：       ' + form.getEditUrl());
}
