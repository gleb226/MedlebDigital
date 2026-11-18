import React from 'react';
import { Bot, Code2, Palette, ShoppingCart, Smartphone, Workflow } from 'lucide-react';

const services = [
  { icon: Code2, title: 'Веб-платформи', text: 'Швидкі сайти, кабінети та складні B2B-системи, якими легко користуватись.' },
  { icon: Smartphone, title: 'Мобільні застосунки', text: 'iOS та Android-продукти з єдиним якісним досвідом для ваших клієнтів.' },
  { icon: ShoppingCart, title: 'E-commerce', text: 'Магазини, маркетплейси, оплата й інтеграції зі складом, CRM та доставкою.' },
  { icon: Bot, title: 'AI та автоматизація', text: 'Асистенти, Telegram-боти й процеси, що забирають рутину з команди.' },
  { icon: Palette, title: 'UI/UX та брендинг', text: 'Сильна дизайн-система, прототип і зрозумілий шлях від першого кліку до заявки.' },
  { icon: Workflow, title: 'Інтеграції та підтримка', text: 'API, платежі, аналітика, стабільний реліз і розвиток після запуску.' },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 sm:py-20">
      <div className="max-w-2xl mb-10 space-y-3">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-600 dark:text-emerald-400">Послуги</p>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Цифровий продукт під ключ — без зайвої складності.</h2>
        <p className="text-[var(--text-secondary)]">Збираємо потрібну команду та відповідаємо за результат від стратегії до запуску.</p>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {services.map(({ icon: Icon, title, text }, index) => (
          <article key={title} className="service-card group">
            <span className="service-card__number">0{index + 1}</span>
            <div className="service-card__icon"><Icon size={22} /></div>
            <h3>{title}</h3>
            <p>{text}</p>
            <span className="service-card__line" />
          </article>
        ))}
      </div>
    </section>
  );
}
