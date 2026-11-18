import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Laptop, Smartphone, ChevronLeft, ChevronRight, Play, 
  ExternalLink, Layers, Sparkles, Check, Eye, Maximize2, X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export const PORTFOLIO_PROJECTS = [
  {
    id: 'apex-bank',
    title: 'Apex Financial Platform & NeoBank',
    tagline: 'High-Load FinTech екосистема з мікросервісами на C# .NET 9 та Go',
    category: 'FinTech / NeoBank',
    desc: 'Повний цикл банківського обслуговування: кліринг транзакцій < 12ms, криптовалютні та фіатні шлюзи, мультивалютні рахунки та біометричний захист.',
    metrics: [
      { label: 'Latency транзакцій', val: '< 12ms' },
      { label: 'RPS навантаження', val: '85,000 req/s' },
      { label: 'Аптайм систем', val: '99.99%' }
    ],
    stack: ['Next.js 15', 'NestJS', 'Go Fiber', 'C# .NET 9', 'React Native', 'PostgreSQL'],
    photos: [
      { title: 'Web Dashboard Overview', color: 'from-emerald-700 via-teal-800 to-cyan-900', label: 'Головна панель трейдингу та аналітики' },
      { title: 'Mobile Client Wallet', color: 'from-blue-700 via-indigo-800 to-slate-900', label: 'Екран переказів та FaceID у додатку' },
      { title: 'Realtime Order Book', color: 'from-teal-800 via-emerald-900 to-zinc-900', label: 'Книга ордерів з WebSocket стрімінгом' }
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-41484-large.mp4',
    webUrl: 'app.apexbank.io/dashboard',
    mobileBalance: '$1,248,390.40',
    mobileChange: '+14.8% цього місяця'
  },
  {
    id: 'logistix-ai',
    title: 'LogistiX Global Dispatch & Fleet Radar',
    tagline: 'Enterprise логістичний хаб з автономною ШІ-оптимізацією маршрутів',
    category: 'Logistics / AI Radar',
    desc: 'Управління автопарком з 40,000+ вантажівок по Європі в реальному часі. Python AI прогнозує затори, а Go WebSockets миттєво синхронізує GPS-маяки.',
    metrics: [
      { label: 'Економія палива', val: '-22.4%' },
      { label: 'Автопарк онлайн', val: '40,000+' },
      { label: 'GPS Ping', val: '100ms' }
    ],
    stack: ['Next.js 15', 'NestJS', 'Python PyTorch', 'Go Fiber', 'React Native', 'Redis Cluster'],
    photos: [
      { title: 'Realtime Radar 4K', color: 'from-cyan-700 via-blue-800 to-slate-900', label: 'Телеметрична карта диспетчера' },
      { title: 'AI Route Optimizations', color: 'from-teal-700 via-cyan-800 to-blue-900', label: 'Розумний розподіл вантажів' },
      { title: 'Driver Native App', color: 'from-emerald-800 via-teal-900 to-zinc-900', label: 'Інтерфейс водія з навігацією' }
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-43285-large.mp4',
    webUrl: 'dispatch.logistix.eu/live-map',
    mobileBalance: 'Маршрут #4882: Berlin → Kyiv',
    mobileChange: 'Залишилось: 680 км (AI оптимізовано)'
  },
  {
    id: 'omnisphere-store',
    title: 'OmniSphere Mega Marketplace',
    tagline: 'Надшвидкий E-Commerce з каталогом 3.5M товарів та AI-пошуком',
    category: 'E-Commerce / Retail',
    desc: 'Маркетплейс нового покоління. Швидкість завантаження сторінок 0.08с за рахунок SSR у Next.js, персональні рекомендації товарів на базі ШІ та Telegram-бот для миттєвих замовлень.',
    metrics: [
      { label: 'Core Web Vitals', val: '100 / 100' },
      { label: 'Конверсія в оплату', val: '+38%' },
      { label: 'Каталог SKU', val: '3,500,000+' }
    ],
    stack: ['Next.js 15', 'NestJS', 'Python Django Hub', 'React Native', 'MongoDB Sharded'],
    photos: [
      { title: 'Smart Search Engine', color: 'from-emerald-700 via-green-800 to-teal-900', label: 'Видача з автопідбором та фільтрами' },
      { title: '1-Click Checkout', color: 'from-teal-800 via-cyan-900 to-slate-900', label: 'Миттєва оплата через Apple Pay' },
      { title: 'Analytics Center', color: 'from-blue-800 via-indigo-900 to-zinc-900', label: 'Кабінет продавця з аналітикою' }
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-42827-large.mp4',
    webUrl: 'omnisphere.store/shop',
    mobileBalance: 'AI Помічник покупок',
    mobileChange: '24 товари збережено (Знижки активні)'
  }
];

export default function PortfolioShowcase() {
  const { t } = useLanguage();
  const { theme } = useTheme();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [deviceMode, setDeviceMode] = useState('both'); // 'both' | 'web' | 'mobile'
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showProjectPage, setShowProjectPage] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(false);

  const activeProject = PORTFOLIO_PROJECTS[currentIndex];

  const nextProject = () => {
    setCurrentIndex((prev) => (prev + 1) % PORTFOLIO_PROJECTS.length);
    setPhotoIndex(0);
  };

  const prevProject = () => {
    setCurrentIndex((prev) => (prev - 1 + PORTFOLIO_PROJECTS.length) % PORTFOLIO_PROJECTS.length);
    setPhotoIndex(0);
  };

  return (
    <section id="portfolio" className="py-20 space-y-10">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border-main)] pb-8">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            {t('portfolio.badge')}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            {t('portfolio.title')}{' '}
            <span className="text-emerald-500">{t('portfolio.titleAccent')}</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
            {t('portfolio.subtitle')}
          </p>
        </div>

        {/* Carousel controls & Device switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Device tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-inner">
            <button
              onClick={() => setDeviceMode('both')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                deviceMode === 'both' ? 'bg-emerald-600 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Web + Mobile</span>
            </button>
            <button
              onClick={() => setDeviceMode('web')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                deviceMode === 'web' ? 'bg-emerald-600 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Web</span>
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                deviceMode === 'mobile' ? 'bg-emerald-600 text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevProject}
              className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-emerald-500 transition-all active:scale-95"
              aria-label="Previous project"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold px-2 text-[var(--text-secondary)]">
              {currentIndex + 1} / {PORTFOLIO_PROJECTS.length}
            </span>
            <button
              onClick={nextProject}
              className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-emerald-500 transition-all active:scale-95"
              aria-label="Next project"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE PROJECT CARD WITH INTERACTIVE STAGE */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeProject.id + deviceMode}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -25 }}
          transition={{ duration: 0.4 }}
          className="p-6 md:p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-2xl space-y-8 backdrop-blur-xl relative overflow-hidden"
        >
          {/* Top Info Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[var(--border-main)] pb-6">
            <div className="space-y-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 font-bold border border-emerald-500/30">
                {activeProject.category}
              </span>
              <h3 className="text-2xl sm:text-4xl font-black">{activeProject.title}</h3>
              <p className="text-[var(--text-secondary)] text-sm max-w-3xl leading-relaxed">
                {activeProject.desc}
              </p>
            </div>

            {/* Metrics Counter */}
            <div className="flex flex-wrap items-center gap-3">
              {activeProject.metrics.map((m, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-main)] text-center min-w-[110px]">
                  <div className="text-lg font-black font-mono text-emerald-500">
                    {m.val}
                  </div>
                  <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row: Video Showcase & Inner Photo Carousel */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-main)]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowProjectPage(true)}
                className="px-4 py-2 rounded-xl border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 font-bold text-xs transition-all"
              >
                Детальніше про проєкт
              </button>
              <button
                onClick={() => setShowVideoModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide shadow-md flex items-center gap-2 transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Дивитися відео-демо</span>
              </button>

              <span className="text-xs text-[var(--text-tertiary)] hidden sm:inline">|</span>

              <span className="text-xs text-[var(--text-secondary)] font-medium">
                Кадри проєкту ({photoIndex + 1}/{activeProject.photos.length}):
              </span>
            </div>

            {/* Inner photo switcher */}
            <div className="flex items-center gap-2">
              {activeProject.photos.map((ph, idx) => (
                <button
                  key={idx}
                  onClick={() => setPhotoIndex(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    photoIndex === idx
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Кадр {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Mockups Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-center">
            
            {/* 1. Next.js Web Browser Frame */}
            {(deviceMode === 'both' || deviceMode === 'web') && (
              <div className={`${deviceMode === 'both' ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all`}>
                <div className="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] shadow-2xl overflow-hidden">
                  <div className="bg-[var(--bg-elevated)] px-4 py-2.5 border-b border-[var(--border-main)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="text-[11px] font-mono text-[var(--text-secondary)] bg-[var(--bg-card)] px-4 py-1 rounded-lg border border-[var(--border-main)] flex items-center gap-1.5 truncate max-w-xs">
                      <span className="text-emerald-500">https://</span>
                      {activeProject.webUrl}
                    </div>
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">Next.js 15 SSR</span>
                  </div>

                  {/* Browser screen preview */}
                  <div className={`p-8 bg-gradient-to-br ${activeProject.photos[photoIndex].color} min-h-[320px] flex flex-col justify-between text-white relative overflow-hidden transition-all duration-500`}>
                    <div className="absolute top-0 right-0 p-8 opacity-10 font-black text-8xl pointer-events-none select-none">
                      MEDLEB
                    </div>

                    <div className="space-y-3 relative z-10">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                        {activeProject.photos[photoIndex].title}
                      </div>
                      <h4 className="text-2xl sm:text-3xl font-extrabold">{activeProject.title}</h4>
                      <p className="text-xs sm:text-sm text-white/90 max-w-md leading-relaxed">
                        {activeProject.photos[photoIndex].label}
                      </p>
                    </div>

                    <div className="pt-6 flex flex-wrap gap-2 relative z-10">
                      {activeProject.stack.map((badge, bIdx) => (
                        <span key={bIdx} className="px-3 py-1 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-xs font-mono text-white/90">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. React Native Mobile Device Frame */}
            {(deviceMode === 'both' || deviceMode === 'mobile') && (
              <div className={`${deviceMode === 'both' ? 'lg:col-span-4' : 'lg:col-span-6 mx-auto'} flex justify-center`}>
                <div className="w-[280px] h-[520px] rounded-[48px] bg-black border-4 border-zinc-700 shadow-2xl p-3 flex flex-col relative overflow-hidden">
                  {/* Dynamic Island */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-zinc-900 rounded-full z-20 flex items-center justify-between px-3">
                    <div className="w-2 h-2 rounded-full bg-zinc-950" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>

                  {/* Inside screen */}
                  <div className="flex-1 rounded-[38px] bg-zinc-950 p-5 pt-10 flex flex-col justify-between text-white relative overflow-hidden border border-zinc-800">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>React Native</span>
                        <span className="text-emerald-400 font-bold">120 FPS</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1">
                        <div className="text-[10px] text-zinc-400 uppercase tracking-wider">{activeProject.title}</div>
                        <div className="text-lg font-black font-mono text-emerald-400">{activeProject.mobileBalance}</div>
                        <div className="text-[11px] text-zinc-400 font-semibold">{activeProject.mobileChange}</div>
                      </div>

                      <div className="space-y-2">
                        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs">
                          <span className="text-zinc-300">Push-сповіщення</span>
                          <span className="text-emerald-400 font-mono">Активно</span>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs">
                          <span className="text-zinc-300">Biometrics / FaceID</span>
                          <span className="text-cyan-400 font-mono">Увімкнено</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs tracking-wide shadow-md">
                        Пощупати додаток
                      </button>
                      <div className="w-24 h-1 bg-zinc-700 rounded-full mx-auto" />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </AnimatePresence>

      {/* VIDEO PREVIEW MODAL */}
      <AnimatePresence>
        {showProjectPage && (
          <motion.div initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 32 }} className="fixed inset-0 z-[70] overflow-y-auto bg-[var(--bg-primary)] text-[var(--text-primary)]">
            <div className={`min-h-screen bg-gradient-to-br ${activeProject.photos[photoIndex].color} p-4 sm:p-8`}>
              <div className="max-w-6xl mx-auto">
                <button onClick={() => setShowProjectPage(false)} className="px-4 py-2 rounded-xl bg-black/25 border border-white/25 text-white font-bold text-sm backdrop-blur-md">← До портфоліо</button>
                <div className="grid lg:grid-cols-12 gap-8 mt-12 items-end text-white">
                  <div className="lg:col-span-8"><span className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">Case study · {activeProject.category}</span><h2 className="text-4xl sm:text-6xl font-black tracking-tight mt-4">{activeProject.title}</h2><p className="text-white/80 text-lg leading-relaxed mt-6 max-w-2xl">{activeProject.desc}</p></div>
                  <div className="lg:col-span-4 grid grid-cols-3 lg:grid-cols-1 gap-3">{activeProject.metrics.map((metric) => <div key={metric.label} className="rounded-2xl p-4 bg-black/20 backdrop-blur-md border border-white/15"><strong className="block text-xl">{metric.val}</strong><span className="text-xs text-white/65">{metric.label}</span></div>)}</div>
                </div>
                <div className="mt-12 rounded-3xl border border-white/15 bg-black/20 backdrop-blur-md p-5 sm:p-8"><p className="text-xs uppercase tracking-[.18em] text-white/60">Склад рішення</p><div className="flex flex-wrap gap-2 mt-4">{activeProject.stack.map((item) => <span key={item} className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-sm">{item}</span>)}</div><div className="mt-9 grid md:grid-cols-3 gap-4">{activeProject.photos.map((photo) => <button key={photo.title} onClick={() => { setPhotoIndex(activeProject.photos.indexOf(photo)); setShowProjectPage(false); }} className={`text-left rounded-2xl p-5 bg-gradient-to-br ${photo.color} min-h-44 border border-white/15 hover:scale-[1.02] transition-transform`}><span className="text-xs text-white/70">Екран продукту</span><strong className="block text-xl mt-2">{photo.title}</strong><span className="block text-sm text-white/75 mt-3">{photo.label}</span></button>)}</div></div>
              </div>
            </div>
          </motion.div>
        )}
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-main)] rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-3">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                  <h4 className="font-bold text-base">{activeProject.title} — Відео-демо</h4>
                </div>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="p-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-[var(--border-main)]">
                <video
                  src={activeProject.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-xs text-[var(--text-secondary)] text-center">
                Демонстрація реальної швидкості роботи мікросервісів та інтерфейсу клієнта.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
