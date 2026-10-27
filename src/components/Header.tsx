import React, { useState, useEffect } from 'react';
import { SITE_CONFIG } from '../config/siteConfig';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 32);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Компетенции', href: '#expertise' },
    { label: 'Инженерия', href: '#engineering' },
    { label: 'Техцентр', href: '#workshop' },
    { label: 'Процесс', href: '#process' },
    { label: 'Контакты', href: '#contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 border-b ${
          isScrolled
            ? 'bg-[#08090c]/95 border-[#1e222b] py-3.5'
            : 'bg-transparent border-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#hero"
            className="font-display font-bold text-xl sm:text-2xl tracking-[0.08em] text-[#f5f5f3] uppercase whitespace-nowrap shrink-0"
          >
            {SITE_CONFIG.brandName}
          </a>

          {/* Zone 2: 5 Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#9ca3af]">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-[#f5f5f3] transition-colors whitespace-nowrap shrink-0"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#e04f26] hover:bg-[#c9431d] transition-colors whitespace-nowrap shrink-0"
            >
              <span>{SITE_CONFIG.hero.primaryCta}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#d1d5db] hover:text-white border border-[#1e222b] bg-[#101217]"
              aria-label="Открыть меню навигации"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#08090c] flex flex-col justify-between pt-24 pb-10 px-6 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="flex flex-col border-t border-[#1e222b]">
            {navItems.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-4 border-b border-[#1e222b] text-2xl font-display uppercase tracking-wide text-[#f5f5f3]"
              >
                <span>{item.label}</span>
                <span className="text-xs font-mono text-[#6b7280] tabular-nums">
                  0{index + 1}
                </span>
              </a>
            ))}
          </div>

          <div className="space-y-4">
            <div className="text-xs font-mono text-[#8e939e] tabular-nums">
              {SITE_CONFIG.contacts.workingHours} · {SITE_CONFIG.contacts.phoneDisplay}
            </div>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[#e04f26] text-white font-semibold text-sm uppercase tracking-wider"
            >
              <span>{SITE_CONFIG.hero.primaryCta}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </>
  );
};
