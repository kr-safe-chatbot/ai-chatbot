export default function handler(req, res) {
  const { message } = req.body || {};

  if (!message) {
    return res.status(400).json({ answer: "질문을 입력해주세요." });
  }

  const kb = require("../kb_full.json");

  // 간단 유사도 매칭
  function similarity(a, b) {
    a = a.replace(/\s+/g, "");
    b = b.replace(/\s+/g, "");
    let same = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] === b[i]) same++;
    }
    return same / Math.max(a.length, b.length);
  }

  let best = null;
  let score = 0;

  kb.forEach(item => {
    item.patterns.forEach(p => {
      const s = similarity(message, p);
      if (s > score) {
        score = s;
        best = item;
      }
    });
  });

  if (!best) {
    return res.json({ answer: "관련 정보를 찾을 수 없습니다. 다른 표현으로 입력해 주세요." });
  }

  const result = `
🔎 질문과 가장 유사한 항목: ${best.q}

✔ 조치사항:
- ${best.actions.join("\n- ")}

⚠ 주의사항:
- ${best.cautions.join("\n- ")}

📞 보고 대상: ${best.report}
  `;

  res.json({ answer: result });
}
