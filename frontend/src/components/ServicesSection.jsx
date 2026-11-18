import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Code2, Palette, ShoppingCart, Smartphone, Workflow, X } from 'lucide-react';

const services = [
  { icon: Code2, title: 'Веб-платформи', text: 'Швидкі сайти, кабінети та складні B2B-системи, якими легко користуватись.', starting: 'від $1,500', examples: 'Корпоративний сайт · SaaS · клієнтський кабінет', details: ['Стратегія та структура', 'UX/UI дизайн і розробка', 'SEO-ready запуск та аналітика'] },
  { icon: Smartphone, title: 'Мобільні застосунки', text: 'iOS та Android-продукти з єдиним якісним досвідом для ваших клієнтів.', starting: 'від $2,400', examples: 'Сервіс бронювання · доставка · loyalty app', details: ['iOS та Android з однієї кодової бази', 'Push-сповіщення й платежі', 'Публікація та підтримка'] },
  { icon: ShoppingCart, title: 'E-commerce', text: 'Магазини, маркетплейси, оплата й інтеграції зі складом, CRM та доставкою.', starting: 'від $1,800', examples: 'Shopify · WordPress · custom marketplace', details: ['Каталог, checkout та оплати', 'CRM, склад і доставка', 'Конверсійна аналітика'] },
  { icon: Bot, title: 'AI та автоматизація', text: 'Асистенти, Telegram-боти й процеси, що забирають рутину з команди.', starting: 'від $900', examples: 'AI-помічник · Telegram-бот · CRM automation', details: ['Аудит процесів', 'AI/RAG та інтеграції', 'Метрики та контроль якості'] },
  { icon: Palette, title: 'UI/UX та брендинг', text: 'Сильна дизайн-система, прототип і зрозумілий шлях від першого кліку до заявки.', starting: 'від $700', examples: 'Product design · редизайн · дизайн-система', details: ['Дослідження сценаріїв', 'Інтерактивний прототип', 'Готова UI-kit система'] },
  { icon: Workflow, title: 'Інтеграції та підтримка', text: 'API, платежі, аналітика, стабільний реліз і розвиток після запуску.', starting: 'від $500', examples: 'API · платежі · CI/CD · підтримка', details: ['Підключення сервісів', 'Безпечний реліз', 'План розвитку продукту'] },
];

export default function ServicesSection() {
  const [selected, setSelected] = useState(null);
  return (
    <section id="services" className="py-16 sm:py-20">
      <div className="max-w-2xl mb-10 space-y-3">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-600 dark:text-emerald-400">Послуги</p>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Цифровий продукт під ключ — без зайвої складності.</h2>
        <p className="text-[var(--text-secondary)]">Збираємо потрібну команду та відповідаємо за результат від стратегії до запуску.</p>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {services.map(({ icon: Icon, ...service }, index) => (
          <button key={service.title} type="button" onClick={() => setSelected({ icon: Icon, ...service })} className="service-card group text-left cursor-pointer">
            <span className="service-card__number">0{index + 1}</span>
            <div className="service-card__icon"><Icon size={22} /></div>
            <h3>{service.title}</h3>
            <p>{service.text}</p>
            <span className="service-card__line" />
          </button>
        ))}
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-[#05120d]/55 backdrop-blur-md p-4 grid place-items-center" onClick={() => setSelected(null)}>
            <motion.div initial={{ y: 28, scale: .96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 28, scale: .96 }} onClick={(event) => event.stopPropagation()} className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-[var(--bg-elevated)] border border-emerald-500/30 shadow-2xl p-7 sm:p-12 relative">
              <button type="button" onClick={() => setSelected(null)} className="absolute top-5 right-5 p-2 rounded-xl border border-[var(--border-main)] hover:border-emerald-500"><X size={18} /></button>
              <div className="service-card__icon"><selected.icon size={25} /></div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-500 mt-7">Medleb Digital service</p>
              <h3 className="text-3xl font-black mt-2">{selected.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mt-4 text-lg max-w-2xl">{selected.text} Проводимо аналіз, формуємо зрозумілий план реалізації та відповідаємо за якісний запуск.</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-8"><div className="rounded-2xl p-5 bg-emerald-500/10 border border-emerald-500/20"><span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)]">Інвестиція</span><strong className="block text-3xl mt-1 text-emerald-500">{selected.starting}</strong></div><div className="rounded-2xl p-5 bg-[var(--bg-card)] border border-[var(--border-main)]"><span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)]">Приклади</span><strong className="block text-sm mt-2 leading-relaxed">{selected.examples}</strong></div></div>
              <div className="grid sm:grid-cols-3 gap-3 mt-5">{selected.details.map((item, index) => <div key={item} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] text-sm"><span className="text-emerald-500 font-bold mr-2">0{index + 1}</span>{item}</div>)}</div>
              <button type="button" onClick={() => setSelected(null)} className="mt-8 px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold">Обговорити задачу</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
