import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Bot, CheckCircle2, RefreshCw, Send, Sparkles } from 'lucide-react';

const welcome = 'Вітаю! Допоможу швидко зібрати заявку для команди. Розкажіть у двох реченнях, який продукт або сайт ви хочете створити?';

export default function AiArchitect() {
  const [messages, setMessages] = useState([{ role: 'model', text: welcome }]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState(null);
  const sessionId = useRef(crypto.randomUUID());
  const send = async (event) => {
    event.preventDefault();
    const value = text.trim();
    if (!value || loading) return;
    const history = messages;
    setMessages((items) => [...items, { role: 'user', text: value }]);
    setText(''); setLoading(true);
    try {
      const response = await fetch('/api/ai/brief', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: value, history, sessionId: sessionId.current }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Помилка AI-помічника');
      setMessages((items) => [...items, { role: 'model', text: data.reply }]);
      if (data.ready) setBrief(data.brief);
    } catch (error) { setMessages((items) => [...items, { role: 'model', text: error.message || 'Не вдалося відповісти. Спробуйте ще раз.' }]); }
    finally { setLoading(false); }
  };
  const restart = () => { setMessages([{ role: 'model', text: welcome }]); setBrief(null); sessionId.current = crypto.randomUUID(); };
  return <section id="ai-architect" className="py-20 relative">
    <div className="absolute inset-x-0 top-16 h-80 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,.16),transparent_65%)] blur-3xl pointer-events-none" />
    <div className="relative max-w-5xl mx-auto grid lg:grid-cols-[.85fr_1.15fr] gap-5">
      <div className="rounded-[2rem] p-7 sm:p-9 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 text-white shadow-2xl shadow-emerald-950/25 overflow-hidden relative">
        <div className="absolute -right-16 -bottom-20 w-64 h-64 rounded-full border-[28px] border-white/10" />
        <div className="relative"><div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 grid place-items-center"><Bot size={25} /></div><p className="mt-9 text-xs font-bold uppercase tracking-[.2em] text-white/70">Medleb Concierge</p><h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">Проєкт починається з нормальної розмови.</h2><p className="mt-5 text-sm leading-relaxed text-white/78">Без складних форм та калькуляторів. Помічник поставить точні питання, збере бриф і надішле його команді в Telegram.</p><div className="mt-8 space-y-3 text-sm">{['2–4 хвилини на бриф', 'Відповідь українською', 'Заявка одразу в Telegram'].map((item) => <div key={item} className="flex gap-2 items-center"><CheckCircle2 size={17} className="text-emerald-200" />{item}</div>)}</div></div>
      </div>
      <div className="rounded-[2rem] border border-[var(--border-main)] bg-[color-mix(in_srgb,var(--bg-card)_88%,transparent)] backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col min-h-[510px]">
        <div className="px-6 py-5 flex items-center justify-between border-b border-[var(--border-main)]"><div className="flex items-center gap-3"><span className="relative w-10 h-10 rounded-full bg-emerald-500/15 grid place-items-center text-emerald-500"><Sparkles size={18} /><i className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[var(--bg-card)]" /></span><div><b className="block text-sm">Medleb Concierge</b><span className="text-xs text-[var(--text-tertiary)]">Онлайн · допомагає з заявкою</span></div></div><button onClick={restart} title="Почати знову" className="p-2 rounded-xl text-[var(--text-tertiary)] hover:text-emerald-500 hover:bg-emerald-500/10"><RefreshCw size={17} /></button></div>
        <div className="flex-1 p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[420px]">{messages.map((item, index) => <motion.div key={`${item.role}-${index}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${item.role === 'user' ? 'ml-auto bg-emerald-600 text-white rounded-br-md' : 'bg-[var(--bg-elevated)] border border-[var(--border-main)] rounded-bl-md text-[var(--text-primary)]'}`}>{item.text}</motion.div>)}<AnimatePresence>{loading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-fit bg-[var(--bg-elevated)] border border-[var(--border-main)] rounded-2xl rounded-bl-md p-3"><RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" /></motion.div>}</AnimatePresence>{brief && <motion.div initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30"><b className="text-sm text-emerald-500">Бриф готовий і надісланий команді</b><p className="mt-1 text-xs text-[var(--text-secondary)]">Ми отримали дані у Telegram та повернемося з відповіддю.</p></motion.div>}</div>
        <form onSubmit={send} className="p-4 border-t border-[var(--border-main)] flex gap-2"><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Напишіть про свою ідею…" className="min-w-0 flex-1 px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-main)] focus:outline-none focus:border-emerald-500 text-sm" /><button type="submit" disabled={loading || !text.trim()} className="w-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white grid place-items-center transition-colors"><Send size={18} /></button></form>
      </div>
    </div>
    <a href="https://t.me/MedlebDigitalBot" target="_blank" rel="noreferrer" className="relative mx-auto mt-6 w-fit flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:gap-3 transition-all">Або напишіть одразу в Telegram-бот <ArrowUpRight size={16} /></a>
  </section>;
}
