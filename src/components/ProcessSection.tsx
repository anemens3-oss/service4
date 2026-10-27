import React from 'react';
import { SITE_CONFIG } from '../config/siteConfig';
import { ArrowUpRight } from 'lucide-react';

export const ProcessSection: React.FC = () => {
  return (
    <section
      id="process"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#0b0d12] border-t border-[#1e222b]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 mb-14 border-b border-[#1e222b] items-end">
          <div className="lg:col-span-7">
            <div className="text-xs font-mono text-[#e04f26] uppercase tracking-widest mb-3 tabular-nums">
              05 · Порядок взаимодействия
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-bold uppercase tracking-tight text-[#f5f5f3] leading-[0.98]">
              Три прозрачных этапа от обращения до выдачи автомобиля
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm sm:text-base text-[#9ca3af] leading-relaxed">
              Никаких непрозрачных работ или изменения стоимости постфактум. Каждый шаг фиксируется документально и согласуется с владельцем.
            </p>
          </div>
        </div>

        {/* 3 Stages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 border-t border-l border-[#1e222b]">
          {SITE_CONFIG.processSteps.map((step) => (
            <div
              key={step.number}
              className="bg-[#08090c] border-r border-b border-[#1e222b] p-6 sm:p-9 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-6 tabular-nums">
                  <span className="text-2xl font-display font-bold text-[#e04f26]">
                    ЭТАП {step.number}
                  </span>
                  <span className="text-[#6b7280] uppercase">РЕГЛАМЕНТ</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-display font-bold uppercase text-[#f5f5f3] mb-2">
                  {step.title}
                </h3>

                <div className="text-xs font-mono text-[#8e939e] mb-5">
                  {step.subtitle}
                </div>

                <p className="text-sm text-[#9ca3af] leading-relaxed mb-8">
                  {step.description}
                </p>
              </div>

              <div className="pt-5 border-t border-[#1e222b]">
                <div className="text-[11px] font-mono text-[#6b7280] uppercase tracking-wider mb-3">
                  Результат этапа:
                </div>
                <ul className="space-y-2.5 text-xs text-[#d1d5db] leading-relaxed">
                  {step.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-[#e04f26] font-mono tabular-nums">
                        {step.number}.{idx + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Direct Action Strip */}
        <div className="mt-10 p-6 sm:p-8 bg-[#0e1117] border border-[#1e222b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="text-base sm:text-lg font-semibold text-[#f5f5f3] mb-1">
              Готовы запланировать визит или обсудить симптомы неисправности?
            </div>
            <div className="text-xs sm:text-sm text-[#9ca3af]">
              Оставьте заявку на удобное время или свяжитесь с мастером-приёмщиком напрямую.
            </div>
          </div>

          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#e04f26] hover:bg-[#c9431d] text-white font-semibold text-xs sm:text-sm uppercase tracking-wider transition-colors shrink-0"
          >
            <span>Перейти к записи</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
