require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const BOT_API_SECRET = process.env.BOT_API_SECRET;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_LOGIN = process.env.ADMIN_LOGIN;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || '';
const MONGO_URI = process.env.MONGO_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const PUBLIC_URL = (process.env.PUBLIC_URL || process.env.SERVER_URL || '').replace(/\/$/, '');
const aiBriefSessions = new Set();

function localBriefResponse(history, message) {
  const userAnswers = [...history, { role: 'user', text: message }]
    .filter((item) => item.role === 'user')
    .map((item) => item.text.trim());

  const step = userAnswers.length;

  const questions = [
    'Розкажіть детальніше: що саме продаєте або пропонуєте, в якому місті, і хто ваші основні клієнти?',
    'Що повинен робити сайт? Наприклад: показати меню та ціни, прийняти онлайн-замовлення, бронювати столики? Напишіть все що хочете — підберу оптимальний набір.',
    'Яка головна мета: більше замовлень онлайн, більше гостей у закладі, впізнаваність бренду, чи щось інше?',
    'Коли плануєте запуск? Наприклад: цього місяця, за 1-2 місяці, або без конкретних дат.',
    'Залиште Telegram (@username) або номер телефону — команда зв\'яжеться для узгодження деталей і фінальної ціни.',
  ];

  if (step < questions.length) {
    return { reply: questions[step], ready: false, brief: null };
  }

  const brief = {
    goal:     userAnswers[0] || '—',
    audience: userAnswers[0] || '—',
    features: userAnswers[1] || '—',
    timing:   userAnswers[3] || '—',
    budget:   'Розраховано в калькуляторі; фінальна ціна після консультації.',
    contacts: userAnswers[4] || '—',
  };

  const reply = `Дякую! Ось що я зрозумів:\n\n🏢 Бізнес: ${userAnswers[0]}\n🛠 Функції: ${userAnswers[1]}\n🎯 Мета: ${userAnswers[2]}\n📅 Терміни: ${userAnswers[3]}\n📞 Контакт: ${userAnswers[4]}\n\nКоманда отримала стартовий план і зв'яжеться з вами найближчим часом!`;

  return { reply, ready: true, brief };
}

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// === Mongoose Setup ===
if (MONGO_URI) {
  mongoose.connect(MONGO_URI, { dbName: 'MedlebDigital' })
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
} else {
  console.warn('MONGO_URI is not configured; MongoDB features are unavailable.');
}

const ErrorLogSchema = new mongoose.Schema({
  message: String,
  stack: String,
  time: { type: Date, default: Date.now }
});
const ErrorLog = mongoose.model('ErrorLog', ErrorLogSchema);

const PortfolioSchema = new mongoose.Schema({
  title: String,
  description: String,
  tags: [String],
  tech: String,
  result: String,
  link: String,
  color: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Portfolio = mongoose.model('Portfolio', PortfolioSchema);

const SettingSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed
});
const Setting = mongoose.model('Setting', SettingSchema);

const ChatSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  clientName: String,
  customName: String, // added
  projectId: String,  // added
  status: { type: String, default: 'open' },
  unread: { type: Number, default: 0 },
  messages: [{
    id: String,
    from: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Chat = mongoose.model('Chat', ChatSchema);

const ProjectSchema = new mongoose.Schema({
  title: String,
  clientName: String,
  chatId: String,
  status: { type: String, default: 'active' }, // active, completed, paused
  description: String,
  price: Number,
  paid: Number,
  deadline: Date,
  links: [String],
  todos: [{ text: String, done: Boolean }], // added
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Project = mongoose.model('Project', ProjectSchema);

// === Cache System ===
let memCache = { portfolio: [], settings: {} };

async function syncCache() {
  try {
    const pf = await Portfolio.find().sort({ createdAt: -1 }).lean();
    const st = await Setting.find().lean();
    const setObj = st.reduce((acc, cur) => { acc[cur.key] = cur.value; return acc; }, {});
    
    memCache.portfolio = pf;
    memCache.settings = setObj;
    
    fs.writeFileSync(path.join(DATA_DIR, 'portfolio.json'), JSON.stringify(pf, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'settings.json'), JSON.stringify(setObj, null, 2));
  } catch (err) {
    logError('Cache Sync Error', err);
  }
}

async function logError(message, err) {
  try {
    await ErrorLog.create({ message, stack: err?.stack || String(err) });
  } catch (e) {
    console.error('Failed to write error log:', e);
  }
}

// Initial default settings and seeding
async function initSettings() {
  try {
    const setcount = await Setting.countDocuments();
    if (setcount === 0) {
      const defaults = [
        { key: 'social_tg', value: 'https://t.me/MedlebDigitalBot' },
        { key: 'social_inst', value: 'https://www.instagram.com/medlebdigital/' },
        { key: 'social_olx', value: '#' },
        { key: 'about_name', value: 'Глєб' },
        { key: 'price_site_base', value: 200 },
        { key: 'price_bot_base', value: 300 },
        { key: 'price_parser_base', value: 75 },
        { key: 'price_auto_base', value: 350 },
        { key: 'price_complex_base', value: 750 }
      ];
      await Setting.insertMany(defaults);
    }
    
    const pfcount = await Portfolio.countDocuments();
    if (pfcount === 0) {
      await Portfolio.insertMany([
        { title: 'Corporate Portal', description: 'Розробка внутрішнього порталу для компанії', tags: ['Сайт', 'CRM'], tech: 'React, Node.js', result: 'Оптимізація процесів', link: '#', color: '#000000' },
        { title: 'Telegram Manager', description: 'Бот для автоматизації замовлень в ресторані', tags: ['Бот', 'Python'], tech: 'aiogram', result: '+30% замовлень', link: '#', color: '#000000' },
        { title: 'Data Parser', description: 'Парсинг B2B контактів з відкритих джерел', tags: ['Парсер'], tech: 'BeautifulSoup', result: '10k+ лідів', link: '#', color: '#000000' }
      ]);
    }

    await syncCache();
  } catch (e) { logError('Init DB error', e); }
}
mongoose.connection.once('open', initSettings);

// If local cache files exist before mongo connects, load them into mem
try {
  if (fs.existsSync(path.join(DATA_DIR, 'portfolio.json'))) {
    memCache.portfolio = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'portfolio.json')));
  }
  if (fs.existsSync(path.join(DATA_DIR, 'settings.json'))) {
    memCache.settings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'settings.json')));
  }
} catch (e) {}

// === Express Setup ===
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:", "http://localhost:*"],
    },
  },
}));

app.use(cors({ origin: (origin, cb) => cb(null, true), credentials: true }));
app.use(compression());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

app.use('/api', globalLimiter);

function authMiddleware(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalid or expired' });
  }
}

function botMiddleware(req, res, next) {
  if (req.headers['x-bot-secret'] !== BOT_API_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1h',
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  },
}));

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// === 2FA Pending Login Store ===
const pending2FALogins = new Map(); // loginRequestId -> { login, expiresAt, status: 'pending'|'approved'|'rejected', token: null }

// Cleanup expired 2FA requests every minute
setInterval(() => {
  const now = Date.now();
  for (const [id, req] of pending2FALogins.entries()) {
    if (req.expiresAt < now) pending2FALogins.delete(id);
  }
}, 60000);

// === Auth API with 2FA Telegram Approval ===
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) return res.status(400).json({ error: 'Логін та пароль обов’язкові' });

  const adminChatId = process.env.ADMIN_CHAT_ID;
  const adminLogin = process.env.ADMIN_LOGIN;
  const adminUser = (process.env.ADMIN_USERNAME || '').toLowerCase().replace('@', '');
  const adminPass = process.env.ADMIN_PASSWORD;

  if (!adminLogin || !adminPass) {
    return res.status(503).json({ error: 'Вхід тимчасово недоступний: налаштуйте дані адміністратора на сервері.' });
  }
  const botToken = process.env.BOT_TOKEN;

  const validLogins = [adminChatId, adminLogin, adminUser].filter(Boolean).map(l => String(l).toLowerCase().replace('@', ''));
  const loginNorm = String(login).toLowerCase().replace('@', '').trim();

  const isLoginValid = validLogins.some(v => loginNorm === v);

  if (!isLoginValid || password !== adminPass) {
    return res.status(401).json({ error: 'Невірний логін або пароль' });
  }

  // A Render deployment can intentionally have no Telegram credentials. In
  // that configuration, a correct admin login must still be able to open the
  // panel instead of waiting for an approval notification that cannot arrive.
  if (!process.env.BOT_TOKEN || !adminChatId) {
    const token = jwt.sign({ admin: true, id: adminLogin }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, requires2FA: false });
  }

  // Generate 2FA request ID
  const requestId = crypto.randomBytes(16).toString('hex');
  // Render instances may wake up slowly and Telegram can deliver a callback late.
  const expiresAt = Date.now() + 30 * 60 * 1000;

  pending2FALogins.set(requestId, {
    login: loginNorm,
    expiresAt,
    status: 'pending',
    token: null
  });

  // Send Telegram confirmation with inline buttons
  if (botToken && adminChatId) {
    try {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      const tgMsg = `🔐 *Спроба входу в панель Medleb Digital*\n\n` +
        `👤 *Користувач:* ${login}\n` +
        `🌐 *IP:* \`${clientIp}\`\n` +
        `⏰ *Час:* ${new Date().toLocaleTimeString('uk-UA')}\n\n` +
        `❓ *Це ви намагаєтесь увійти?*`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            { text: '✅ Так, це я (Дозволити)', callback_data: `auth_approve:${requestId}` },
            { text: '❌ Ні, заблокувати', callback_data: `auth_reject:${requestId}` }
          ]
        ]
      };

      // Call Telegram Bot API directly
      const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const tgPayload = {
        chat_id: adminChatId,
        text: tgMsg,
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard
      };

      http.request ? require('https').request(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, (resp) => {}).end(JSON.stringify(tgPayload)) : null;

    } catch (tgErr) {
      console.error('Failed to send Telegram 2FA notification:', tgErr);
    }
  }

  // Return pending 2FA challenge to client
  res.json({
    requires2FA: true,
    requestId,
    message: 'Підтвердіть вхід у Telegram-боті'
  });
});

// Check status of 2FA login (Polling from admin client)
app.get('/api/auth/2fa-status/:requestId', (req, res) => {
  const { requestId } = req.params;
  const entry = pending2FALogins.get(requestId);

  if (!entry) {
    return res.status(404).json({ error: 'Запит авторизації не знайдено або термін дії вичерпано' });
  }

  if (entry.status === 'approved') {
    // Generate actual token
    const token = jwt.sign({ admin: true, id: process.env.ADMIN_CHAT_ID }, JWT_SECRET, { expiresIn: '24h' });
    pending2FALogins.delete(requestId);
    return res.json({ status: 'approved', token });
  }

  if (entry.status === 'rejected') {
    pending2FALogins.delete(requestId);
    return res.status(403).json({ status: 'rejected', error: 'Вхід відхилено в Telegram' });
  }

  return res.json({ status: 'pending' });
});

// Endpoint called by Telegram Bot or Callback Webhook to approve/reject
app.post('/api/auth/2fa-resolve', (req, res) => {
  const { requestId, action, secret } = req.body;
  const suppliedSecret = Buffer.from(String(secret || ''));
  const expectedSecret = Buffer.from(String(BOT_API_SECRET || ''));
  if (!BOT_API_SECRET || !secret || suppliedSecret.length !== expectedSecret.length || !crypto.timingSafeEqual(suppliedSecret, expectedSecret)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const entry = pending2FALogins.get(requestId);
  if (!entry) return res.status(404).json({ error: 'Запит не знайдено' });

  if (action === 'approve') {
    entry.status = 'approved';
    return res.json({ ok: true, message: 'Approved' });
  } else {
    entry.status = 'rejected';
    return res.json({ ok: true, message: 'Rejected' });
  }
});

// Render runs the Node web service, not the optional Python polling process.
// Handle Telegram approval callbacks here so admin 2FA works in that setup.
app.post('/api/telegram/webhook', async (req, res) => {
  if (TELEGRAM_WEBHOOK_SECRET && req.get('x-telegram-bot-api-secret-token') !== TELEGRAM_WEBHOOK_SECRET) return res.sendStatus(403);
  const query = req.body?.callback_query;
  const match = query?.data?.match(/^auth_(approve|reject):([a-f0-9]{32})$/);
  if (!query || !match) return res.sendStatus(200);
  const [, action, requestId] = match;
  const entry = pending2FALogins.get(requestId);
  const approved = action === 'approve';
  if (entry && entry.expiresAt >= Date.now()) entry.status = approved ? 'approved' : 'rejected';
  const callbackText = entry ? (approved ? 'Вхід підтверджено.' : 'Вхід відхилено.') : 'Цей запит уже не активний.';
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ callback_query_id: query.id, text: callbackText, show_alert: !entry }) });
    if (query.message?.chat?.id && query.message?.message_id) await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageReplyMarkup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: query.message.chat.id, message_id: query.message.message_id, reply_markup: { inline_keyboard: [] } }) });
  } catch (error) { logError('Telegram 2FA callback', error); }
  res.sendStatus(200);
});


app.get('/api/auth/verify', authMiddleware, (req, res) => res.json({ ok: true }));

// === Public AI project brief ===
// The key deliberately stays on the server. The browser receives only a
// conversational response and never has access to GEMINI_API_KEY.
app.post('/api/ai/brief', authLimiter, async (req, res) => {
  const { message, history = [], sessionId } = req.body || {};
  if (!message || typeof message !== 'string' || message.trim().length > 3000) return res.status(400).json({ error: 'Please enter a shorter project description.' });
  const safeHistory = Array.isArray(history) ? history.slice(-10).map((item) => ({
    role: item?.role === 'model' ? 'model' : 'user',
    parts: [{ text: String(item?.text || '').slice(0, 3000) }],
  })).filter((item) => item.parts[0].text) : [];
  const instruction = `You are a warm project consultant for Medleb Digital. Speak Ukrainian, naturally and simply. Ask one focused question at a time: business and audience, desired site functions, main goal, timing, then Telegram @username or phone. Do not demand a budget: the visitor used a calculator and may not know pricing. If they say they do not know, propose sensible options and ask them to choose. Once the contact is received, set ready=true and write a concise actionable project summary, not a quote of their messages. Return ONLY valid JSON: {"reply":"...","ready":false,"brief":{"goal":"","audience":"","features":"","timing":"","budget":"","contacts":""}}. Never invent client facts.`;
  try {
    if (!GEMINI_API_KEY) {
      const answer = localBriefResponse(history, message.trim());
      if (answer.ready && sessionId && !aiBriefSessions.has(sessionId)) {
        aiBriefSessions.add(sessionId);
        const b = answer.brief;
        await sendTelegramNotification(`ai-${sessionId}`, 'AI brief', `📋 Новий бриф від клієнта\n\n🏢 Бізнес: ${b.goal}\n🛠 Функції: ${b.features}\n📅 Терміни: ${b.timing}\n📞 Контакт: ${b.contacts || '—'}\n💰 Бюджет: ${b.budget}`);
      }
      return res.json({ ...answer, fallback: true });
    }
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({ system_instruction: { parts: [{ text: instruction }] }, contents: [...safeHistory, { role: 'user', parts: [{ text: message.trim() }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.45 } }),
    });
    if (!response.ok) throw new Error(`Gemini ${response.status}: ${await response.text()}`);
    const payload = await response.json();
    const raw = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
    const answer = JSON.parse(raw);
    if (!answer.reply) throw new Error('Gemini returned an incomplete response');
    if (answer.ready && sessionId && !aiBriefSessions.has(sessionId)) {
      aiBriefSessions.add(sessionId);
      const b = answer.brief || {};
      await sendTelegramNotification(`ai-${sessionId}`, 'AI brief', `Новий бриф від AI-помічника\n\nЦіль: ${b.goal || '—'}\nАудиторія: ${b.audience || '—'}\nФункції: ${b.features || '—'}\nТермін: ${b.timing || '—'}\nБюджет: ${b.budget || '—'}\nКонтакти: ${b.contacts || '—'}`);
    }
    return res.json({ reply: answer.reply, ready: Boolean(answer.ready), brief: answer.brief || null });
  } catch (error) {
    logError('Gemini brief', error);
    // A bad key, a temporarily unavailable model, or an expired quota must not
    // leave the visitor with a dead chat. Continue the guided brief locally.
    const answer = localBriefResponse(history, message.trim());
    if (answer.ready && sessionId && !aiBriefSessions.has(sessionId)) {
      aiBriefSessions.add(sessionId);
      const b = answer.brief;
      await sendTelegramNotification(`ai-${sessionId}`, 'AI brief', `📋 Новий бриф від клієнта\n\n🏢 Бізнес: ${b.goal}\n🛠 Функції: ${b.features}\n📅 Терміни: ${b.timing}\n📞 Контакт: ${b.contacts || '—'}\n💰 Бюджет: ${b.budget}`);
    }
    return res.json({ ...answer, fallback: true });
  }
});

// === Public API (Fast Cache) ===
app.get('/api/portfolio', (req, res) => res.json(memCache.portfolio));
app.get('/api/settings', (req, res) => res.json(memCache.settings));

// === Admin API (Settings) ===
app.put('/api/settings', authMiddleware, async (req, res) => {
  try {
    const data = req.body; // Object of key-values
    const ops = Object.keys(data).map(key => ({
      updateOne: { filter: { key }, update: { value: data[key] }, upsert: true }
    }));
    if (ops.length > 0) {
      await Setting.bulkWrite(ops);
      await syncCache();
    }
    res.json({ ok: true, settings: memCache.settings });
  } catch (err) {
    logError('Settings Update', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// === Admin API (Portfolio) ===
app.post('/api/portfolio', authMiddleware, async (req, res) => {
  try {
    const item = await Portfolio.create(req.body);
    await syncCache();
    res.status(201).json(item);
  } catch (err) {
    logError('Portfolio Create', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/portfolio/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Portfolio.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: Date.now() }, { new: true });
    await syncCache();
    res.json(item);
  } catch (err) {
    logError('Portfolio Update', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/portfolio/:id', authMiddleware, async (req, res) => {
  try {
    await Portfolio.findByIdAndDelete(req.params.id);
    await syncCache();
    res.json({ ok: true });
  } catch (err) {
    logError('Portfolio Delete', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// === Admin API (CRM Projects) ===
app.get('/api/projects', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});
app.post('/api/projects', authMiddleware, async (req, res) => {
  try {
    const p = await Project.create(req.body);
    res.json(p);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});
app.put('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const p = await Project.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: Date.now() }, { new: true });
    res.json(p);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});
app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// === Admin API (Chats) ===
app.get('/api/chats', authMiddleware, async (req, res) => {
  try {
    const chats = await Chat.find().sort({ updatedAt: -1 }).lean();
    res.json(chats);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/chats/:id', authMiddleware, async (req, res) => {
  try {
    const chat = await Chat.findOneAndUpdate(
      { id: req.params.id }, 
      { customName: req.body.customName, projectId: req.body.projectId }, 
      { new: true }
    );
    res.json(chat);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/chats/:id/read', authMiddleware, async (req, res) => {
  try {
    await Chat.findOneAndUpdate({ id: req.params.id }, { unread: 0 });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// === Bot Relay API ===
app.post('/api/bot/relay', botMiddleware, async (req, res) => {
  const { chatId, text } = req.body;
  if (!chatId || !text) return res.status(400).json({ error: 'Required' });
  try {
    const message = { id: crypto.randomBytes(8).toString('hex'), from: 'admin', text };
    const chat = await Chat.findOneAndUpdate(
      { id: chatId },
      { $push: { messages: message }, updatedAt: Date.now() },
      { new: true }
    );
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    const clientWs = clientSockets.get(chatId);
    if (clientWs && clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ type: 'message', message }));
    }
    
    broadcastAdmin({ type: 'admin_new_message', chatId, message });
    res.json({ ok: true, message });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/bot/chats', botMiddleware, async (req, res) => {
  try {
    const chats = await Chat.find({ status: 'open' }).sort({ updatedAt: -1 }).lean();
    res.json(chats);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/bot/portfolio', botMiddleware, (req, res) => res.json(memCache.portfolio));

// === Frontend routes ===
app.get('/admin/*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html')));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === WebSockets (Live Chat) ===
const clientSockets = new Map();
const adminSockets = new Set();

function broadcastAdmin(payload) {
  const msg = JSON.stringify(payload);
  adminSockets.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  });
}

wss.on('connection', (ws) => {
  let chatId = null;
  let isAdmin = false;

  ws.on('message', async (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.type === 'admin_connect') {
      try {
        jwt.verify(msg.token, JWT_SECRET);
        isAdmin = true;
        adminSockets.add(ws);
        ws.send(JSON.stringify({ type: 'admin_connected' }));
      } catch {
        ws.send(JSON.stringify({ type: 'error', error: 'Invalid token' }));
      }
      return;
    }

    if (msg.type === 'admin_reply' && isAdmin) {
      const { targetChatId, text } = msg;
      if (!targetChatId || !text) return;
      
      const message = { id: crypto.randomBytes(8).toString('hex'), from: 'admin', text };
      await Chat.findOneAndUpdate(
        { id: targetChatId },
        { $push: { messages: message }, updatedAt: Date.now() }
      );

      const clientWs = clientSockets.get(targetChatId);
      if (clientWs && clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ type: 'message', message }));
      }

      broadcastAdmin({ type: 'admin_new_message', chatId: targetChatId, message });
      sendTelegramReplyConfirm(targetChatId, text);
      return;
    }

    if (msg.type === 'init') {
      chatId = msg.chatId || crypto.randomBytes(16).toString('hex');
      clientSockets.set(chatId, ws);
      
      let chat = await Chat.findOne({ id: chatId });
      if (!chat) {
        chat = await Chat.create({ id: chatId, clientName: msg.clientName || 'Гість' });
      }
      ws.send(JSON.stringify({ type: 'init', chatId, messages: chat.messages }));
      return;
    }

    if (msg.type === 'message' && chatId) {
      const text = String(msg.text || '').trim().slice(0, 4000);
      if (!text) return;

      const message = { id: crypto.randomBytes(8).toString('hex'), from: 'client', text };
      const chat = await Chat.findOneAndUpdate(
        { id: chatId },
        { $push: { messages: message }, $inc: { unread: 1 }, updatedAt: Date.now() },
        { new: true }
      );
      if(!chat) return;

      ws.send(JSON.stringify({ type: 'ack', messageId: message.id }));
      broadcastAdmin({ type: 'new_message', chatId, message, clientName: chat.clientName });
      sendTelegramNotification(chatId, chat.clientName, text);
    }
  });

  ws.on('close', () => {
    if (chatId) clientSockets.delete(chatId);
    if (isAdmin) adminSockets.delete(ws);
  });
});

async function sendTelegramNotification(chatId, clientName, text) {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return;
  try {
    const body = {
      chat_id: ADMIN_CHAT_ID,
      text: `💬 Нове повідомлення\n\n👤 ${clientName}\n🆔 ${chatId.slice(0, 12)}...\n\n${text}`,
      reply_markup: {
        inline_keyboard: [[
          { text: '💬 Відповісти', callback_data: `reply_chat_${chatId}` },
          { text: '📋 Відкрити чат', callback_data: `open_chat_${chatId}` },
        ]],
      },
    };
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) { logError('TG Notification', e); }
}

async function sendTelegramReplyConfirm(chatId, text) {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: `✅ Відповідь надіслана клієнту:\n\n${text}`,
      }),
    });
  } catch {}
}

async function configureTelegramWebhook() {
  if (!BOT_TOKEN || !PUBLIC_URL.startsWith('https://')) return;
  try {
    const payload = { url: `${PUBLIC_URL}/api/telegram/webhook`, allowed_updates: ['callback_query'] };
    if (TELEGRAM_WEBHOOK_SECRET) payload.secret_token = TELEGRAM_WEBHOOK_SECRET;
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`setWebhook ${response.status}`);
    console.log('Telegram 2FA webhook configured');
  } catch (error) { logError('Telegram webhook setup', error); }
}

server.listen(PORT, () => {
  configureTelegramWebhook();
  console.log(`\n🚀 Medleb Digital Server`);
  console.log(`🌐 Site:   http://localhost:${PORT}`);
  console.log(`🔐 Admin:  http://localhost:${PORT}/admin\n`);
});
