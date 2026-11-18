import React from 'react';

const marks = [
  ['stripe', '635BFF'], ['shopify', '7AB55C'], ['figma', 'F24E1E'],
  ['vercel', '111111'], ['slack', '4A154B'], ['notion', '111111'], ['airbnb', 'FF385C'],
];

export default function ClientLogoRail() {
  return (
    <section className="py-8 sm:py-10" aria-label="Client logos">
      <div className="flex items-center gap-3 mb-5">
        <span className="h-px flex-1 bg-[var(--border-main)]" />
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--text-tertiary)]">Selected client work</p>
        <span className="h-px flex-1 bg-[var(--border-main)]" />
      </div>
      <div className="client-rail">
        <div className="client-rail__track">
          {[marks, marks].map((group, groupIndex) => (
            <div className="client-rail__group" aria-hidden={groupIndex === 1} key={groupIndex}>
            {group.map(([name, color], index) => (
            <div key={`${name}-${index}`} className="client-mark" aria-label={name}>
              <img src={`https://cdn.simpleicons.org/${name}/${color}`} alt="" width="38" height="38" loading="lazy" />
            </div>
            ))}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
