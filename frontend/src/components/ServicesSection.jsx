import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Code2, Palette, ShoppingCart, Smartphone, Workflow, X } from 'lucide-react';

const services = [
  { icon: Code2, title: 'Веб-платформи', text: 'Швидкі сайти, кабінети та складні B2B-системи, якими легко користуватись.' },
  { icon: Smartphone, title: 'Мобільні застосунки', text: 'iOS та Android-продукти з єдиним якісним досвідом для ваших клієнтів.' },
  { icon: ShoppingCart, title: 'E-commerce', text: 'Магазини, маркетплейси, оплата й інтеграції зі складом, CRM та доставкою.' },
  { icon: Bot, title: 'AI та автоматизація', text: 'Асистенти, Telegram-боти й процеси, що забирають рутину з команди.' },
  { icon: Palette, title: 'UI/UX та брендинг', text: 'Сильна дизайн-система, прототип і зрозумілий шлях від першого кліку до заявки.' },
  { icon: Workflow, title: 'Інтеграції та підтримка', text: 'API, платежі, аналітика, стабільний реліз і розвиток після запуску.' },
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
        {services.map(({ icon: Icon, title, text }, index) => (
          <button key={title} type="button" onClick={() => setSelected({ icon: Icon, title, text })} className="service-card group text-left cursor-pointer">
            <span className="service-card__number">0{index + 1}</span>
            <div className="service-card__icon"><Icon size={22} /></div>
            <h3>{title}</h3>
            <p>{text}</p>
            <span className="service-card__line" />
          </button>
        ))}
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-[#05120d]/55 backdrop-blur-md p-4 grid place-items-center" onClick={() => setSelected(null)}>
            <motion.div initial={{ y: 18, scale: .97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 18, scale: .97 }} onClick={(event) => event.stopPropagation()} className="w-full max-w-xl rounded-3xl bg-[var(--bg-elevated)] border border-emerald-500/30 shadow-2xl p-7 sm:p-9 relative">
              <button type="button" onClick={() => setSelected(null)} className="absolute top-5 right-5 p-2 rounded-xl border border-[var(--border-main)] hover:border-emerald-500"><X size={18} /></button>
              <div className="service-card__icon"><selected.icon size={25} /></div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-500 mt-7">Medleb Digital service</p>
              <h3 className="text-3xl font-black mt-2">{selected.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mt-4 text-base">{selected.text} Проводимо аналіз, формуємо зрозумілий план реалізації та відповідаємо за якісний запуск.</p>
              <button type="button" onClick={() => setSelected(null)} className="mt-7 px-5 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold">Зрозуміло</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
