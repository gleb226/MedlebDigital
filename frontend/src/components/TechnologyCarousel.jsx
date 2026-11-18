import React from 'react';

const technologies = [
  ['Python', 'python', '3776AB'], ['Go', 'go', '00ADD8'], ['JavaScript', 'javascript', 'F7DF1E'],
  ['TypeScript', 'typescript', '3178C6'], ['C#', 'dotnet', '512BD4'], ['PHP', 'php', '777BB4'],
  ['React', 'react', '61DAFB'], ['Next.js', 'nextdotjs', 'FFFFFF'], ['Vite', 'vite', '646CFF'],
  ['NestJS', 'nestjs', 'E0234E'], ['ASP.NET Core', 'dotnet', '512BD4'], ['ADO.NET', 'dotnet', '512BD4'],
  ['Django', 'django', '44B78B'], ['Flask', 'flask', 'FFFFFF'], ['aiogram', 'telegram', '26A5E4'],
  ['FastAPI', 'fastapi', '009688'], ['PostgreSQL', 'postgresql', '4169E1'], ['Docker', 'docker', '2496ED'],
  ['WordPress', 'wordpress', '21759B'], ['Shopify', 'shopify', '7AB55C'], ['Redis', 'redis', 'DC382D'],
  ['MongoDB', 'mongodb', '47A248'], ['React Native', 'react', '61DAFB'], ['Kubernetes', 'kubernetes', '326CE5'],
];

export default function TechnologyCarousel() {
  const track = [...technologies, ...technologies];
  return (
    <section className="py-8 sm:py-12" aria-label="Technology stack">
      <div className="flex items-end justify-between gap-4 mb-5 px-1">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-600 dark:text-emerald-400">Technology stack</p>
          <h2 className="text-xl sm:text-2xl font-black mt-1">Інструменти, з якими ми запускаємо продукти</h2>
        </div>
        <span className="hidden sm:block text-xs text-[var(--text-tertiary)]">Від ідеї до стабільного релізу</span>
      </div>
      <div className="tech-rail" aria-label="Technologies we use">
        <div className="tech-rail__track">
          {track.map(([name, icon, color], index) => (
            <div className="tech-rail__item" key={`${name}-${index}`} title={name}>
              <img src={`https://cdn.simpleicons.org/${icon}/${color}`} alt="" width="28" height="28" loading="lazy" />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
