import React, { useState } from 'react';
import { SITE_CONFIG } from '../config/siteConfig';
import {
  EngineSchematic,
  BrakesSchematic,
  SuspensionSchematic,
} from '../three/svgDrawings';
import { ArrowUpRight } from 'lucide-react';

export const WhyDetailsMatter: React.FC = () => {
  const [activeId, setActiveId] = useState<string>(SITE_CONFIG.engineeringModules[0].id);

  const activeModule =
    SITE_CONFIG.engineeringModules.find((m) => m.id === activeId) ||
    SITE_CONFIG.engineeringModules[0];

  const renderDiagram = (id: string) => {
    if (id === 'powertrain') return <EngineSchematic className="w-full h-56 object-cover" />;
    if (id === 'braking') return <BrakesSchematic className="w-full h-56 object-cover" />;
    return <SuspensionSchematic className="w-full h-56 object-cover" />;
  };

  return (
    <section
      id="engineering"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#0b0d12] border-t border-[#1e222b]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 mb-14 border-b border-[#1e222b] items-end">
          <div className="lg:col-span-7">
            <div className="text-xs font-mono text-[#e04f26] uppercase tracking-widest mb-3 tabular-nums">
              03 · Инженерная метрология и допуски
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-bold uppercase tracking-tight text-[#f5f5f3] leading-[0.98]">
              Устранение первопричины вместо замены деталей наугад
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm sm:text-base text-[#9ca3af] leading-relaxed">
              Повторные поломки возникают тогда, когда устраняется следствие, а не источник отклонения. Мы опираемся на инструментальные замеры допусков в каждом узле.
            </p>
          </div>
        </div>

        {/* Subsystem Selector Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-[#1e222b] mb-10">
          {SITE_CONFIG.engineeringModules.map((mod) => {
            const isSelected = mod.id === activeId;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveId(mod.id)}
                className={`p-5 sm:p-6 text-left border-r border-b border-[#1e222b] transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#131720] text-[#f5f5f3]'
                    : 'bg-[#090b0f] text-[#8e939e] hover:bg-[#0e1117] hover:text-[#d1d5db]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-2 tabular-nums">
                  <span className={isSelected ? 'text-[#e04f26]' : 'text-[#6b7280]'}>
                    {mod.code}
                  </span>
                  <span className="text-[11px] uppercase">{mod.system}</span>
                </div>
                <div className="text-lg font-display font-bold uppercase tracking-wide">
                  {mod.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Asymmetric Technical Inspection Board */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#1e222b] bg-[#08090c]">
          {/* Left Column: Diagram & Measured Specs */}
          <div className="lg:col-span-5 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-[#1e222b] flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-[#8e939e] uppercase tracking-wider mb-3 tabular-nums">
                Схема узла · {activeModule.code}
              </div>

              <div className="border border-[#1e222b] mb-6 overflow-hidden">
                {renderDiagram(activeModule.id)}
              </div>

              <p className="text-sm text-[#9ca3af] leading-relaxed mb-6">
                {activeModule.summary}
              </p>
            </div>

            {/* Tabular Tolerance Readouts */}
            <div className="border-t border-[#1e222b] pt-4 space-y-3">
              {activeModule.specs.map((spec, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs font-mono tabular-nums"
                >
                  <span className="text-[#8e939e]">{spec.label}</span>
                  <span className="text-[#f5f5f3] font-semibold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Symptom vs Typical Mistake vs Engineering Resolution */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <div className="text-xs font-mono text-[#8e939e] uppercase tracking-wider mb-1.5">
                  Симптом при обращении
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-bold uppercase text-[#f5f5f3]">
                  {activeModule.symptom}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#1e222b]">
                <div className="p-5 bg-[#0e1015] border border-[#1e222b]">
                  <div className="text-xs font-mono text-[#8e939e] uppercase tracking-wider mb-2">
                    Типичная ошибка при ремонте
                  </div>
                  <p className="text-xs sm:text-sm text-[#9ca3af] leading-relaxed">
                    {activeModule.typicalMistake}
                  </p>
                </div>

                <div className="p-5 bg-[#11151e] border border-[#e04f26]/50">
                  <div className="text-xs font-mono text-[#e04f26] uppercase tracking-wider mb-2">
                    Инженерный регламент APEX
                  </div>
                  <p className="text-xs sm:text-sm text-[#f5f5f3] leading-relaxed">
                    {activeModule.engineeringSolution}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#1e222b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs font-mono text-[#8e939e]">
                Все результаты замеров фиксируются в диагностической карте клиента
              </span>
              <a
                href="#contact"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#e04f26] hover:text-[#f5f5f3] transition-colors shrink-0"
              >
                <span>Записаться на диагностику</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
