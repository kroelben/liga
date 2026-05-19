const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const SAVE_FILE = path.join(__dirname, 'save.json');
const LOGOS_DIR = path.join(__dirname, 'logos');

app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use('/logos', express.static(LOGOS_DIR));

app.get('/logos-list', (req, res) => {
  try {
    const files = fs.readdirSync(LOGOS_DIR).filter(f => f.endsWith('.png'));
    res.json({ files });
  } catch {
    res.json({ files: [] });
  }
});

app.get('/save', (req, res) => {
  if (!fs.existsSync(SAVE_FILE)) return res.status(404).json({ error: 'No save file' });
  res.sendFile(SAVE_FILE, err => {
    if (err && !res.headersSent) res.status(500).json({ error: 'Could not read save file' });
  });
});

app.post('/save', (req, res) => {
  try {
    fs.writeFileSync(SAVE_FILE, JSON.stringify(req.body, null, 2));
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to write save file:', err);
    res.status(500).json({ error: 'Could not write save file' });
  }
});

app.listen(PORT, () => console.log(`League simulator running at http://localhost:${PORT}`));
