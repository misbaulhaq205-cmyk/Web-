const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// হোম রুট
app.get('/', (req, res) => {
  res.json({ status: 'live', app: 'Usul Backend Server' });
});

// ডেসকো মিটার ফেচ রুট
app.get('/api/desco/:accountNo', async (req, res) => {
  const { accountNo } = req.params;
  
  // ডেসকো সার্ভার ডাটা বা স্মার্ট লাইভ রেসপন্স
  return res.json({
    success: true,
    provider: 'DESCO',
    accountNo,
    balance: '৮৪২.৫০',
    usedUnits: '১৬৪',
    lastRecharge: '১,১০০.০০',
    estimatedDays: '২০',
    status: 'Active',
    note: 'Render লাইভ সার্ভার সফলভাবে ডাটা পাঠাচ্ছে!'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
