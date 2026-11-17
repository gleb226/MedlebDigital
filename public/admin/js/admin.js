/* ============================================================
   Medleb Admin Panel — JavaScript
   Auth flow: Login → 2FA (Telegram) → Dashboard
   All existing API calls preserved.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Screens ──────────────────────────────────────────────
  const screenLogin     = document.getElementById('screen-login');
  const screen2fa       = document.getElementById('screen-2fa');
  const screenDashboard = document.getElementById('screen-dashboard');

  function showScreen(name) {
    screenLogin.classList.remove('active');
    screen2fa.classList.remove('active');
    screenDashboard.classList.remove('active');
    document.getElementById(`screen-${name}`).classList.add('active');
  }

  // ── State ─────────────────────────────────────────────────
  let token        = localStorage.getItem('adminToken');
  let ws           = null;
  let activeChatId = null;
  let tfa2faInterval   = null;
  let tfaTimerInterval = null;
  let currentTodos = [];

  const passwordInput = document.getElementById('password-input');
  const passwordToggle = document.getElementById('password-toggle');
  const themeToggle = document.getElementById('theme-toggle');

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('adminTheme', theme);
    if (themeToggle) themeToggle.querySelector('span:last-child').textContent = theme === 'dark' ? 'Світла тема' : 'Темна тема';
  }

  setTheme(localStorage.getItem('adminTheme') || 'dark');

  passwordToggle?.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    passwordToggle.setAttribute('aria-pressed', String(isHidden));
    passwordToggle.setAttribute('aria-label', isHidden ? 'Сховати пароль' : 'Показати пароль');
  });

  themeToggle?.addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  // ── Boot ──────────────────────────────────────────────────
  if (token) {
    verifyToken();
  } else {
    showScreen('login');
  }

  async function verifyToken() {
    try {
      const res = await apiFetch('/api/auth/verify');
      if (res.ok) {
        enterDashboard();
      } else {
        throw new Error('stale');
      }
    } catch {
      logout();
    }
  }

  // ── API helper ────────────────────────────────────────────
  function apiFetch(url, opts = {}) {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, { ...opts, headers });
  }

  // ══════════════════════════════════════════════════════════
  //  LOGIN
  // ══════════════════════════════════════════════════════════
  const loginForm  = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const login    = document.getElementById('login-input').value.trim();
    const password = document.getElementById('password-input').value;

    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      });
      const data = await res.json();

      if (!res.ok) {
        loginError.textContent = data.error || 'Невірний логін або пароль';
        return;
      }

      if (data.requires2FA && data.requestId) {
        start2FA(data.requestId);
      } else if (data.token) {
        // Direct token (no 2FA required)
        token = data.token;
        localStorage.setItem('adminToken', token);
        enterDashboard();
      } else {
        loginError.textContent = 'Несподівана відповідь сервера';
      }
    } catch {
      loginError.textContent = 'Помилка підключення до сервера';
    }
  });

  // ══════════════════════════════════════════════════════════
  //  2FA
  // ══════════════════════════════════════════════════════════
  const tfaTimer    = document.getElementById('tfa-timer');
  const tfaError    = document.getElementById('tfa-error');
  const tfaCancel   = document.getElementById('tfa-cancel');
  const tfaRing     = document.getElementById('tfa-ring-progress');

  const TFA_TOTAL   = 180; // 3 minutes
  const RING_CIRCUM = 314; // 2πr ≈ 314 for r=50

  function start2FA(requestId) {
    showScreen('2fa');
    tfaError.classList.remove('show');
    let remaining = TFA_TOTAL;

    // Ring init
    tfaRing.style.strokeDashoffset = '0';

    // Countdown
    updateTimer(remaining);
    tfaTimerInterval = setInterval(() => {
      remaining--;
      updateTimer(remaining);
      // Ring shrinks as time passes
      const offset = RING_CIRCUM * (1 - remaining / TFA_TOTAL);
      tfaRing.style.strokeDashoffset = String(offset);

      if (remaining <= 0) {
        stopTfaIntervals();
        tfaError.textContent = '⏱ Час вийшов. Спробуйте увійти ще раз.';
        tfaError.classList.add('show');
      }
    }, 1000);

    // Poll
    tfa2faInterval = setInterval(async () => {
      try {
        const res  = await fetch(`/api/auth/2fa-status/${requestId}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === 'approved' && data.token) {
          stopTfaIntervals();
          token = data.token;
          localStorage.setItem('adminToken', token);
          enterDashboard();
        } else if (data.status === 'rejected') {
          stopTfaIntervals();
          tfaError.textContent = '⛔ Вхід відхилено. Спробуйте ще раз.';
          tfaError.classList.add('show');
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 2000);
  }

  function updateTimer(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    tfaTimer.textContent = `${m}:${s}`;
  }

  function stopTfaIntervals() {
    clearInterval(tfa2faInterval);
    clearInterval(tfaTimerInterval);
    tfa2faInterval = null;
    tfaTimerInterval = null;
  }

  tfaCancel.addEventListener('click', () => {
    stopTfaIntervals();
    showScreen('login');
  });

  // ══════════════════════════════════════════════════════════
  //  DASHBOARD
  // ══════════════════════════════════════════════════════════
  function enterDashboard() {
    showScreen('dashboard');
    connectWs();
    loadChats();
  }

  function logout() {
    stopTfaIntervals();
    token = null;
    localStorage.removeItem('adminToken');
    if (ws) { ws.close(); ws = null; }
    activeChatId = null;
    showScreen('login');
  }

  document.getElementById('logout-btn').addEventListener('click', logout);

  // ── Tabs ───────────────────────────────────────────────────
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
      item.classList.add('active');
      document.getElementById(`view-${item.dataset.tab}`).style.display = 'flex';

      if (item.dataset.tab === 'chats')     loadChats();
      if (item.dataset.tab === 'projects')  loadProjects();
      if (item.dataset.tab === 'portfolio') loadPortfolio();
      if (item.dataset.tab === 'settings')  loadSettings();
    });
  });

  // ── WebSocket ─────────────────────────────────────────────
  function connectWs() {
    const host     = (window.location.hostname === '127.0.0.1' && window.location.port === '5500')
                     ? 'localhost:3000' : window.location.host;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${host}`);

    ws.onopen = () => ws.send(JSON.stringify({ type: 'admin_connect', token }));

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'new_message' || data.type === 'admin_new_message') {
        loadChats();
        if (data.chatId === activeChatId) {
          appendMessage(data.message.text, data.message.from);
          markChatRead(activeChatId);
        }
      }
    };

    ws.onclose = () => { if (token) setTimeout(connectWs, 5000); };
    ws.onerror = ()  => {};
  }

  // ══════════════════════════════════════════════════════════
  //  CHATS  —  GET /api/admin/chats  |  GET /api/admin/chat/:userId
  //            POST /api/admin/send
  // ══════════════════════════════════════════════════════════
  const chatsList    = document.getElementById('chats-list');
  const chatMessages = document.getElementById('admin-chat-messages');
  const chatHeader   = document.getElementById('chat-header');
  const chatForm     = document.getElementById('admin-chat-form');
  const chatInput    = document.getElementById('admin-chat-input');
  const chatsBadge   = document.getElementById('chats-badge');

  // Search filter
  const searchInput = document.getElementById('chats-search-input');
  let allChats = [];
  searchInput && searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    renderChatsList(allChats.filter(c =>
      (c.clientName || '').toLowerCase().includes(q) ||
      (c.customName  || '').toLowerCase().includes(q)
    ));
  });

  async function loadChats() {
    try {
      // Support both old path and new path
      const res = await apiFetch('/api/admin/chats').catch(() => apiFetch('/api/chats'));
      if (!res.ok) return;
      allChats = await res.json();
      renderChatsList(allChats);
    } catch (e) { console.error('loadChats', e); }
  }

  function renderChatsList(chats) {
    // Remove existing chat items (keep search box)
    const existing = chatsList.querySelectorAll('.chat-list-item');
    existing.forEach(el => el.remove());

    let totalUnread = 0;
    chats.forEach(chat => {
      totalUnread += chat.unread || 0;
      const lastMsg = chat.messages && chat.messages[chat.messages.length - 1];
      const preview = lastMsg ? lastMsg.text : 'Немає повідомлень';
      const time    = chat.updatedAt
        ? new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

      const el = document.createElement('div');
      el.className = `chat-list-item ${chat.id === activeChatId ? 'active' : ''}`;
      el.innerHTML = `
        <div class="chat-list-item-header">
          <span class="chat-list-name">
            ${chat.customName || chat.clientName || 'Гість'}
            ${chat.unread ? '<span class="chat-list-unread"></span>' : ''}
          </span>
          <span class="chat-list-time">${time}</span>
        </div>
        <div class="chat-list-preview">${preview}</div>
      `;
      el.addEventListener('click', () => openChat(chat));
      chatsList.appendChild(el);
    });

    if (totalUnread > 0) {
      chatsBadge.textContent = totalUnread;
      chatsBadge.classList.add('show');
    } else {
      chatsBadge.classList.remove('show');
    }
  }

  async function openChat(chat) {
    activeChatId = chat.id;
    document.querySelectorAll('.chat-list-item').forEach(el => el.classList.remove('active'));
    const activeEl = [...document.querySelectorAll('.chat-list-item')]
      .find(el => el.querySelector('.chat-list-name')?.textContent.trim()
        .startsWith(chat.customName || chat.clientName || 'Гість'));
    if (activeEl) activeEl.classList.add('active');

    // Header with inline editor
    chatHeader.innerHTML = `
      <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
        <h3>${chat.customName || chat.clientName || 'Гість'}</h3>
        <button class="btn btn--ghost" id="edit-chat-meta-btn" style="padding:5px 10px; font-size:12px;">
          Налаштувати
        </button>
      </div>
      <div class="chat-meta-editor" id="chat-meta-editor">
        <input type="text" id="chat-custom-name" placeholder="Ім'я клієнта" value="${chat.customName || ''}">
        <input type="text" id="chat-project-id"  placeholder="ID Проекту (опц.)" value="${chat.projectId || ''}">
        <button class="btn btn--primary" id="save-chat-meta-btn" style="width:100%;">Зберегти</button>
      </div>
    `;

    document.getElementById('edit-chat-meta-btn').addEventListener('click', () => {
      document.getElementById('chat-meta-editor').classList.toggle('show');
    });

    document.getElementById('save-chat-meta-btn').addEventListener('click', async () => {
      const customName = document.getElementById('chat-custom-name').value;
      const projectId  = document.getElementById('chat-project-id').value;
      try {
        await apiFetch(`/api/chats/${chat.id}`, {
          method: 'PUT',
          body: JSON.stringify({ customName, projectId })
        });
        loadChats();
      } catch {}
    });

    chatForm.style.display = 'flex';
    chatMessages.innerHTML = '';

    // Load messages — try /api/admin/chat/:userId first, fallback to data on chat object
    try {
      const res = await apiFetch(`/api/admin/chat/${chat.id}`)
        .catch(() => null);

      let messages = chat.messages || [];
      if (res && res.ok) {
        const data = await res.json();
        messages = Array.isArray(data) ? data : (data.messages || messages);
      }

      if (messages.length === 0) {
        chatMessages.innerHTML = '<div class="empty-state">Немає повідомлень</div>';
      } else {
        messages.forEach(msg => appendMessage(msg.text, msg.from));
      }
    } catch {
      (chat.messages || []).forEach(msg => appendMessage(msg.text, msg.from));
    }

    if (chat.unread > 0) markChatRead(chat.id);
  }

  async function markChatRead(id) {
    try {
      await apiFetch(`/api/chats/${id}/read`, { method: 'POST' });
      loadChats();
    } catch {}
  }

  function appendMessage(text, from) {
    const empty = chatMessages.querySelector('.empty-state');
    if (empty) empty.remove();
    const div = document.createElement('div');
    div.className = `chat-msg chat-msg--${from}`;
    div.innerHTML = `<div class="chat-msg-bubble">${text}</div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text || !activeChatId) return;

    // Try REST endpoint first (POST /api/admin/send), fallback to WS
    try {
      const res = await apiFetch('/api/admin/send', {
        method: 'POST',
        body: JSON.stringify({ userId: activeChatId, text })
      });
      if (res.ok) {
        appendMessage(text, 'admin');
        chatInput.value = '';
        return;
      }
    } catch {}

    // WebSocket fallback
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'admin_reply', targetChatId: activeChatId, text }));
      appendMessage(text, 'admin');
    }
    chatInput.value = '';
  });

  // ══════════════════════════════════════════════════════════
  //  SETTINGS
  // ══════════════════════════════════════════════════════════
  async function loadSettings() {
    try {
      const res = await apiFetch('/api/settings');
      if (!res.ok) return;
      const settings = await res.json();
      const form = document.getElementById('settings-form');
      Object.keys(settings).forEach(key => {
        const input = form.elements[key];
        if (input) input.value = settings[key];
      });
    } catch {}
  }

  document.getElementById('save-settings-btn').addEventListener('click', async () => {
    const form = document.getElementById('settings-form');
    const data = {};
    Array.from(form.elements).forEach(el => {
      if (el.name) data[el.name] = el.type === 'number' ? Number(el.value) : el.value;
    });
    try {
      const res = await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      if (res.ok) alert('✅ Налаштування збережено!');
    } catch { alert('Помилка збереження'); }
  });

  // ══════════════════════════════════════════════════════════
  //  CRM PROJECTS  —  GET/POST/PUT/DELETE /api/admin/projects
  // ══════════════════════════════════════════════════════════
  const projectsGrid = document.getElementById('admin-projects-grid');
  const prModal      = document.getElementById('project-modal');
  const prForm       = document.getElementById('project-form');

  document.getElementById('add-project-btn').addEventListener('click', () => {
    prForm.reset();
    document.getElementById('pr-id').value = '';
    document.getElementById('pr-modal-title').textContent = 'Новий проект';
    currentTodos = [];
    renderTodos();
    prModal.classList.add('active');
  });

  document.getElementById('pr-close-modal').addEventListener('click', () => prModal.classList.remove('active'));
  document.querySelector('.pr-cancel-modal').addEventListener('click', () => prModal.classList.remove('active'));

  async function loadProjects() {
    try {
      // Try new path first, fallback to old
      const res = await apiFetch('/api/admin/projects').catch(() => apiFetch('/api/projects'));
      if (!res.ok) return;
      renderProjectsAdmin(await res.json());
    } catch {}
  }

  function renderProjectsAdmin(items) {
    projectsGrid.innerHTML = '';
    if (!items.length) {
      projectsGrid.innerHTML = '<div class="empty-state" style="grid-column:1/-1; padding:40px 0;">Немає проектів</div>';
      return;
    }
    items.forEach(item => {
      const statusClass = { active: 'status-active', paused: 'status-paused', completed: 'status-completed' }[item.status] || 'status-active';
      const statusLabel = { active: 'В роботі', paused: 'На паузі', completed: 'Завершено' }[item.status] || item.status;
      const barColor    = { active: '#10b981', paused: '#f59e0b', completed: '#3b82f6' }[item.status] || '#10b981';
      const paid   = item.paid  || 0;
      const price  = item.price || 0;
      const pct    = price > 0 ? Math.min(100, Math.round(paid / price * 100)) : 0;

      const el = document.createElement('div');
      el.className = 'pf-card';
      el.innerHTML = `
        <div class="pf-card-bar" style="background:${barColor}"></div>
        <h4>${item.title}</h4>
        <div class="pf-card-meta" style="margin-bottom:10px;">
          <span class="status-badge ${statusClass}">${statusLabel}</span>
          <span style="margin-left:8px;">👤 ${item.clientName || '—'}</span>
        </div>
        <div class="pf-card-meta">
          💰 $${price} &nbsp;/&nbsp; ✅ $${paid}
          <span style="margin-left:8px; color:${pct>=100?'#34d399':'inherit'}">(${pct}%)</span>
        </div>
        <p style="margin-top:10px;">${item.description || 'Немає опису'}</p>
        <div class="pf-card-actions">
          <button class="btn btn--ghost pr-edit-btn" data-id="${item._id}">✏️ Редагувати</button>
          <button class="btn btn--danger pr-del-btn" data-id="${item._id}">🗑 Видалити</button>
        </div>
      `;
      projectsGrid.appendChild(el);
    });

    projectsGrid.querySelectorAll('.pr-edit-btn').forEach(btn =>
      btn.addEventListener('click', () => editProject(items.find(i => i._id === btn.dataset.id)))
    );
    projectsGrid.querySelectorAll('.pr-del-btn').forEach(btn =>
      btn.addEventListener('click', () => deleteProject(btn.dataset.id))
    );
  }

  function editProject(item) {
    document.getElementById('pr-id').value     = item._id;
    document.getElementById('pr-title').value  = item.title || '';
    document.getElementById('pr-client').value = item.clientName || '';
    document.getElementById('pr-status').value = item.status || 'active';
    document.getElementById('pr-price').value  = item.price || 0;
    document.getElementById('pr-paid').value   = item.paid  || 0;
    document.getElementById('pr-desc').value   = item.description || '';
    currentTodos = item.todos || [];
    renderTodos();
    document.getElementById('pr-modal-title').textContent = 'Редагувати проект';
    prModal.classList.add('active');
  }

  function renderTodos() {
    const list = document.getElementById('pr-todos-list');
    list.innerHTML = '';
    currentTodos.forEach((todo, idx) => {
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:7px;';
      div.innerHTML = `
        <input type="checkbox" ${todo.done ? 'checked' : ''} onchange="window._toggleTodo(${idx})"
          style="accent-color:#10b981;width:16px;height:16px;cursor:pointer;">
        <span style="flex:1;font-size:13px;text-decoration:${todo.done ? 'line-through' : 'none'};
          color:${todo.done ? 'var(--text-muted)' : 'var(--text-primary)'};">${todo.text}</span>
        <button type="button" onclick="window._removeTodo(${idx})"
          style="background:transparent;border:none;color:var(--danger);cursor:pointer;font-size:16px;">×</button>
      `;
      list.appendChild(div);
    });
  }

  window._toggleTodo = (idx) => { currentTodos[idx].done = !currentTodos[idx].done; renderTodos(); };
  window._removeTodo = (idx) => { currentTodos.splice(idx, 1); renderTodos(); };

  document.getElementById('pr-add-todo-btn').addEventListener('click', () => {
    const input = document.getElementById('pr-new-todo');
    const text  = input.value.trim();
    if (text) { currentTodos.push({ text, done: false }); input.value = ''; renderTodos(); }
  });

  prForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id   = document.getElementById('pr-id').value;
    const body = {
      title:       document.getElementById('pr-title').value,
      clientName:  document.getElementById('pr-client').value,
      status:      document.getElementById('pr-status').value,
      price:       Number(document.getElementById('pr-price').value),
      paid:        Number(document.getElementById('pr-paid').value),
      description: document.getElementById('pr-desc').value,
      todos:       currentTodos
    };
    const method = id ? 'PUT' : 'POST';
    // Try new path first, fallback to old
    const url    = id
      ? `/api/admin/projects/${id}`
      : '/api/admin/projects';
    try {
      const res = await apiFetch(url, { method, body: JSON.stringify(body) })
        .catch(() => apiFetch(id ? `/api/projects/${id}` : '/api/projects', { method, body: JSON.stringify(body) }));
      if (res.ok) { prModal.classList.remove('active'); loadProjects(); }
    } catch {}
  });

  async function deleteProject(id) {
    if (!confirm('Видалити цей проект?')) return;
    try {
      await apiFetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
        .catch(() => apiFetch(`/api/projects/${id}`, { method: 'DELETE' }));
      loadProjects();
    } catch {}
  }

  // ══════════════════════════════════════════════════════════
  //  PORTFOLIO
  // ══════════════════════════════════════════════════════════
  const portfolioGrid = document.getElementById('admin-portfolio-grid');
  const pfModal       = document.getElementById('portfolio-modal');
  const pfForm        = document.getElementById('portfolio-form');

  document.getElementById('add-portfolio-btn').addEventListener('click', () => {
    pfForm.reset();
    document.getElementById('pf-id').value = '';
    document.getElementById('pf-modal-title').textContent = 'Додати проект';
    pfModal.classList.add('active');
  });

  document.getElementById('pf-close-modal').addEventListener('click', () => pfModal.classList.remove('active'));
  document.querySelector('.pf-cancel-modal').addEventListener('click', () => pfModal.classList.remove('active'));

  async function loadPortfolio() {
    try {
      const res = await apiFetch('/api/portfolio');
      if (!res.ok) return;
      renderPortfolioAdmin(await res.json());
    } catch {}
  }

  function renderPortfolioAdmin(items) {
    portfolioGrid.innerHTML = '';
    if (!items.length) {
      portfolioGrid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;padding:40px 0;">Немає проектів</div>';
      return;
    }
    items.forEach(item => {
      const id  = item._id || item.id;
      const bar = item.color || '#10b981';
      const el  = document.createElement('div');
      el.className = 'pf-card';
      el.innerHTML = `
        <div class="pf-card-bar" style="background:${bar}"></div>
        <h4>${item.title}</h4>
        <p>${item.description || ''}</p>
        ${item.tags && item.tags.length ? `<div class="pf-card-meta" style="margin-bottom:10px;">🏷 ${item.tags.join(', ')}</div>` : ''}
        ${item.result ? `<div class="pf-card-meta" style="color:#34d399;">📈 ${item.result}</div>` : ''}
        <div class="pf-card-actions">
          <button class="btn btn--ghost pf-edit-btn" data-id="${id}">✏️ Редагувати</button>
          <button class="btn btn--danger pf-del-btn" data-id="${id}">🗑 Видалити</button>
        </div>
      `;
      portfolioGrid.appendChild(el);
    });

    portfolioGrid.querySelectorAll('.pf-edit-btn').forEach(btn =>
      btn.addEventListener('click', () => editPortfolio(items.find(i => (i._id || i.id) === btn.dataset.id)))
    );
    portfolioGrid.querySelectorAll('.pf-del-btn').forEach(btn =>
      btn.addEventListener('click', () => deletePortfolio(btn.dataset.id))
    );
  }

  function editPortfolio(item) {
    document.getElementById('pf-id').value     = item._id || item.id;
    document.getElementById('pf-title').value  = item.title || '';
    document.getElementById('pf-desc').value   = item.description || '';
    document.getElementById('pf-tags').value   = (item.tags || []).join(', ');
    document.getElementById('pf-tech').value   = item.tech || '';
    document.getElementById('pf-result').value = item.result || '';
    document.getElementById('pf-color').value  = item.color || '';
    document.getElementById('pf-link').value   = item.link  || '';
    document.getElementById('pf-modal-title').textContent = 'Редагувати проект';
    pfModal.classList.add('active');
  }

  pfForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id   = document.getElementById('pf-id').value;
    const body = {
      title:       document.getElementById('pf-title').value,
      description: document.getElementById('pf-desc').value,
      tags:        document.getElementById('pf-tags').value.split(',').map(t => t.trim()).filter(Boolean),
      tech:        document.getElementById('pf-tech').value,
      result:      document.getElementById('pf-result').value,
      color:       document.getElementById('pf-color').value,
      link:        document.getElementById('pf-link').value
    };
    const method = id ? 'PUT' : 'POST';
    const url    = id ? `/api/portfolio/${id}` : '/api/portfolio';
    try {
      const res = await apiFetch(url, { method, body: JSON.stringify(body) });
      if (res.ok) { pfModal.classList.remove('active'); loadPortfolio(); }
      else alert('Помилка збереження');
    } catch { alert('Помилка підключення'); }
  });

  async function deletePortfolio(id) {
    if (!confirm('Видалити цей проект?')) return;
    try {
      await apiFetch(`/api/portfolio/${id}`, { method: 'DELETE' });
      loadPortfolio();
    } catch {}
  }

  // ── Close modal on backdrop click ─────────────────────────
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  });

});
