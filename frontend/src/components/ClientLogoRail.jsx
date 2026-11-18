import React from 'react';

const marks = ['apex', 'logistix', 'omni', 'nova', 'mediscan', 'aurora'];

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
          {[...marks, ...marks, ...marks].map((mark, index) => (
            <div key={`${mark}-${index}`} className={`client-mark client-mark--${index % marks.length}`} aria-label={`Client ${index % marks.length + 1}`}>
              <span /><i /><b />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
