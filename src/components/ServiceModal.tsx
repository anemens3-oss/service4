import React, { useEffect } from 'react';
import { ServiceItem, SITE_CONFIG } from '../config/siteConfig';
import { X, ArrowUpRight, Phone } from 'lucide-react';
import {
  DiagnosticsSchematic,
  EngineSchematic,
  BrakesSchematic,
  MaintenanceSchematic,
  SuspensionSchematic,
} from '../three/svgDrawings';

interface ServiceModalProps {
  service: ServiceItem | null;
  onClose: () => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ service, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (service) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [service, onClose]);

  if (!service) return null;

  const renderSchematic = () => {
    switch (service.category) {
      case 'diagnostics':
        return <DiagnosticsSchematic className="w-full h-auto border border-[#1e222b]" />;
      case 'engine':
        return <EngineSchematic className="w-full h-auto border border-[#1e222b]" />;
      case 'brakes':
        return <BrakesSchematic className="w-full h-auto border border-[#1e222b]" />;
      case 'maintenance':
        return <MaintenanceSchematic className="w-full h-auto border border-[#1e222b]" />;
      default:
        return <SuspensionSchematic className="w-full h-auto border border-[#1e222b]" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#0c0e13] border border-[#262b36] p-6 sm:p-9 my-8 text-[#f5f5f3]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-[#8e939e] hover:text-white border border-[#1e222b] hover:border-[#343a46] transition-colors"
          aria-label="Закрыть технологическую карту"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-xs font-mono text-[#e04f26] uppercase tracking-wider mb-2 tabular-nums">
          Направление {service.number} · Технологическая спецификация
        </div>

        <h3 className="text-2xl sm:text-4xl font-display font-bold uppercase text-[#f5f5f3] mb-1">
          {service.title}
        </h3>
        <div className="text-xs sm:text-sm text-[#8e939e] mb-6">{service.subtitle}</div>

        <div className="mb-6">{renderSchematic()}</div>

        <p className="text-sm sm:text-base text-[#d1d5db] leading-relaxed mb-6">
          {service.fullDesc}
        </p>

        <div className="p-4 bg-[#10131a] border border-[#1e222b] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono tabular-nums">
          <span className="text-[#8e939e] uppercase">Метрологический контроль:</span>
          <span className="text-[#f5f5f3]">{service.tolerances}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#10131a] p-5 border border-[#1e222b]">
            <div className="text-xs font-mono text-[#e04f26] uppercase tracking-wider mb-3">
              Показания и симптомы
            </div>
            <ul className="space-y-2.5 text-xs text-[#d1d5db] leading-relaxed">
              {service.symptoms.map((sym, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-[#e04f26] font-mono tabular-nums">0{idx + 1}</span>
                  <span>{sym}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#10131a] p-5 border border-[#1e222b]">
            <div className="text-xs font-mono text-[#e04f26] uppercase tracking-wider mb-3">
              Инструмент и стенды
            </div>
            <ul className="space-y-2.5 text-xs text-[#d1d5db] leading-relaxed">
              {service.equipment.map((eq, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-[#8e939e] font-mono tabular-nums">0{idx + 1}</span>
                  <span>{eq}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-[#1e222b]">
          <div className="text-xs text-[#8e939e] font-mono tabular-nums">
            Регламентное время: <strong className="text-[#f5f5f3]">{service.duration}</strong>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={SITE_CONFIG.contacts.phoneHref}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#14171f] hover:bg-[#1c202b] text-[#d1d5db] text-xs font-mono border border-[#262b36] transition-colors tabular-nums"
            >
              <Phone className="w-3.5 h-3.5 text-[#e04f26]" />
              <span>{SITE_CONFIG.contacts.phoneDisplay}</span>
            </a>

            <a
              href="#contact"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#e04f26] hover:bg-[#c9431d] text-white font-semibold text-xs uppercase tracking-wider transition-colors"
            >
              <span>Записаться по этому направлению</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
