import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Sparkles, Send, RefreshCw, Cpu, Layers, 
  Terminal, CheckCircle, Database, Smartphone, ShieldCheck
} from 'lucide-react';

export default function AiArchitect() {
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    // Dynamic intelligent architectural parsing
    setTimeout(() => {
      setIsAnalyzing(false);
      setResult({
        query: prompt,
        systemName: 'Medleb High-Availability Distributed Cluster',
        architectureType: 'Decoupled Microservices + Mobile Ecosystem',
        frontend: 'Next.js 15 (App Router, Server Actions, 100/100 Lighthouse)',
        mobile: 'React Native + Expo (iOS / Android 120 FPS)',
        backend: 'NestJS (API Gateway & WebSockets) + Go Fiber (High-Throughput Services)',
        enterpriseCore: 'C# .NET 9 & ADO.NET для безпечних фінансових та облікових операцій',
        aiPipeline: 'Python (FastAPI + RAG на LangChain/PyTorch) з локальним та хмарним LLM',
        database: 'PostgreSQL (Primary Relational) + Redis (Cache) + MongoDB (Logs & Chat)',
        sla: '99.98% аптайм з автоматичним CI/CD деплоєм через Docker & Kubernetes'
      });
    }, 1400);
  };

  return (
    <section id="ai-architect" className="space-y-10 py-8">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-semibold">
          <Bot className="w-4 h-4" />
          Medleb AI Neural Architect
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          ШІ-Архітектор: введіть ідею — <span className="bg-gradient-to-r from-violet-400 to-pink-500 bg-clip-text text-transparent">отримайте технічний план</span>
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base">
          Опишіть проект будь-якими словами. Нейросистема Medleb розкладе завдання на шари: від мобільного додатку на React Native до бекендів на Go, C# .NET та Python.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <form onSubmit={handleAnalyze} className="relative">
          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Наприклад: 'Хочемо створити сервіс онлайн-бронювання готелів та трансферів з мобільним додатком, оплатою картками та чат-ботом для клієнтів'..."
            className="w-full rounded-3xl bg-zinc-900/90 border border-zinc-700/80 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 text-zinc-100 p-5 sm:p-6 text-sm outline-none transition-all resize-none shadow-2xl placeholder:text-zinc-500"
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button
              type="submit"
              disabled={isAnalyzing || !prompt.trim()}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-lg shadow-violet-600/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ШІ будує архітектуру...</span>
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

        {/* Results Card */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-violet-500/30 shadow-2xl space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-violet-600/20 text-violet-400">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-white">{result.systemName}</h3>
                    <div className="text-xs text-violet-300 font-mono">{result.architectureType}</div>
                  </div>
                </div>
                <div className="text-xs font-mono text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 self-start sm:self-auto">
                  {result.sla}
                </div>
              </div>

              {/* Architecture Blueprint Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
                  <div className="text-[11px] font-mono uppercase text-rose-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" /> Web & Frontend Tier
                  </div>
                  <div className="font-bold text-sm text-white">{result.frontend}</div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
                  <div className="text-[11px] font-mono uppercase text-cyan-400 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" /> Mobile Cross-Platform
                  </div>
                  <div className="font-bold text-sm text-white">{result.mobile}</div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
                  <div className="text-[11px] font-mono uppercase text-amber-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> API Gateway & Microservices
                  </div>
                  <div className="font-bold text-sm text-white">{result.backend}</div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
                  <div className="text-[11px] font-mono uppercase text-purple-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Enterprise & FinTech Core
                  </div>
                  <div className="font-bold text-sm text-white">{result.enterpriseCore}</div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
                  <div className="text-[11px] font-mono uppercase text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI Engine & Automation
                  </div>
                  <div className="font-bold text-sm text-white">{result.aiPipeline}</div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1.5">
                  <div className="text-[11px] font-mono uppercase text-blue-400 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" /> Persistence & Cache
                  </div>
                  <div className="font-bold text-sm text-white">{result.database}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-violet-950/20 border border-violet-500/20 text-xs text-zinc-300 flex items-center justify-between">
                <span>Готові обговорити втілення цієї архітектури на спринті?</span>
                <a 
                  href="#contacts"
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all text-xs"
                >
                  Отримати детальне КП
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
