import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Rocket, Briefcase, Calculator, Sparkles, Terminal,
  Cpu, Smartphone, ShieldCheck, Zap, ArrowRight, Layers,
  Send, PhoneCall, CheckCircle2, Globe, Code2, Server,
  Menu, X, ChevronRight, Bot, Building2, ShoppingBag,
  Globe2, Clock, DollarSign, RefreshCw, Database,
  Sun, Moon, Check, Compass, Eye
} from 'lucide-react';

import TechCanvas from './components/TechCanvas';
import PortfolioShowcase from './components/PortfolioShowcase';
import CompaniesCarousel from './components/CompaniesCarousel';
import TechnologyCarousel from './components/TechnologyCarousel';
import ClientLogoRail from './components/ClientLogoRail';
import ServicesSection from './components/ServicesSection';
import { useTheme } from './context/ThemeContext';
import { useLanguage } from './context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t, languages } = useLanguage();

  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [themeTransition, setThemeTransition] = useState(null);

  const handleThemeToggle = (event) => {
    // Origin-aware reveal: the new theme expands from the control the visitor used.
    const rect = event.currentTarget.getBoundingClientRect();
    setThemeTransition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      color: isLight ? '#030712' : '#faf6ee',
    });
    toggleTheme();
    window.setTimeout(() => setThemeTransition(null), 760);
  };

  // Scroll spy
  useEffect(() => {
    const ids = ['hero', 'portfolio', 'process', 'services', 'calculator', 'ai-architect', 'contacts'];
    const obs = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const o = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: '-40% 0px -55% 0px' }
      );
      o.observe(el);
      obs.push(o);
    });
    return () => obs.forEach((o) => o.disconnect());
  }, []);

  // GSAP NestJS Pinning Pipeline
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.process-step-card').forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              end: 'top 45%',
              scrub: 0.6
            }
          }
        );
      });

      ScrollTrigger.create({
        trigger: '#process-container',
        start: 'top 15%',
        end: 'bottom 70%',
        pin: '#process-pinned-heading',
        pinSpacing: false
      });
    });
    return () => ctx.revert();
  }, []);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Calculator State
  const [calcGoal, setCalcGoal] = useState('company');
  const [calcMobile, setCalcMobile] = useState(true);
  const [calcBot, setCalcBot] = useState(true);
  const [calcPay, setCalcPay] = useState(true);
  const [calcUrgency, setCalcUrgency] = useState('standard');

  const calcPrice = (() => {
    let p = calcGoal === 'store' ? 1200 : (calcGoal === 'startup' ? 2200 : 1500);
    let d = calcGoal === 'store' ? 10 : (calcGoal === 'startup' ? 18 : 14);
    if (calcMobile) { p += 950; d += 7; }
    if (calcBot) { p += 450; d += 3; }
    if (calcPay) { p += 350; d += 2; }
    if (calcUrgency === 'express') {
      p = Math.round(p * 1.25);
      d = Math.max(7, Math.round(d * 0.65));
    }
    return { price: p, days: d };
  })();

  // AI Architect State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const runAi = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResult(null);

    setTimeout(() => {
      setAiLoading(false);
      setAiResult({
        title: 'Індивідуальний цифровий комплекс Medleb',
        architectureType: 'Автономна екосистема для масштабування бізнесу',
        frontend: 'Сучасний веб-сайт із миттєвим завантаженням та оптимізацією під Google',
        mobile: 'Мобільний додаток для iOS та Android із push-сповіщеннями',
        backend: 'Надійна система управління замовленнями, базою клієнтів та складом',
        enterpriseCore: 'Безпечні фінансові розрахунки та автоматичні виписки',
        aiPipeline: 'Розумний онлайн-консультант 24/7 для підтримки клієнтів',
        database: 'Захищена хмарна база даних з резервним копіюванням щогодини',
        sla: '99.99% безперебійна робота та цілодобовий моніторинг'
      });
    }, 1300);
  };

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen text-[var(--text-primary)] flex flex-col relative font-sans selection:bg-emerald-500 selection:text-white ${
      isLight ? 'bg-[#faf6ee]' : 'bg-[#030712]'
    }`}>
      {themeTransition && (
        <span
          aria-hidden="true"
          className="theme-reveal"
          style={{ '--reveal-x': `${themeTransition.x}px`, '--reveal-y': `${themeTransition.y}px`, '--reveal-color': themeTransition.color }}
        />
      )}
      {/* 3D PARTICLE CANVAS (Dark & Light adapted) */}
      <TechCanvas />

      {/* ═══════ TOP NAVIGATION BAR ═══════ */}
      {isLight ? (
        /* LIGHT THEME: Clean consulting firm header (no pill container, elegant typography, minimal border) */
        <header className="sticky top-0 z-40 border-b border-[#d8ccb4] bg-[#faf6ee]/90 px-6 sm:px-10 lg:px-16 py-4 flex items-center justify-between transition-colors shadow-[0_12px_30px_rgba(90,74,42,0.06)] backdrop-blur-2xl">
          <div onClick={() => scrollTo('hero')} className="flex items-center gap-3 cursor-pointer group shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#1a1208] flex items-center justify-center font-serif font-black text-[#faf6ee] text-base shadow-lg shadow-[#1a1208]/15 group-hover:scale-105 transition-transform">
              M
            </div>
            <div>
              <div className="font-serif font-black text-xl tracking-tight text-[#1a1208]">
                MEDLEB<span className="text-[#059669]">.</span>DIGITAL
              </div>
              <div className="text-[10px] text-[#8a7250] uppercase tracking-[0.18em] font-medium">
                Digital studio
              </div>
            </div>
          </div>

          {/* Desktop Navigation: Underline links instead of pill container */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { id: 'hero', label: t('nav.home') },
              { id: 'portfolio', label: t('nav.portfolio') },
              { id: 'process', label: t('nav.process') },
              { id: 'calculator', label: t('nav.calculator') },
              { id: 'ai-architect', label: t('nav.ai') },
              { id: 'contacts', label: t('nav.contacts') },
            ].map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`relative py-1 text-xs uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-[#059669] border-b-2 border-[#059669]'
                      : 'text-[#5a4a2a] hover:text-[#1a1208]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right tools: Language Selector & Theme Switcher */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="px-3 py-1.5 rounded-lg bg-[#fff8ed] border border-[#d8ccb4] text-xs font-bold flex items-center gap-1.5 text-[#5a4a2a] hover:text-[#1a1208] shadow-xs"
                aria-label="Language selector"
              >
                <Globe className="w-3.5 h-3.5 text-[#059669]" />
                <span className="uppercase">{lang}</span>
              </button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl bg-[#fff8ed] border border-[#d8ccb4] shadow-xl p-2 z-50 grid grid-cols-1 gap-1 max-h-72 overflow-y-auto"
                  >
                    {Object.entries(languages).map(([code, name]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setLang(code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 rounded-lg text-left text-xs font-medium flex items-center justify-between transition-colors ${
                          lang === code
                            ? 'bg-[#059669] text-white font-bold'
                            : 'text-[#5a4a2a] hover:bg-[#f1eadc] hover:text-[#1a1208]'
                        }`}
                      >
                        <span>{name}</span>
                        {lang === code && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-lg bg-[#fff8ed] border border-[#d8ccb4] text-[#059669] hover:bg-[#f1eadc] transition-all shadow-xs"
              title="Перемкнути на темну тему"
            >
              <Moon className="w-4 h-4 text-[#059669]" />
            </button>
          </div>
        </header>
      ) : (
        /* DARK THEME: Cyber pill navigation */
        <header className="sticky top-0 z-40 backdrop-blur-2xl border-b border-zinc-800 bg-[#030712]/80 px-4 sm:px-8 lg:px-12 py-3 flex items-center justify-between transition-colors">
          <div onClick={() => scrollTo('hero')} className="flex items-center gap-3 cursor-pointer group shrink-0">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white shadow-lg group-hover:scale-105 transition-transform bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-emerald-500/30">
              M
            </div>
            <div className="hidden sm:block">
              <div className="font-extrabold text-lg tracking-wider">
                MEDLEB<span className="text-emerald-500">.DIGITAL</span>
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Full-Stack & High-Load Systems
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 border p-1 rounded-2xl shadow-inner bg-zinc-900/90 border-zinc-800">
            {[
              { id: 'hero', label: t('nav.home'), icon: Rocket },
              { id: 'portfolio', label: t('nav.portfolio'), icon: Briefcase },
              { id: 'process', label: t('nav.process'), icon: Layers },
              { id: 'calculator', label: t('nav.calculator'), icon: Calculator },
              { id: 'ai-architect', label: t('nav.ai'), icon: Sparkles },
              { id: 'contacts', label: t('nav.contacts'), icon: PhoneCall },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                    isActive ? 'text-white font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 rounded-xl shadow-md bg-gradient-to-r from-emerald-600 to-teal-600"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] text-xs font-bold flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-sm"
                aria-label="Language selector"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span className="uppercase">{lang}</span>
              </button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-main)] shadow-2xl p-2 z-50 grid grid-cols-1 gap-1 max-h-72 overflow-y-auto"
                  >
                    {Object.entries(languages).map(([code, name]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setLang(code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors ${
                          lang === code
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <span>{name}</span>
                        {lang === code && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-emerald-500 transition-all active:scale-95 shadow-sm"
              title="Увімкнути теплий кремово-бежевий дизайн"
            >
              <Sun className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </header>
      )}

      {/* ═══════ FLOATING MOBILE MENU ═══════ */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-cyan-600 text-white flex items-center justify-center shadow-2xl border border-white/20"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden bg-black/85 backdrop-blur-2xl flex flex-col justify-between p-6 pt-16 text-white"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="font-extrabold text-base">
                MEDLEB<span className="text-emerald-400">.DIGITAL</span>
              </span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 my-auto">
              {[
                { id: 'hero', label: t('nav.home'), icon: Rocket },
                { id: 'portfolio', label: t('nav.portfolio'), icon: Briefcase },
                { id: 'process', label: t('nav.process'), icon: Layers },
                { id: 'calculator', label: t('nav.calculator'), icon: Calculator },
                { id: 'ai-architect', label: t('nav.ai'), icon: Sparkles },
                { id: 'contacts', label: t('nav.contacts'), icon: PhoneCall },
              ].map((item, idx) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => scrollTo(item.id)}
                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer ${
                      active
                        ? 'bg-emerald-500/20 border-emerald-500 text-white'
                        : 'bg-white/5 border-white/10 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${active ? 'bg-emerald-500 text-white' : 'bg-white/10 text-emerald-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  </motion.div>
                );
              })}
            </div>

            <div className="border-t border-white/10 pt-4 text-xs text-zinc-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Онлайн
              </span>
              <button onClick={() => scrollTo('contacts')} className="text-emerald-400 font-bold">
                Написати нам →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ MAIN VIEWPORT CONTENT ═══════ */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-20">

        {/* 1. HERO SECTION */}
        {isLight ? (
          /* LIGHT THEME HERO: Asymmetrical 2-column layout (Consulting & Venture Studio style) */
          <section id="hero" className="min-h-[85vh] flex flex-col justify-center py-12 lg:py-20 border-b border-[#e5decb]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Bold Editorial Typography */}
              <div className="lg:col-span-7 space-y-8 text-left">
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight text-[#1a1208] leading-[1.08]">
                    {t('hero.title1')}{' '}
                    <span className="italic underline decoration-[#059669] decoration-wavy decoration-2">
                      {t('hero.title2')}
                    </span>
                  </h1>

                  <p className="text-[#5a4a2a] text-lg sm:text-xl max-w-xl leading-relaxed font-normal">
                    {t('hero.subtitle')}
                  </p>
                </div>

                {/* Left-aligned CTAs */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => scrollTo('calculator')}
                    className="px-8 py-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 cursor-pointer"
                  >
                    <span>{t('hero.cta1')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => scrollTo('portfolio')}
                    className="px-8 py-4 rounded-xl bg-[#fff8ed] hover:bg-[#f1eadc] border-2 border-[#1a1208] text-[#1a1208] font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Briefcase className="w-4 h-4 text-[#059669]" />
                    <span>{t('hero.cta2')}</span>
                  </button>
                </div>

                {/* Stat pills */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#e5decb] max-w-lg">
                  {[
                    { val: t('hero.stat1.val'), label: t('hero.stat1.label') },
                    { val: t('hero.stat2.val'), label: t('hero.stat2.label') },
                    { val: t('hero.stat3.val'), label: t('hero.stat3.label') },
                  ].map((st, i) => (
                    <div key={i} className="space-y-0.5">
                      <div className="text-2xl font-black font-serif text-[#1a1208]">{st.val}</div>
                      <div className="text-[11px] text-[#8a7250] uppercase tracking-wider font-semibold">{st.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Editorial Architecture Card (Not AI code box) */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border-2 border-[#d8ccb4] bg-[#fff8ed] p-8 shadow-xl space-y-6 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#e5decb] pb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#059669]">MEDLEB DIGITAL</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#059669]/10 text-[#059669] font-bold">ПІД КЛЮЧ</span>
                  </div>

                  <div className="space-y-4 text-left">
                    <h3 className="font-serif font-black text-2xl text-[#1a1208]">Ваша ідея — зрозумілий продукт, готовий до роботи.</h3>
                    <p className="text-xs text-[#5a4a2a] leading-relaxed">Обговорюємо задачу без складних слів, створюємо зручний дизайн, запускаємо та залишаємося поруч після старту.</p>
                  </div>

                  {/* Architecture spec checklist */}
                  <div className="space-y-2.5 pt-2 text-left">
                    {[
                      { title: 'Зрозумілий план', desc: 'Спочатку узгоджуємо цілі, бюджет і строки.' },
                      { title: 'Дизайн для ваших клієнтів', desc: 'Створюємо вигляд, який допомагає продавати.' },
                      { title: 'Усе в одному місці', desc: 'Заявки, оплати, повідомлення та потрібні сервіси.' },
                      { title: 'Надійна робота', desc: 'Перевіряємо кожну деталь перед запуском.' },
                      { title: 'Підтримка після запуску', desc: 'Залишаємось на зв’язку та допомагаємо розвивати продукт.' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg bg-[#faf6ee] border border-[#e5decb]">
                        <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-[#1a1208]">{item.title}</div>
                          <div className="text-[11px] text-[#8a7250]">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[#e5decb] flex items-center justify-between text-xs text-[#5a4a2a]">
                    <span className="font-semibold">Фіксовані терміни за договором</span>
                    <span className="text-[#059669] font-bold">NDA включено</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          /* DARK THEME HERO: Futuristic Cyber Terminal */
          <section id="hero" className="min-h-[85vh] flex flex-col items-center justify-center text-center gap-8 py-14">
            <Reveal delay={0.1}>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] max-w-5xl">
                {t('hero.title1')}{' '}
                <span className="bg-gradient-to-r bg-clip-text text-transparent from-emerald-400 via-teal-400 to-cyan-400">
                  {t('hero.title2')}
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="text-[var(--text-secondary)] text-base sm:text-xl max-w-2xl leading-relaxed font-normal">
                {t('hero.subtitle')}
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => scrollTo('calculator')}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3"
                >
                  <span>{t('hero.cta1')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => scrollTo('portfolio')}
                  className="px-8 py-4 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-main)] hover:border-emerald-500 text-[var(--text-primary)] font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 shadow-sm"
                >
                  <Briefcase className="w-4 h-4 text-emerald-500" />
                  <span>{t('hero.cta2')}</span>
                </button>
              </div>
            </Reveal>

            {/* Stats Bar */}
            <Reveal delay={0.4}>
              <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
                {[
                  { val: t('hero.stat1.val'), label: t('hero.stat1.label') },
                  { val: t('hero.stat2.val'), label: t('hero.stat2.label') },
                  { val: t('hero.stat3.val'), label: t('hero.stat3.label') },
                ].map((st, i) => (
                  <div key={i} className="px-5 py-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] text-center min-w-[130px] shadow-sm">
                    <div className="text-xl font-black font-mono text-emerald-400">{st.val}</div>
                    <div className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider mt-0.5">{st.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Same message as the light theme, expressed in a different visual style. */}
            <Reveal delay={0.5} className="w-full max-w-4xl">
              <div className="rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/10 via-[var(--bg-card)] to-cyan-500/10 shadow-2xl p-7 sm:p-10 text-left">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-white" /></div>
                  <span className="text-emerald-300 text-xs font-bold tracking-[0.18em] uppercase">Рішення під ключ</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black mb-4">Ваша ідея — зрозумілий продукт, готовий до роботи.</h2>
                <p className="text-[var(--text-secondary)] leading-relaxed max-w-2xl">Обговорюємо задачу без складних слів, створюємо зручний дизайн, запускаємо та залишаємося поруч після старту.</p>
                <div className="grid sm:grid-cols-2 gap-3 mt-7">
                  {['Зрозумілий план і зафіксовані строки', 'Дизайн для ваших клієнтів', 'Заявки, оплати й повідомлення в одному місці', 'Перевірка перед запуском', 'Підтримка після запуску'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />{item}</div>
                  ))}
                </div>
              </div>
            </Reveal>
            <div className="hidden">
              <div className="rounded-3xl border border-[var(--border-main)] bg-[var(--terminal-bg)] shadow-2xl overflow-hidden backdrop-blur-xl">
                <div className="h-[2px] border-beam-anim" />
                <div className="bg-[var(--bg-elevated)] px-5 py-3 border-b border-[var(--border-main)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-3 text-xs font-mono text-[var(--text-secondary)] flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      medleb-cluster :: orchestrator.ts
                    </span>
                  </div>
                  <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    0.3ms ping
                  </div>
                </div>

                <div className="p-6 font-mono text-xs sm:text-sm text-[var(--text-secondary)] space-y-2 text-left overflow-x-auto">
                  <p className="text-[var(--text-tertiary)]">// Next.js 15 + NestJS + React Native + Go Fiber + C# .NET 9 + Python AI</p>
                  <p>
                    <span className="text-emerald-400 font-bold">import</span> &#123; <span className="text-teal-400">NextHydration</span>, <span className="text-teal-400">NestMicroserviceHub</span>, <span className="text-teal-400">ReactNativeMobileSync</span> &#125; <span className="text-emerald-400 font-bold">from</span> <span className="text-cyan-400">'@medleb/core'</span>;
                  </p>
                  <p>
                    <span className="text-emerald-400 font-bold">@ClusterRegistry</span>(&#123;
                  </p>
                  <div className="pl-6 space-y-0.5">
                    <p>webClient: <span className="text-teal-400">NextJs15SSR</span>, <span className="text-[var(--text-tertiary)]">// 100/100 Core Web Vitals</span></p>
                    <p>mobileBridge: <span className="text-teal-400">ReactNativeExpo</span>, <span className="text-[var(--text-tertiary)]">// iOS & Android 120 FPS</span></p>
                    <p>gateway: <span className="text-teal-400">NestJsWebSocketGateway</span>,</p>
                    <p>highloadEngine: <span className="text-teal-400">GolangFiberFastProxy</span>, <span className="text-[var(--text-tertiary)]">// 100K req/s</span></p>
                    <p>fintechCore: <span className="text-teal-400">DotNetCore9BankingVault</span>,</p>
                    <p>aiWorker: <span className="text-teal-400">PythonFastApiAiWorker</span> <span className="text-[var(--text-tertiary)]">// RAG + LLM</span></p>
                  </div>
                  <p>&#125;)</p>
                  <p className="text-emerald-400 flex items-center gap-2 pt-1 font-bold">
                    <Zap className="w-4 h-4 text-cyan-500 animate-bounce" />
                    <span>✓ 100/100 PageSpeed. Нульовий downtime при оновленнях.</span>
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Technology and client proof rails */}
        <TechnologyCarousel />
        <ClientLogoRail />

        {/* 2. REAL CAROUSEL: 2-3 COMPANIES AT A TIME WITH NEXT/PREV */}
        <CompaniesCarousel />

        {/* 3. RICH PORTFOLIO SHOWCASE */}
        <PortfolioShowcase />

        {/* 4. HOW WE WORK (Clean Timeline in Light, Pinned GSAP in Dark) */}
        {isLight ? (
          <section id="process" className="py-16 border-b border-[#e5decb]">
            <div className="space-y-4 mb-12 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-[#059669]">
                Етапи створення проекту
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#1a1208]">
                Як ми працюємо: від ідеї до першого прибутку
              </h2>
              <p className="text-sm text-[#5a4a2a] max-w-2xl leading-relaxed">
                Повна прозорість для бізнесу: ніяких затримок, щотижневі демонстрації результату та прямий контакт у месенджері.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { step: '01', title: 'Обговорення та фіксований кошторис', desc: 'Узгоджуємо всі ваші вимоги людською мовою. Фіксуємо кінцеву вартість та точні дати здачі в офіційному договорі.' },
                { step: '02', title: 'Індивідуальний дизайн під клієнтів', desc: 'Створюємо зручний, стильний вигляд сайту чи додатку, оптимізований під продажі зі смартфонів та комп’ютерів.' },
                { step: '03', title: 'Розробка та підключення систем', desc: 'Створюємо швидкий ресурс, налаштовуємо прийом платежів, підключаємо онлайн-чат та ботів для автоматизації замовлень.' },
                { step: '04', title: 'Перевірка якості та навантаження', desc: 'Тестуємо кожен розділ, перевіряємо швидкість відкриття та надійний захист даних від будь-яких збоїв.' },
                { step: '05', title: 'Запуск проекту & 1 рік гарантії', desc: 'Публікуємо проект у мережі, навчаємо вашу команду користуватися адмін-панеллю та безкоштовно підтримуємо цілий рік.' },
              ].map((s, idx) => (
                <div 
                  key={idx}
                  className="p-6 rounded-xl border border-[#d8ccb4] bg-[#fff8ed] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-[#059669] transition-colors"
                >
                  <div className="flex items-center gap-5">
                    <span className="text-2xl font-serif font-black text-[#059669] shrink-0">{s.step}</span>
                    <div className="text-left">
                      <h3 className="font-bold text-base text-[#1a1208] mb-1">{s.title}</h3>
                      <p className="text-xs sm:text-sm text-[#5a4a2a] leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#059669] bg-[#059669]/10 px-3 py-1 rounded-full shrink-0">
                    Етап {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section id="process" className="py-16">
            <Reveal>
              <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
                  <Layers className="w-3.5 h-3.5" />
                  {t('process.badge')}
                </div>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                  {t('process.title')}{' '}
                  <span className="text-emerald-400">{t('process.titleAccent')}</span>
                </h2>
              </div>
            </Reveal>

            <div id="process-container" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div id="process-pinned-heading" className="lg:col-span-4">
                <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-4 shadow-xl">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-cyan-600 flex items-center justify-center text-white shadow-lg float-slow">
                    <Rocket className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black">Від ідеї до першого прибутку</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Повна прозорість: регулярні демо результату кожні 5-7 днів і прямий контакт з командою в Telegram.
                  </p>
                  <div className="h-1.5 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full w-full" />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
                {[
                  { step: '01', title: 'Обговорення вимог & Кошторис', desc: 'Узгоджуємо бізнес-цілі, формуємо чітке технічне завдання, фіксуємо фінальну вартість та терміни в договорі.' },
                  { step: '02', title: 'Індивідуальний UI/UX дизайн', desc: 'Розробляємо адаптивний інтерфейс під смартфони, планшети та великі екрани для максимальних продажів.' },
                  { step: '03', title: 'Розробка та інтеграція сервісів', desc: 'Створюємо швидкий та стабільний продукт. Підключаємо платіжні шлюзи, сповіщення та ботів.' },
                  { step: '04', title: 'Тестування надійності & Безпека', desc: 'Перевірка під великим навантаженням, захист від вразливостей, налаштування резервних копій.' },
                  { step: '05', title: 'Реліз & 1 рік гарантійної підтримки', desc: 'Запуск проекту на захищеному сервері або в App Store / Google Play, безкоштовний супровід.' },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className="process-step-card p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-main)] flex gap-6 items-start hover:border-emerald-500 transition-all shadow-md"
                  >
                    <div className="text-3xl font-black font-mono text-emerald-500/40 shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg mb-1">{s.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 5. SERVICES */}
        <ServicesSection />

        {/* 6. BUSINESS CALCULATOR */}
        <section id="calculator" className="py-16 space-y-10">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <DollarSign className="w-3.5 h-3.5" />
                {t('calc.badge')}
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                {t('calc.title')}{' '}
                <span className="text-emerald-600 dark:text-emerald-400">{t('calc.titleAccent')}</span>
              </h2>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                {t('calc.subtitle')}
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-8 bg-[var(--bg-card)] border border-[var(--border-main)] p-6 sm:p-8 rounded-3xl shadow-xl">
              <div className="space-y-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                  1. Що саме потрібно вашому бізнесу?
                </label>
                <div className="space-y-3">
                  {[
                    { id: 'store', icon: ShoppingBag, title: 'Інтернет-магазин / Маркетплейс', desc: 'Каталог товарів, кошик, оплата картками онлайн, сповіщення про замовлення.' },
                    { id: 'company', icon: Building2, title: 'Корпоративний сайт / Сервіс компанії', desc: 'Презентабельний сайт компанії, особисті кабінети клієнтів, облік замовлень.' },
                    { id: 'startup', icon: Globe2, title: 'Онлайн-стартап / Складна платформа', desc: 'Нестандартний сервіс з високим навантаженням та складною базою даних.' },
                  ].map((g) => {
                    const Icon = g.icon;
                    const isSel = calcGoal === g.id;
                    return (
                      <div
                        key={g.id}
                        onClick={() => setCalcGoal(g.id)}
                        className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                          isSel
                            ? 'bg-emerald-500/15 border-emerald-500 text-[var(--text-primary)] shadow-md'
                            : 'bg-[var(--bg-elevated)] border-[var(--border-main)] text-[var(--text-secondary)] hover:border-emerald-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${isSel ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)]'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[var(--text-primary)]">{g.title}</div>
                            <div className="text-xs text-[var(--text-secondary)] mt-0.5">{g.desc}</div>
                          </div>
                        </div>
                        {isSel && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                  2. Додаткові інструменти
                </label>
                <div className="space-y-3">
                  {[
                    { active: calcMobile, toggle: () => setCalcMobile(!calcMobile), icon: Smartphone, title: 'Мобільний додаток (App Store & Google Play)', sub: 'Клієнти встановлюють додаток на телефон та отримують push-сповіщення.' },
                    { active: calcBot, toggle: () => setCalcBot(!calcBot), icon: Bot, title: 'Telegram-бот або ШІ-помічник для заявок', sub: 'Автоматичний прийом замовлень 24/7 у месенджері.' },
                    { active: calcPay, toggle: () => setCalcPay(!calcPay), icon: DollarSign, title: 'Онлайн-оплата (Apple Pay, Google Pay, LiqPay, Stripe)', sub: 'Гроші надходять безпосередньо на ваш банківський рахунок.' },
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        onClick={item.toggle}
                        className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                          item.active
                            ? 'bg-emerald-500/15 border-emerald-500 text-[var(--text-primary)] shadow-md'
                            : 'bg-[var(--bg-elevated)] border-[var(--border-main)] text-[var(--text-secondary)] hover:border-emerald-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`p-2.5 rounded-xl ${item.active ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)]'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">{item.title}</div>
                            <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{item.sub}</div>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          item.active ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-[var(--border-main)]'
                        }`}>
                          {item.active && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                  3. Терміни запуску
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCalcUrgency('standard')}
                    className={`p-3.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      calcUrgency === 'standard'
                        ? 'bg-emerald-500/20 border-emerald-500 text-[var(--text-primary)]'
                        : 'bg-[var(--bg-elevated)] border-[var(--border-main)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <div>Стандартний темп</div>
                    <div className="text-[10px] text-[var(--text-tertiary)] font-normal mt-0.5">Повне тестування та аудит</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcUrgency('express')}
                    className={`p-3.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      calcUrgency === 'express'
                        ? 'bg-emerald-500/20 border-emerald-500 text-[var(--text-primary)]'
                        : 'bg-[var(--bg-elevated)] border-[var(--border-main)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <div>⚡ Експрес-спринт (-35% часу)</div>
                    <div className="text-[10px] text-[var(--text-tertiary)] font-normal mt-0.5">Виділена команда під реліз</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-main)] sticky top-24 space-y-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Кошторис</span>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-bold">
                    Фіксована ціна
                  </span>
                </div>

                <div>
                  <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Бюджет від:</div>
                  <div className="text-5xl font-black font-mono mt-1 text-emerald-600 dark:text-emerald-400">
                    ${calcPrice.price}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm py-2 border-t border-[var(--border-main)]">
                  <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    Термін готовності:
                  </span>
                  <span className="font-bold font-mono">{calcPrice.days} робочих днів</span>
                </div>

                <div className="flex items-center justify-between text-sm py-2 border-t border-[var(--border-main)]">
                  <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Гарантія:
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">1 рік супроводу</span>
                </div>

                <button
                  type="button"
                  onClick={() => scrollTo('contacts')}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 transition-all active:scale-95"
                >
                  Забронювати команду на цей проект →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 6. AI ARCHITECT */}
        <section id="ai-architect" className="py-16 space-y-10">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <Bot className="w-4 h-4" />
                {t('ai.badge')}
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                {t('ai.title')}{' '}
                <span className="text-emerald-600 dark:text-emerald-400">{t('ai.titleAccent')}</span>
              </h2>
            </div>
          </Reveal>

          <Reveal className="max-w-4xl mx-auto">
            <form onSubmit={runAi} className="relative">
              <textarea
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Опишіть проект своїми словами. Наприклад: 'Хочу сервіс оренди авто з додатком для клієнтів, онлайн-оплатою та адмінкою'..."
                className="w-full rounded-3xl bg-[var(--bg-card)] border border-[var(--border-main)] focus:border-emerald-500 text-[var(--text-primary)] p-6 text-sm outline-none transition-all resize-none shadow-xl"
              />
              <div className="absolute bottom-4 right-4">
                <button
                  type="submit"
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Генерую архітектуру...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Згенерувати архітектуру</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </Reveal>

          <AnimatePresence>
            {aiResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-emerald-500/40 shadow-2xl space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-main)] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-500">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg">{aiResult.title}</h3>
                      <div className="text-xs text-emerald-500 font-mono">{aiResult.architectureType}</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-emerald-500 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    {aiResult.sla}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Веб-платформа', val: aiResult.frontend, icon: Terminal },
                    { label: 'Мобільний додаток', val: aiResult.mobile, icon: Smartphone },
                    { label: 'Серверна система', val: aiResult.backend, icon: Layers },
                    { label: 'Фінансова безпека', val: aiResult.enterpriseCore, icon: ShieldCheck },
                    { label: 'ШІ-автоматизація', val: aiResult.aiPipeline, icon: Sparkles },
                    { label: 'Збереження даних', val: aiResult.database, icon: Database },
                  ].map((l, i) => {
                    const Icon = l.icon;
                    return (
                      <div key={i} className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-main)] space-y-1">
                        <div className="text-[11px] font-mono uppercase text-emerald-500 flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5" />
                          {l.label}
                        </div>
                        <div className="font-bold text-xs sm:text-sm">{l.val}</div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 7. CONTACTS */}
        <section id="contacts" className="py-16">
          <Reveal>
            <div className="p-8 sm:p-12 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-2xl space-y-8 relative overflow-hidden">
              <div className="h-[2px] border-beam-anim absolute top-0 left-0 right-0" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--border-main)] pb-8">
                <div className="space-y-2 max-w-xl">
                  <span className="text-xs font-mono text-emerald-500 font-bold uppercase tracking-wider">
                    Розпочати співпрацю
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black">{t('contacts.title')}</h2>
                  <p className="text-[var(--text-secondary)] text-sm">{t('contacts.subtitle')}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://t.me"
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3.5 rounded-2xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-main)] font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                  >
                    <Send className="w-4 h-4 text-emerald-500" />
                    <span>Telegram</span>
                  </a>
                  <button
                    onClick={() => scrollTo('calculator')}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Калькулятор</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[var(--text-secondary)]">
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-main)] flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>Офіційний договір та підписання NDA перед стартом</span>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-main)] flex items-center gap-3">
                  <Zap className="w-5 h-5 text-cyan-500" />
                  <span>Швидкий старт першого спринту за 48 годин</span>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-main)] flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-teal-500" />
                  <span>100% адаптивність під телефони, планшети та 4K екрани</span>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border-main)] bg-[var(--bg-elevated)] py-8 px-4 sm:px-12 text-xs text-[var(--text-tertiary)] flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 text-center">
        <div>
          © 2026 <span className="font-bold text-[var(--text-primary)]">Medleb Digital Agency</span>. Сайти, мобільні додатки та цифрові платформи для бізнесу
        </div>
        <div className="flex items-center gap-4 text-[var(--text-secondary)]">
          <button onClick={() => scrollTo('hero')} className="hover:text-emerald-500 transition-colors">Головна</button>
          <span>•</span>
          <button onClick={() => scrollTo('portfolio')} className="hover:text-emerald-500 transition-colors">Портфоліо</button>
          <span>•</span>
          <button onClick={() => scrollTo('calculator')} className="hover:text-emerald-500 transition-colors">Калькулятор</button>
        </div>
      </footer>
    </div>
  );
}
