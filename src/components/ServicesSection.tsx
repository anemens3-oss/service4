import React, { useState } from 'react';
import { SITE_CONFIG, ServiceItem } from '../config/siteConfig';
import { ServiceModal } from './ServiceModal';
import { ArrowUpRight } from 'lucide-react';
import {
  DiagnosticsSchematic,
  EngineSchematic,
  BrakesSchematic,
  MaintenanceSchematic,
} from '../three/svgDrawings';

export const ServicesSection: React.FC = () => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const renderGraphic = (category: ServiceItem['category']) => {
    switch (category) {
      case 'diagnostics':
        return <DiagnosticsSchematic className="w-full h-44 object-cover" />;
      case 'maintenance':
        return <MaintenanceSchematic className="w-full h-44 object-cover" />;
      case 'brakes':
        return <BrakesSchematic className="w-full h-44 object-cover" />;
      case 'engine':
        return <EngineSchematic className="w-full h-44 object-cover" />;
      default:
        return <DiagnosticsSchematic className="w-full h-44 object-cover" />;
    }
  };

  return (
    <section
      id="expertise"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#08090c] border-t border-[#1e222b]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Editorial Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 mb-14 border-b border-[#1e222b] items-end">
          <div className="lg:col-span-7">
            <div className="text-xs font-mono text-[#e04f26] uppercase tracking-widest mb-3 tabular-nums">
              02 · Компетенции и регламент
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-bold uppercase tracking-tight text-[#f5f5f3] leading-[0.98]">
              Четыре ключевых направления технического обслуживания
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm sm:text-base text-[#9ca3af] leading-relaxed">
              Каждая услуга выполняется по заводским технологическим картам с фиксацией измеряемых параметров — от осциллографии фаз ГРМ до контроля биения тормозных роторов.
            </p>
          </div>
        </div>

        {/* 4 Core Expertise Areas in a 2x2 Architectural Hairline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-[#1e222b]">
          {SITE_CONFIG.services.map((item) => (
            <article
              key={item.id}
              onClick={() => setSelectedService(item)}
              className="group bg-[#0a0c10] hover:bg-[#0f1218] border-r border-b border-[#1e222b] p-6 sm:p-9 flex flex-col justify-between transition-colors cursor-pointer"
            >
              <div>
                {/* Top Index & Specification Trigger */}
                <div className="flex items-center justify-between gap-4 text-xs font-mono mb-6 tabular-nums">
                  <span className="text-[#e04f26] font-semibold">
                    {item.number} · {item.subtitle}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#8e939e] group-hover:text-[#f5f5f3] transition-colors shrink-0">
                    <span>Техкарта</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </div>

                {/* Technical Diagram */}
                <div className="mb-6 border border-[#1e222b] overflow-hidden bg-[#0b0d12]">
                  {renderGraphic(item.category)}
                </div>

                {/* Title & Concrete Description */}
                <h3 className="text-2xl sm:text-3xl font-display font-bold uppercase text-[#f5f5f3] mb-3 group-hover:text-[#e04f26] transition-colors">
                  {item.title}
                </h3>

                <p className="text-sm text-[#9ca3af] leading-relaxed mb-6">
                  {item.shortDesc}
                </p>
              </div>

              {/* Concrete Metrology Spec & Duration Footer */}
              <div className="pt-5 border-t border-[#1e222b] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono tabular-nums">
                <span className="text-[#d1d5db]">{item.tolerances}</span>
                <span className="text-[#6b7280] shrink-0">Время: {item.duration}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <ServiceModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </section>
  );
};
