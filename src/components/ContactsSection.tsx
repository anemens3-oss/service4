import React, { useState } from 'react';
import { SITE_CONFIG } from '../config/siteConfig';
import { Phone, Copy, Check, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const ContactsSection: React.FC = () => {
  const [copied, setCopied] = useState(false);

  // Booking form state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [serviceType, setServiceType] = useState('diagnostics');
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(SITE_CONFIG.contacts.phoneDisplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = clientPhone.replace(/\D/g, '');
    if (digits.length < 7) {
      setFormError('Укажите корректный номер телефона для обратной связи.');
      return;
    }
    if (!vehicleModel.trim()) {
      setFormError('Укажите марку и модель автомобиля.');
      return;
    }
    setFormError(null);
    setSubmitted(true);
  };

  return (
    <section
      id="contact"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#08090c] border-t border-[#1e222b]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 mb-14 border-b border-[#1e222b] items-end">
          <div className="lg:col-span-7">
            <div className="text-xs font-mono text-[#e04f26] uppercase tracking-widest mb-3 tabular-nums">
              06 · Запись и контакты
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-bold uppercase tracking-tight text-[#f5f5f3] leading-[0.98]">
              Записаться на сервис или проконсультироваться с мастером
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm sm:text-base text-[#9ca3af] leading-relaxed">
              Свяжитесь с нами по телефону или заполните заявку на резерв диагностического поста.
            </p>
          </div>
        </div>

        {/* Two-Column Editorial Contact & Booking Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#1e222b] bg-[#0a0c10]">
          {/* Left Column: Direct Contact Details & Schedule */}
          <div className="lg:col-span-5 p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-[#1e222b] flex flex-col justify-between">
            <div className="space-y-8">
              {/* Direct Phone */}
              <div>
                <div className="text-xs font-mono text-[#8e939e] uppercase tracking-wider mb-2">
                  Телефон мастера-приёмщика
                </div>
                <a
                  href={SITE_CONFIG.contacts.phoneHref}
                  className="block text-3xl sm:text-4xl font-display font-bold tracking-wider text-[#f5f5f3] hover:text-[#e04f26] transition-colors tabular-nums mb-4"
                >
                  {SITE_CONFIG.contacts.phoneDisplay}
                </a>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={SITE_CONFIG.contacts.phoneHref}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#e04f26] hover:bg-[#c9431d] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Позвонить</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="inline-flex items-center gap-2 px-4 py-3 bg-[#10131a] hover:bg-[#161a24] text-[#d1d5db] text-xs font-mono border border-[#1e222b] transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-[#e04f26]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? 'Номер скопирован' : 'Скопировать'}</span>
                  </button>
                </div>
              </div>

              {/* Address */}
              <div className="pt-6 border-t border-[#1e222b]">
                <div className="text-xs font-mono text-[#8e939e] uppercase tracking-wider mb-1.5">
                  Адрес техцентра
                </div>
                <div className="text-lg font-medium text-[#f5f5f3] mb-1">
                  {SITE_CONFIG.contacts.address}
                </div>
                <div className="text-xs text-[#6b7280]">
                  {SITE_CONFIG.contacts.addressComment}
                </div>
              </div>

              {/* Working Hours */}
              <div className="pt-6 border-t border-[#1e222b]">
                <div className="text-xs font-mono text-[#8e939e] uppercase tracking-wider mb-1.5">
                  График работы
                </div>
                <div className="text-base font-mono text-[#f5f5f3] tabular-nums mb-1">
                  {SITE_CONFIG.contacts.workingHours}
                </div>
                <div className="text-xs text-[#8e939e]">
                  Приём автомобилей по предварительной записи
                </div>
              </div>
            </div>

            {/* Configurable Demo Notice */}
            {SITE_CONFIG.contacts.isDemoPlaceholder && (
              <div className="mt-8 pt-5 border-t border-[#1e222b] text-[11px] font-mono text-[#6b7280] leading-relaxed">
                Примечание: контактные данные выше являются демонстрационными и редактируются в файле конфигурации <code className="text-[#9ca3af]">src/config/siteConfig.ts</code>.
              </div>
            )}
          </div>

          {/* Right Column: Validated Service Booking Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 bg-[#0c0e14]">
            {submitted ? (
              <div className="h-full flex flex-col justify-center py-8">
                <div className="flex items-center gap-3 text-[#e04f26] font-mono text-xs uppercase tracking-wider mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Заявка зарегистрирована</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-bold uppercase text-[#f5f5f3] mb-3">
                  Предварительная запись оформлена
                </h3>
                <p className="text-sm text-[#9ca3af] leading-relaxed mb-6 max-w-lg">
                  Автомобиль: <strong className="text-[#f5f5f3]">{vehicleModel}</strong>. Мастер-приёмщик свяжется с вами по номеру{' '}
                  <strong className="text-[#f5f5f3] font-mono tabular-nums">{clientPhone}</strong> для подтверждения времени заезда на пост.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#1e222b]">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setClientName('');
                      setClientPhone('');
                      setVehicleModel('');
                      setComment('');
                    }}
                    className="px-5 py-2.5 bg-[#14171f] hover:bg-[#1c202b] text-xs font-mono text-[#d1d5db] border border-[#262b36] transition-colors cursor-pointer"
                  >
                    Отправить ещё одну заявку
                  </button>

                  <a
                    href={SITE_CONFIG.contacts.phoneHref}
                    className="px-5 py-2.5 bg-[#e04f26] hover:bg-[#c9431d] text-xs font-semibold text-white uppercase tracking-wider transition-colors"
                  >
                    Позвонить напрямую
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="text-xs font-mono text-[#e04f26] uppercase tracking-wider">
                  Форма предварительной записи на пост
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="booking-name"
                      className="block text-xs font-mono text-[#8e939e] uppercase mb-2"
                    >
                      Ваше имя
                    </label>
                    <input
                      id="booking-name"
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Александр"
                      className="w-full px-4 py-3 bg-[#08090c] border border-[#1e222b] focus:border-[#e04f26] text-sm text-[#f5f5f3] placeholder-[#4b5563] outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="booking-phone"
                      className="block text-xs font-mono text-[#8e939e] uppercase mb-2"
                    >
                      Телефон для связи *
                    </label>
                    <input
                      id="booking-phone"
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+7 (___) ___-__-__"
                      className="w-full px-4 py-3 bg-[#08090c] border border-[#1e222b] focus:border-[#e04f26] text-sm font-mono text-[#f5f5f3] placeholder-[#4b5563] outline-none transition-colors tabular-nums"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="booking-vehicle"
                      className="block text-xs font-mono text-[#8e939e] uppercase mb-2"
                    >
                      Марка и модель автомобиля *
                    </label>
                    <input
                      id="booking-vehicle"
                      type="text"
                      required
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="Dodge Challenger SRT / BMW M5"
                      className="w-full px-4 py-3 bg-[#08090c] border border-[#1e222b] focus:border-[#e04f26] text-sm text-[#f5f5f3] placeholder-[#4b5563] outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="booking-service"
                      className="block text-xs font-mono text-[#8e939e] uppercase mb-2"
                    >
                      Направление работ
                    </label>
                    <select
                      id="booking-service"
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-4 py-3 bg-[#08090c] border border-[#1e222b] focus:border-[#e04f26] text-sm text-[#f5f5f3] outline-none transition-colors"
                    >
                      {SITE_CONFIG.services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.number}. {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="booking-comment"
                    className="block text-xs font-mono text-[#8e939e] uppercase mb-2"
                  >
                    Описание симптомов или комментарий (по желанию)
                  </label>
                  <textarea
                    id="booking-comment"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Укажите характер неисправности, желаемую дату визита или VIN для подбора запчастей"
                    className="w-full px-4 py-3 bg-[#08090c] border border-[#1e222b] focus:border-[#e04f26] text-sm text-[#f5f5f3] placeholder-[#4b5563] outline-none transition-colors resize-none"
                  />
                </div>

                {formError && (
                  <div className="text-xs font-mono text-[#e04f26]">{formError}</div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#e04f26] hover:bg-[#c9431d] text-white font-semibold text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <span>Записаться на сервис</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <span className="text-[11px] font-mono text-[#6b7280]">
                    Без спама и автодозвонов · Ответ мастера в рабочее время
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
