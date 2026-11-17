import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Rocket, Briefcase, Calculator, Sparkles, 
  PhoneCall, Shield, ChevronRight, MessageSquare
} from 'lucide-react';

export default function MobileAcrylicMenu({ activeTab, onSelectTab }) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'hero', label: 'Головна та Архітектура', icon: Rocket, desc: 'Next.js + NestJS екосистема' },
    { id: 'portfolio', label: 'Живе Портфоліо & Mobile', icon: Briefcase, desc: 'Web + React Native кейси' },
    { id: 'calculator', label: 'Бізнес-Калькулятор', icon: Calculator, desc: 'Розрахунок вартості без тех-жаргону' },
    { id: 'ai-architect', label: 'ШІ-Архітектор Проекту', icon: Sparkles, desc: 'Аналіз ТЗ та підбір рішення' },
    { id: 'contacts', label: 'Зв’язатися з нами', icon: PhoneCall, desc: 'Бронювання та старт спринту' },
  ];

  const handlePick = (id) => {
    onSelectTab(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Sleek Floating Circular Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-2xl shadow-rose-600/50 border border-white/20 backdrop-blur-md"
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Full-Screen Acrylic Glass Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 md:hidden bg-black/75 backdrop-blur-2xl flex flex-col justify-between p-6 pt-12"
          >
            {/* Header in Modal */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-black text-white text-sm">
                  M
                </div>
                <span className="font-extrabold text-base tracking-wider text-white">
                  MEDLEB<span className="text-rose-500">.DIGITAL</span>
                </span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of sections */}
            <div className="space-y-3 my-auto">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handlePick(item.id)}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      active 
                        ? 'bg-rose-500/20 border-rose-500 text-white shadow-lg shadow-rose-600/20' 
                        : 'bg-white/[0.03] border-white/10 text-zinc-300 active:bg-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${active ? 'bg-rose-500 text-white' : 'bg-white/10 text-rose-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{item.label}</div>
                        <div className="text-[11px] text-zinc-400">{item.desc}</div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${active ? 'text-rose-400' : 'text-zinc-600'}`} />
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom info */}
            <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Готові до нових запусків
              </span>
              <a 
                href="#contacts" 
                onClick={() => handlePick('contacts')}
                className="text-rose-400 font-bold"
              >
                Написати нам →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
