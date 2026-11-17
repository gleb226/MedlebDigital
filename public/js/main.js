document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu
  const burgerBtn = document.getElementById('burger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('.mobile-menu__link');
  
  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener('click', () => {
      const isExpanded = burgerBtn.getAttribute('aria-expanded') === 'true';
      burgerBtn.setAttribute('aria-expanded', !isExpanded);
      burgerBtn.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = isExpanded ? '' : 'hidden';
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      burgerBtn.setAttribute('aria-expanded', 'false');
      burgerBtn.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Theme Handling (System & Manual)
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else if (currentTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  themeToggle?.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (!theme) {
      theme = prefersDarkScheme.matches ? 'dark' : 'light';
    }
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // Reveal Animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.service-card, .about__card, .calc-result-card').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });

  // Fetch Global Settings
  let settings = {};
  async function loadSettings() {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        settings = await res.json();
        applySettings();
      }
    } catch(e) {
      console.warn("Could not load settings.");
    }
  }

  function applySettings() {
    // Name
    const nameEl = document.querySelector('#about-title .text-accent');
    if (nameEl && settings.about_name) {
      document.getElementById('about-title').innerHTML = `Привіт, я ${settings.about_name} — <span class="text-accent">fullstack розробник</span>`;
    }

    // Social Links
    if (settings.social_tg) {
      document.querySelectorAll('[href="https://t.me/medleb_bot"], #link-tg-bot, #footer-link-tg, #header-cta-btn, #mob-cta-btn, #calc-tg-btn').forEach(el => {
        el.href = settings.social_tg;
      });
    }
    if (settings.social_inst) {
      const gitLink = document.getElementById('link-github');
      if (gitLink) {
        gitLink.href = settings.social_inst;
        gitLink.textContent = 'Instagram';
        const cardTitle = document.querySelector('#contact-card-github h3');
        if (cardTitle) cardTitle.textContent = 'Instagram';
        const icon = document.querySelector('#contact-card-github .contact-info-card__icon');
        if (icon) icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>';
      }
      const footerGit = document.getElementById('footer-link-github');
      if (footerGit) {
        footerGit.href = settings.social_inst;
        footerGit.textContent = 'Instagram';
      }
    }
    
    // Calculator Base Prices
    if (settings.price_site_base) document.getElementById('radio-page1').dataset.price = settings.price_site_base;
    updateCalc();
  }
  loadSettings();

  // Portfolio Loading
  const portfolioGrid = document.getElementById('portfolio-grid');
  
  async function loadPortfolio() {
    if (!portfolioGrid) return;
    try {
      const response = await fetch('/api/portfolio');
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      renderPortfolio(data);
    } catch (e) {
      console.warn("Could not load from API, using fallback data");
      renderPortfolio([
        { id: '1', title: 'Medelin', description: 'Медична клініка з онлайн-записом.', tags: ['Сайт'], result: '+40% клієнтів', link: '#', color: '#0ea5e9' },
        { id: '2', title: 'Bot Server', description: 'Бот для управління серверами.', tags: ['Бот', 'Python'], result: 'Автоматизація 24/7', link: '#', color: '#10b981' }
      ]);
    }
  }

  function renderPortfolio(items) {
    if (!portfolioGrid) return;
    portfolioGrid.innerHTML = '';
    if (items.length === 0) {
      portfolioGrid.innerHTML = '<p class="text-muted">Портфоліо поки порожнє.</p>';
      return;
    }
    items.forEach(item => {
      const el = document.createElement('article');
      el.className = 'portfolio-card reveal';
      
      const tagsHtml = (item.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
      const linkHtml = item.link && item.link !== '-' ? `<a href="${item.link}" class="portfolio-card__link" target="_blank" rel="noopener noreferrer">Відкрити <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>` : '';
      const resultHtml = item.result && item.result !== '-' ? `<div class="portfolio-card__result"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>${item.result}</div>` : '';

      el.innerHTML = `
        <div class="portfolio-card__glow" style="--accent-subtle: ${item.color ? item.color + '33' : 'rgba(255,107,0,0.2)'}"></div>
        <div class="portfolio-card__body">
          <div class="portfolio-card__tags">${tagsHtml}</div>
          <h3 class="portfolio-card__title">${item.title}</h3>
          <p class="portfolio-card__desc">${item.description}</p>
          <div class="portfolio-card__meta">
            ${resultHtml}
            ${linkHtml}
          </div>
        </div>
      `;
      portfolioGrid.appendChild(el);
      observer.observe(el);
    });
  }
  loadPortfolio();

  // Calculator Logic
  const calcForm = document.getElementById('calculator-form');
  const priceDisplay = document.getElementById('calc-price-value');
  const typeRadios = document.querySelectorAll('input[name="project_type"]');
  const extraCheckboxes = document.querySelectorAll('.calc-checkbox__input');

  const steps = {
    site: document.getElementById('calc-step-site-pages'),
    bot: document.getElementById('calc-step-bot-features'),
    parser: document.getElementById('calc-step-parser-type'),
    extras: document.getElementById('calc-step-extras')
  };

  let currentBase = 0;

  function updateCalc() {
    const type = document.querySelector('input[name="project_type"]:checked')?.value;
    if (!type) return;

    // Hide all steps
    Object.values(steps).forEach(s => s && s.classList.add('calc-step--hidden'));
    if (steps.extras) steps.extras.classList.remove('calc-step--hidden');

    let total = 0;

    if (type === 'site') {
      steps.site?.classList.remove('calc-step--hidden');
      const pagePrice = document.querySelector('input[name="site_pages"]:checked')?.dataset?.price || settings.price_site_base || 200;
      total += parseInt(pagePrice, 10);
    } else if (type === 'bot') {
      steps.bot?.classList.remove('calc-step--hidden');
      total += parseInt(settings.price_bot_base || 300, 10); // Base bot price
      document.querySelectorAll('#calc-step-bot-features input:checked').forEach(cb => {
        total += parseInt(cb.value, 10);
      });
    } else if (type === 'parser') {
      steps.parser?.classList.remove('calc-step--hidden');
      const pPrice = document.querySelector('input[name="parser_type"]:checked')?.dataset?.price || settings.price_parser_base || 75;
      total += parseInt(pPrice, 10);
    } else if (type === 'automation') {
      total += parseInt(settings.price_auto_base || 350, 10);
    } else if (type === 'complex') {
      total += parseInt(settings.price_complex_base || 750, 10);
    }

    // Add extras
    extraCheckboxes.forEach(cb => {
      if (cb.checked) total += parseInt(cb.value, 10);
    });

    if (priceDisplay) {
      priceDisplay.textContent = total;
    }
  }

  if (calcForm) {
    calcForm.addEventListener('change', updateCalc);
  }

  // Live Chat Logic
  const chatMessages = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatStatus = document.getElementById('chat-status');
  let ws = null;
  let chatId = localStorage.getItem('chatId');

  function connectChat() {
    if (!chatMessages) return;
    
    const host = window.location.hostname === '127.0.0.1' && window.location.port === '5500' ? 'localhost:3000' : window.location.host;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    try {
      ws = new WebSocket(`${protocol}//${host}`);
    } catch(e) {
      chatStatus.textContent = 'Офлайн';
      chatStatus.className = 'chat-widget__status offline';
      return;
    }

    ws.onopen = () => {
      chatStatus.textContent = 'Онлайн';
      chatStatus.className = 'chat-widget__status online';
      ws.send(JSON.stringify({ type: 'init', chatId }));
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'init') {
        chatId = data.chatId;
        localStorage.setItem('chatId', chatId);
        renderMessages(data.messages);
      } else if (data.type === 'message') {
        appendMessage(data.message.text, 'admin');
      }
    };

    ws.onclose = () => {
      chatStatus.textContent = 'Офлайн';
      chatStatus.className = 'chat-widget__status offline';
      setTimeout(connectChat, 5000);
    };
  }

  function renderMessages(messages) {
    if (!chatMessages) return;
    chatMessages.innerHTML = '';
    if (!messages || messages.length === 0) {
      appendMessage('Привіт! Чим можу допомогти?', 'admin');
      return;
    }
    messages.forEach(msg => {
      appendMessage(msg.text, msg.from);
    });
  }

  function appendMessage(text, from) {
    if (!chatMessages) return;
    const div = document.createElement('div');
    div.className = `chat-message chat-message--${from}`;
    div.innerHTML = `<div class="chat-message__content">${text}</div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      appendMessage(text, 'client');
      chatInput.value = '';

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'message', text }));
      }
    });
    
    // Lazy connect
    const chatObserver = new IntersectionObserver((entries) => {
      if(entries[0].isIntersecting) {
        connectChat();
        chatObserver.disconnect();
      }
    });
    chatObserver.observe(document.getElementById('chat-widget'));
  }
});
