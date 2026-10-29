// Minimal Express proxy: browser -> আপনার সার্ভার -> বিতরণ কোম্পানির সার্ভার (CORS ও নিরাপত্তার জন্য)
// চালান: npm i express && DESCO_UPSTREAM="<URL>" NESCO_UPSTREAM="<URL>" node desco-proxy.js
// UPSTREAM URL আমি যাচাই করতে পারিনি। খোলা-সোর্স `desco` / `nesco` (PyPI) প্যাকেজের সোর্স থেকে এন্ডপয়েন্ট দেখে নিন
// এবং শুধু প্রিপেইড অ্যাকাউন্ট নম্বর পাঠান। পাসওয়ার্ড/লগইন কখনো সংগ্রহ বা সংরক্ষণ করবেন না।
const express = require("express");
const app = express();
const UP = { desco: process.env.DESCO_UPSTREAM, nesco: process.env.NESCO_UPSTREAM };
const cache = new Map(); // ৬০ সেকেন্ড ক্যাশ, সার্ভারে অযথা চাপ কমায়

// প্রতিটি কোম্পানির আসল JSON ফিল্ড দেখে এই ম্যাপিং মিলিয়ে নিন
const normalize = (j) => ({
  balance: j.balance ?? j.data?.balance,
  monthConsumption: j.currentMonthConsumption ?? j.data?.currentMonthConsumption,
  emergencyCredit: j.emergencyCredit ?? null,
  recharges: j.recharges ?? [],
});

app.get("/api/meter/:provider", async (req, res) => {
  const base = UP[req.params.provider], acc = String(req.query.account || "");
  if (!base || !/^\d{5,15}$/.test(acc)) return res.status(400).json({ error: "bad request" });
  const key = req.params.provider + acc, hit = cache.get(key);
  if (hit && Date.now() - hit.t < 60000) return res.json(hit.v);
  try {
    const r = await fetch(`${base}${encodeURIComponent(acc)}`);
    if (!r.ok) throw new Error(r.status);
    const v = normalize(await r.json());
    cache.set(key, { t: Date.now(), v });
    res.json(v);
  } catch { res.status(502).json({ error: "upstream failed" }); }
});
app.listen(3001, () => console.log("proxy on :3001"));
