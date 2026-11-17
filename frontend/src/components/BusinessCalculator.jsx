import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, ShoppingBag, Globe2, Bot, Smartphone, 
  Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Clock, DollarSign
} from 'lucide-react';

export default function BusinessCalculator() {
  // Business goal / project type
  const [projectGoal, setProjectGoal] = useState('full-suite');
  // Need telegram bot or AI assistant
  const [includeBot, setIncludeBot] = useState(true);
  // Need mobile app for customers/staff
  const [includeMobile, setIncludeMobile] = useState(true);
  // Ready online payments / CRM
  const [includePayments, setIncludePayments] = useState(true);
  // Speed
  const [urgency, setUrgency] = useState('standard'); // 'standard' | 'express'

  // Options designed for a real business owner without tech jargon
  const GOALS = [
    {
      id: 'store',
      icon: ShoppingBag,
      title: 'Інтернет-магазин / Маркетплейс',
      desc: 'Каталог товарів, кошик, оплата картками онлайн, автоматичні сповіщення.',
      basePrice: 1200,
      days: 10
    },
    {
      id: 'full-suite',
      icon: Building2,
      title: 'Компанія / Корпоративний сервіс',
      desc: 'Презентабельний сайт компанії, особисті кабінети клієнтів, облік замовлень.',
      basePrice: 1500,
      days: 14
    },
    {
      id: 'startup',
      icon: Globe2,
      title: 'Онлайн-сервіс / Стартап-платформа',
      desc: 'Нестандартний сервіс з високим навантаженням, складною бізнес-логікою та базою.',
      basePrice: 2200,
      days: 18
    }
  ];

  const currentGoal = GOALS.find(g => g.id === projectGoal) || GOALS[1];

  // Calculation formula
  const calculateResult = () => {
    let price = currentGoal.basePrice;
    let days = currentGoal.days;

    if (includeBot) {
      price += 450;
      days += 3;
    }
    if (includeMobile) {
      price += 950;
      days += 7;
    }
    if (includePayments) {
      price += 350;
      days += 2;
    }

    if (urgency === 'express') {
      price = Math.round(price * 1.25);
      days = Math.max(7, Math.round(days * 0.65));
    }

    return { price, days };
  };

  const { price, days } = calculateResult();

  return (
    <section id="calculator" className="space-y-10 py-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <DollarSign className="w-3.5 h-3.5" />
          Прозорий бізнес-кошторис без технічного сміття
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Розрахуйте вартість за <span className="text-rose-500">30 секунд</span>
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base">
          Вам не потрібно розбиратися у фреймворках та базах даних. Просто вкажіть, що саме потрібно вашому бізнесу для прийому платежів та клієнтів.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Business Questions */}
        <div className="lg:col-span-7 space-y-8 bg-zinc-900/60 border border-zinc-800/80 p-6 sm:p-8 rounded-3xl">
          
          {/* Question 1: What is the main product? */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-300">
              1. Що саме ви хочете запустити?
            </label>
            <div className="space-y-3">
              {GOALS.map((g) => {
                const Icon = g.icon;
                const isSelected = projectGoal === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => setProjectGoal(g.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected 
                        ? 'bg-rose-500/10 border-rose-500 text-white shadow-lg shadow-rose-600/10' 
                        : 'bg-zinc-800/40 border-zinc-700/60 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${isSelected ? 'bg-rose-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{g.title}</div>
                        <div className="text-xs text-zinc-400 mt-0.5">{g.desc}</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question 2: Additional Business Tools */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-300">
              2. Що потрібно включити до системи?
            </label>
            <div className="space-y-3">
              {[
                {
                  active: includeMobile,
                  toggle: () => setIncludeMobile(!includeMobile),
                  icon: Smartphone,
                  title: 'Мобільний додаток для клієнтів (App Store & Google Play)',
                  sub: 'Клієнти завантажують додаток на свій iPhone або Android з push-сповіщеннями.'
                },
                {
                  active: includeBot,
                  toggle: () => setIncludeBot(!includeBot),
                  icon: Bot,
                  title: 'Telegram-бот або ШІ-помічник для заявок',
                  sub: 'Миттєвий прийом замовлень у месенджері, сповіщення для вас та клієнтів 24/7.'
                },
                {
                  active: includePayments,
                  toggle: () => setIncludePayments(!includePayments),
                  icon: Sparkles,
                  title: 'Підключення онлайн-оплати (Apple Pay, Google Pay, LiqPay, Stripe)',
                  sub: 'Гроші надходять безпосередньо на ваш банківський рахунок одразу при покупці.'
                }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    onClick={item.toggle}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      item.active 
                        ? 'bg-amber-500/10 border-amber-500/80 text-white shadow-lg shadow-amber-500/10' 
                        : 'bg-zinc-800/40 border-zinc-700/60 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2.5 rounded-xl ${item.active ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-white">{item.title}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{item.sub}</div>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      item.active ? 'bg-amber-500 border-amber-500 text-black' : 'border-zinc-600'
                    }`}>
                      {item.active && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question 3: Timeline Urgency */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-300">
              3. Терміни запуску
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUrgency('standard')}
                className={`p-3.5 rounded-xl border text-xs font-bold transition-all text-left ${
                  urgency === 'standard' 
                    ? 'bg-zinc-800 border-rose-500 text-white' 
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                }`}
              >
                <div>Стандартний темп</div>
                <div className="text-[10px] text-zinc-500 font-normal mt-0.5">Виважена розробка та повне QA-тестування</div>
              </button>
              <button
                type="button"
                onClick={() => setUrgency('express')}
                className={`p-3.5 rounded-xl border text-xs font-bold transition-all text-left ${
                  urgency === 'express' 
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300' 
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                }`}
              >
                <div>⚡ Експрес-спринт (-35% часу)</div>
                <div className="text-[10px] text-zinc-500 font-normal mt-0.5">Виділена команда під щоденний реліз</div>
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Big Business Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 sticky top-24 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Підсумок кошторису</span>
              <span className="text-xs font-mono text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-semibold">
                Фіксована ціна за договором
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider">Орієнтовний бюджет:</div>
                <div className="text-4xl sm:text-5xl font-black text-white mt-1 font-mono bg-gradient-to-r from-rose-400 via-amber-300 to-rose-300 bg-clip-text text-transparent">
                  ${price}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm py-2 border-t border-zinc-800">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-400" />
                  Термін готовності:
                </span>
                <span className="font-bold text-white font-mono">{days} робочих днів</span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm py-2 border-t border-zinc-800">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Гарантія працездатності:
                </span>
                <span className="font-bold text-emerald-400">1 рік підтримки</span>
              </div>
            </div>

            {/* List of included benefits */}
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2 text-xs text-zinc-300">
              <div className="font-bold text-white text-[11px] uppercase tracking-wider">Що вже включено:</div>
              <div className="flex items-center gap-2">✓ Дизайн та повна адаптація під смартфони і планшети</div>
              <div className="flex items-center gap-2">✓ Базове налаштування сервера та домену</div>
              <div className="flex items-center gap-2">✓ Навчання вашого персоналу роботі з системою</div>
            </div>

            <button
              type="button"
              onClick={() => alert(`Заявку зафіксовано на суму $${price}. Наш архітектор зв'яжеться з вами протягом 15 хвилин.`)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-sm tracking-wide shadow-xl shadow-rose-600/30 transition-all active:scale-[0.98]"
            >
              Забронювати команду на цей проект →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
