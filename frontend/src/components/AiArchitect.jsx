import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, Send, Sparkles, X } from 'lucide-react';

export default function AiArchitect({ open, onClose, estimate }) {
  const welcome = `Вітаю! Бачу ваш орієнтовний розрахунок: від $${estimate.price}, приблизно ${estimate.days} робочих днів. Давайте уточнимо кілька деталей, щоб команда підготувала корисну пропозицію. Чим займається ваш бізнес?`;
  const [messages, setMessages] = useState([{ role: 'model', text: welcome }]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState(null);
  const sessionId = useRef(crypto.randomUUID());
  useEffect(() => { if (open) { setMessages([{ role: 'model', text: welcome }]); setBrief(null); setText(''); sessionId.current = crypto.randomUUID(); } }, [open, estimate.price, estimate.days]);
  const restart = () => { setMessages([{ role: 'model', text: welcome }]); setBrief(null); sessionId.current = crypto.randomUUID(); };
  const send = async (event) => {
    event.preventDefault(); const value = text.trim(); if (!value || loading) return;
    const history = messages; setMessages((items) => [...items, { role: 'user', text: value }]); setText(''); setLoading(true);
    try { const response = await fetch('/api/ai/brief', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: value, history, sessionId: sessionId.current }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Не вдалося надіслати відповідь'); setMessages((items) => [...items, { role: 'model', text: data.reply }]); if (data.ready) setBrief(data.brief); } catch (error) { setMessages((items) => [...items, { role: 'model', text: error.message || 'Не вдалося відповісти. Спробуйте ще раз.' }]); } finally { setLoading(false); }
  };
  return <AnimatePresence>{open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-950/65 backdrop-blur-xl p-3 sm:p-8 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Обговорення проєкту">
    <motion.div initial={{ opacity: 0, y: 28, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 28, scale: .97 }} transition={{ type: 'spring', stiffness: 310, damping: 28 }} className="w-full max-w-4xl max-h-[92vh] rounded-[2rem] border border-[var(--border-main)] bg-[var(--bg-card)] shadow-2xl overflow-hidden flex flex-col">
      <div className="px-5 sm:px-7 py-5 flex items-center justify-between border-b border-[var(--border-main)]"><div className="flex items-center gap-3"><span className="w-10 h-10 rounded-full bg-emerald-500/15 grid place-items-center text-emerald-500"><Sparkles size={18} /></span><div><b className="block text-sm">Обговорення вашого розрахунку</b><span className="text-xs text-[var(--text-tertiary)]">Від ${estimate.price} · приблизно {estimate.days} днів</span></div></div><div className="flex gap-1"><button onClick={restart} title="Почати знову" className="p-2 rounded-xl text-[var(--text-tertiary)] hover:text-emerald-500"><RefreshCw size={17} /></button><button onClick={onClose} title="Закрити" className="p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"><X size={20} /></button></div></div>
      <div className="flex-1 p-5 sm:p-7 space-y-4 overflow-y-auto">{messages.map((item, index) => <motion.div key={`${item.role}-${index}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`max-w-[84%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${item.role === 'user' ? 'ml-auto bg-emerald-600 text-white rounded-br-md' : 'bg-[var(--bg-elevated)] border border-[var(--border-main)] rounded-bl-md'}`}>{item.text}</motion.div>)}{loading && <div className="w-fit p-3 rounded-2xl bg-[var(--bg-elevated)]"><RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" /></div>}{brief && <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-sm"><b className="text-emerald-600">Стартовий план сформовано</b><p className="mt-1 text-[var(--text-secondary)]">Контакт передано команді для уточнення деталей.</p></div>}</div>
      <form onSubmit={send} className="p-4 sm:p-5 border-t border-[var(--border-main)] flex gap-2"><input autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Напишіть відповідь…" className="min-w-0 flex-1 px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-main)] focus:outline-none focus:border-emerald-500 text-sm" /><button type="submit" disabled={loading || !text.trim()} className="w-12 rounded-xl bg-emerald-600 disabled:opacity-40 text-white grid place-items-center"><Send size={18} /></button></form>
    </motion.div>
  </motion.div>}</AnimatePresence>;
}
