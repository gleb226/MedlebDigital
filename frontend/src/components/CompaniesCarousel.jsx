import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ArrowUpRight, ChevronLeft, ChevronRight,
  TrendingUp, Award, ExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export const PARTNERS_COMPANIES = [
  { 
    id: 'apex-global', 
    name: 'Apex Global Financial', 
    domain: 'Фінтех та платежі', 
    url: 'https://apexbank.io', 
    growth: '+140% клієнтів', 
    logoText: 'APEX', 
    colorDark: 'from-emerald-500/15 via-teal-500/10 to-transparent border-emerald-500/30', 
    colorLight: 'from-emerald-50 via-teal-50 to-white border-emerald-200 shadow-md', 
    desc: 'Масштабна цифрова фінансова платформа. Швидка обробка сотень тисяч операцій на день без збоїв та затримок.', 
    stats: '85 000 транзакцій/сек' 
  },
  { 
    id: 'logistix-eu', 
    name: 'LogistiX International', 
    domain: 'Міжнародна логістика', 
    url: 'https://logistix.eu', 
    growth: '40 000+ рейсів', 
    logoText: 'LOGISTIX', 
    colorDark: 'from-cyan-500/15 via-blue-500/10 to-transparent border-cyan-500/30', 
    colorLight: 'from-cyan-50 via-blue-50 to-white border-cyan-200 shadow-md', 
    desc: 'Єдина система управління автопарком і вантажоперевезеннями. Зниження витрат на пальне та автоматичний контроль водіїв.', 
    stats: '40 000 вантажівок' 
  },
  { 
    id: 'omnisphere', 
    name: 'OmniSphere Retail Group', 
    domain: 'Електронна комерція', 
    url: 'https://omnisphere.store', 
    growth: '3.5M замовлень', 
    logoText: 'OMNISPHERE', 
    colorDark: 'from-emerald-500/15 via-teal-500/10 to-transparent border-emerald-500/30', 
    colorLight: 'from-amber-50 via-orange-50 to-white border-amber-200 shadow-md', 
    desc: 'Інтернет-гіпермаркет з миттєвим пошуком товарів, оплатою Apple Pay та автоматичною інтеграцією зі складом.', 
    stats: 'Миттєва оплата в 1 клік' 
  },
  { 
    id: 'novadrive', 
    name: 'NovaDrive Mobility', 
    domain: 'Оренда та шеринг транспорту', 
    url: 'https://novadrive.app', 
    growth: '250 000 користувачів', 
    logoText: 'NOVADRIVE', 
    colorDark: 'from-indigo-500/15 via-cyan-500/10 to-transparent border-indigo-500/30', 
    colorLight: 'from-indigo-50 via-teal-50 to-white border-indigo-200 shadow-md', 
    desc: 'Зручний мобільний додаток для клієнтів. Бронювання авто за 30 секунд і відкриття дверей прямо зі смартфона.', 
    stats: 'iOS та Android додатки' 
  },
  { 
    id: 'mediscan-ai', 
    name: 'MediScan Diagnostic Hub', 
    domain: 'Медичні центри та лабораторії', 
    url: 'https://mediscan.health', 
    growth: '99.4% точність', 
    logoText: 'MEDISCAN', 
    colorDark: 'from-teal-500/15 via-emerald-500/10 to-transparent border-teal-500/30', 
    colorLight: 'from-teal-50 via-emerald-50 to-white border-teal-200 shadow-md', 
    desc: 'Онлайн-кабінет пацієнта та автоматична система розшифровки аналізів з надійним шифруванням медичних даних.', 
    stats: 'Захист даних за стандартом' 
  },
  { 
    id: 'aurora-estate', 
    name: 'Aurora Prime Estates', 
    domain: 'Преміальна нерухомість', 
    url: 'https://auroraestates.com', 
    growth: '$120M+ продажів', 
    logoText: 'AURORA', 
    colorDark: 'from-amber-500/15 via-emerald-500/10 to-transparent border-amber-500/30', 
    colorLight: 'from-stone-50 via-amber-50 to-white border-amber-200 shadow-md', 
    desc: 'Платформа продажу та оренди бізнес-нерухомості з віртуальними 3D-турами та інтерактивними планами поверхів.', 
    stats: '15 країн світу' 
  }
];

export default function CompaniesCarousel() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollingCards = [...PARTNERS_COMPANIES, ...PARTNERS_COMPANIES];

  return (
    <section 
      className="py-12 space-y-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-main)] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#059669]">
            <Award className="w-4 h-4" />
            <span>Компанії, для яких ми реалізували проекти</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Автоматичний перегляд портфеля клієнтів (гортайте стрілками або наводьте курсор для паузи)
          </p>
        </div>

        <span className="text-xs text-[var(--text-tertiary)]">Наведіть курсор, щоб зупинити</span>
      </div>

      {/* A single moving track avoids layout reordering and visual jumps. */}
      <div className="partners-viewport" style={{ perspective: '1400px' }}>
        <div className={`partners-track${isPaused ? ' partners-track--paused' : ''}`}>
          {scrollingCards.map((company, index) => {
            const slot = index % 4;
            const isSelected = selectedCompany?.id === company.id;
            
            // 3D rotation angles for slot: 
            // slot 0: slightly rotated right (+8 deg)
            // slot 1, 2: facing forward / slight curve (-3 deg, +3 deg)
            // slot 3: slightly rotated left (-8 deg)
            const rotations = [12, -4, 4, -12];
            const currentRotation = rotations[slot] || 0;
            const depth = [0, 38, 38, 0][slot] || 0;

            return (
              <motion.div
                key={`${company.id}-${index}`}
                initial={false}
                animate={{ z: depth, rotateY: currentRotation }}
                whileHover={{ 
                  y: -8, 
                  rotateY: 0, 
                  scale: 1.03, 
                  transition: { duration: 0.25 } 
                }}
                onClick={() => setSelectedCompany(isSelected ? null : company)}
                className={`partners-card p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between min-h-[240px] relative overflow-hidden backdrop-blur-md shadow-lg ${
                  isSelected
                    ? 'border-[#059669] ring-4 ring-[#059669]/20 bg-[#059669]/10'
                    : isDark
                      ? `bg-gradient-to-br ${company.colorDark} hover:border-[#059669]`
                      : `bg-gradient-to-br ${company.colorLight} hover:border-[#059669]`
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  transformOrigin: slot < 2 ? 'left center' : 'right center'
                }}
              >
                {/* Top: Domain & Growth badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-main)] flex items-center justify-center font-bold text-xs text-[#059669] shadow-xs">
                    {company.logoText.slice(0, 3)}
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#059669]/15 border border-[#059669]/30 text-[#059669] text-[11px] font-bold">
                    <TrendingUp className="w-3 h-3" />
                    <span>{company.growth}</span>
                  </div>
                </div>

                {/* Middle: Name & Plain Description */}
                <div className="space-y-1.5 my-3 text-left">
                  <div className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">
                    {company.domain}
                  </div>
                  <h4 className="font-bold text-base text-[var(--text-primary)] leading-snug">
                    {company.name}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed mt-1">
                    {company.desc}
                  </p>
                </div>

                {/* Bottom stats & CTA */}
                <div className="pt-3 border-t border-[var(--border-main)] flex items-center justify-between text-xs">
                  <span className="text-[#059669] font-bold text-[11px]">{company.stats}</span>
                  <span className="text-[var(--text-tertiary)] group-hover:text-[#059669] font-medium flex items-center gap-1">
                    Деталі →
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Expanded Company Details Drawer */}
      <AnimatePresence>
        {selectedCompany && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-card)] border-2 border-[#059669] shadow-2xl space-y-4 overflow-hidden relative backdrop-blur-xl text-left"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-main)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#059669] text-white flex items-center justify-center font-bold text-lg shadow-md">
                  {selectedCompany.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[var(--text-primary)]">{selectedCompany.name}</h3>
                  <div className="text-xs text-[var(--text-secondary)]">{selectedCompany.domain} • {selectedCompany.stats}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={selectedCompany.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <span>Відкрити сайт компанії</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setSelectedCompany(null)}
                  className="px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-main)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Закрити
                </button>
              </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-4xl">
              {selectedCompany.desc}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
