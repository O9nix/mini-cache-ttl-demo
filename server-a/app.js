// service-a/app.js
import express from 'express';
import { createStore } from 'mini-cache-ttl';
import { createRemoteStore } from 'mini-cache-ttl/client';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Локальный и общий кэш
const localCache = createStore();
const sharedCache = createRemoteStore('http://localhost:4000', 'shared-data');

// 1. JSON parser
app.use(express.json());

// 2. API маршруты — ДО статики!
app.get('/info', (req, res) => {
  res.json({ service: 'A' });
});
app.get('/local/keys', (req, res) => {
  res.json({ keys: localCache.keys() });
});


app.post('/local/:key', (req, res) => {
  const { value, ttl } = req.body;
  localCache.set(req.params.key, value, ttl || null);
  res.json({ ok: true });
});

app.delete('/local/:key', (req, res) => {
  const deleted = localCache.del(req.params.key);
  res.json({ ok: true, deleted });
});

// Локальный кэш
app.get('/local/:key', (req, res) => {
  const value = localCache.get(req.params.key);
  res.json({ key: req.params.key, value });
});

// Общий кэш

app.get('/shared/keys', async (req, res) => {
  try {
    const keys = await sharedCache.keys();
    res.json({ keys });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/shared/:key', async (req, res) => {
  try {
    const { value, ttl } = req.body;
    await sharedCache.set(req.params.key, value, ttl || 60);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/shared/:key', async (req, res) => {
  try {
    await sharedCache.del(req.params.key);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/shared/:key', async (req, res) => {
  try {
    const value = await sharedCache.get(req.params.key);
    res.json({ key: req.params.key, value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Статика
app.use(express.static(path.join(__dirname, 'public')));

// 4. SPA fallback — через регулярное выражение
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🟢 Сервис A запущен: http://localhost:${PORT}`);
});