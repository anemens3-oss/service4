import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  createCarScene,
  CarSceneController,
  HotspotScreenPos,
} from '../three/carScene';
import { PAINT_PRESETS, PaintPresetId } from '../three/carModel';
import { SITE_CONFIG } from '../config/siteConfig';
import { ArrowDown, ArrowUpRight, Phone } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const Hero: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<CarSceneController | null>(null);

  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeStage, setActiveStage] = useState<number>(1);
  const [hotspots, setHotspots] = useState<HotspotScreenPos[]>([]);
  const [activePaint, setActivePaint] = useState<PaintPresetId>('obsidian');

  // 1. Mount single WebGL context & handle resize / reduced-motion / pointer parallax
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const controller = createCarScene();
    controllerRef.current = controller;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    controller.setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      controller.setReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    controller.mount(canvasContainerRef.current, {
      onLoadProgress: (pct) => setLoadProgress(pct),
      onLoadComplete: () => {
        setLoadProgress(100);
        setIsLoaded(true);
      },
      onWebGLError: (reason) => {
        setWebglError(reason);
        setIsLoaded(true);
      },
      onHotspotsUpdate: (updated) => {
        setHotspots(updated);
      },
    });

    const handleResize = () => {
      controller.resize();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      controller.setPointerNormalized(nx, ny);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      controller.unmount();
      controllerRef.current = null;
    };
  }, []);

  // 2. Bind 7-stage GSAP ScrollTrigger choreography to the scroll track
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          setScrollProgress(p);
          controllerRef.current?.setProgress(p);

          if (p < 0.14) setActiveStage(1);
          else if (p < 0.28) setActiveStage(2);
          else if (p < 0.44) setActiveStage(3);
          else if (p < 0.60) setActiveStage(4);
          else if (p < 0.76) setActiveStage(5);
          else if (p < 0.90) setActiveStage(6);
          else setActiveStage(7);
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleStageSelect = (targetStage: number) => {
    if (!sectionRef.current) return;
    const stageOffsets = [0.0, 0.19, 0.35, 0.52, 0.68, 0.84, 0.96];
    const targetProgress = stageOffsets[targetStage - 1] ?? 0;

    const rect = sectionRef.current.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const scrollableDistance = sectionRef.current.offsetHeight - window.innerHeight;

    window.scrollTo({
      top: sectionTop + scrollableDistance * targetProgress,
      behavior: 'smooth',
    });
  };

  const handlePaintSelect = (presetId: PaintPresetId) => {
    setActivePaint(presetId);
    controllerRef.current?.setPaintPreset(presetId);
  };

  const currentStageData =
    SITE_CONFIG.scrollStages.find((s) => s.stage === activeStage) ||
    SITE_CONFIG.scrollStages[0];

  const isHeroView = scrollProgress < 0.11;

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative h-[520vh] bg-[#08090c] text-[#f5f5f3]"
    >
      {/* Sticky Full-Viewport 3D Studio Stage */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden studio-vignette flex flex-col justify-between">
        {/* WebGL Canvas Mount */}
        <div
          ref={canvasContainerRef}
          className="absolute inset-0 w-full h-full z-0 pointer-events-none"
        />

        {/* Static Studio Fallback if WebGL Context Fails */}
        {webglError && (
          <div className="absolute inset-0 z-0 flex items-center justify-center p-8 bg-[#08090c]">
            <div className="max-w-xl w-full border border-[#1e222b] bg-[#101217] p-8 text-left">
              <div className="text-xs font-mono text-[#e04f26] uppercase tracking-widest mb-2">
                Dodge Challenger SRT Hellcat · 6.2L HEMI V8
              </div>
              <div className="text-2xl font-display font-bold uppercase text-white mb-3">
                Аппаратное ускорение 3D недоступно в вашем браузере
              </div>
              <p className="text-sm text-[#9ca3af] leading-relaxed">
                Интерактивная 3D-модель отключена, однако все разделы спецификаций, регламентов обслуживания и записи на сервис работают в полном объёме.
              </p>
            </div>
          </div>
        )}

        {/* Loading Overlay while GLB initializes */}
        {!isLoaded && (
          <div className="absolute inset-0 z-30 bg-[#08090c] flex flex-col items-center justify-center px-6 transition-opacity duration-500">
            <div className="w-full max-w-xs">
              <div className="flex items-center justify-between text-xs font-mono text-[#8e939e] mb-2 tabular-nums">
                <span>DODGE CHALLENGER SRT HELLCAT</span>
                <span>{loadProgress}%</span>
              </div>
              <div className="w-full h-[2px] bg-[#1e222b] overflow-hidden">
                <div
                  className="h-full bg-[#e04f26] transition-all duration-200"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 3D Projected Technical Callouts (Visible in Stages 2–6 on Desktop) */}
        <div className="hidden lg:block absolute inset-0 z-10 pointer-events-none">
          {hotspots
            .filter((hp) => hp.visible && !isHeroView)
            .map((hp) => (
              <div
                key={hp.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
                style={{ left: `${hp.x}px`, top: `${hp.y}px` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 mt-1 bg-[#e04f26] border border-white/60 shrink-0" />
                  <div className="bg-[#0b0d12]/95 border border-[#262b36] px-3.5 py-2 max-w-[230px]">
                    <div className="text-[10px] font-mono text-[#e04f26] uppercase tracking-wider tabular-nums">
                      {hp.code}
                    </div>
                    <div className="text-xs font-semibold text-[#f5f5f3] leading-snug">
                      {hp.title}
                    </div>
                    <div className="text-[11px] text-[#8e939e] leading-tight mt-0.5">
                      {hp.spec}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* TOP / MAIN CONTENT LAYER */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 flex-1 flex flex-col justify-between pb-6 pointer-events-none">
          {/* Top Sub-bar: Model Identification & Scroll Stage Counter */}
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 text-xs font-mono text-[#8e939e] tabular-nums">
            <span>{SITE_CONFIG.hero.vehicleBadge}</span>
            <span>ЭКСПОЗИЦИЯ {currentStageData.indexLabel}</span>
          </div>

          {/* Center-Left / Stage Narrative Overlay */}
          <div className="my-auto py-6">
            {isHeroView ? (
              /* INITIAL HERO PRESENTATION (Stage 1) */
              <div className="max-w-xl pointer-events-auto">
                <h1
                  className="font-display font-extrabold uppercase tracking-tight text-[#f5f5f3] leading-[0.92] mb-4"
                  style={{ fontSize: 'clamp(3rem, 6.5vw, 5.75rem)' }}
                >
                  {SITE_CONFIG.hero.headline}
                </h1>

                <p className="text-base sm:text-lg font-medium text-[#e5e7eb] leading-snug mb-3 max-w-lg">
                  {SITE_CONFIG.hero.russianTitle}
                </p>

                <p className="text-xs sm:text-sm text-[#9ca3af] leading-relaxed mb-7 max-w-md">
                  {SITE_CONFIG.hero.subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#e04f26] hover:bg-[#c9431d] text-white font-semibold text-sm transition-colors"
                  >
                    <span>{SITE_CONFIG.hero.primaryCta}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>

                  <a
                    href="#expertise"
                    className="inline-flex items-center gap-2 px-5 py-3.5 bg-[#101217]/90 hover:bg-[#171a22] text-[#d1d5db] hover:text-white font-medium text-sm border border-[#262b36] transition-colors"
                  >
                    <span>Направления сервиса</span>
                  </a>

                  <a
                    href={SITE_CONFIG.contacts.phoneHref}
                    className="inline-flex items-center gap-2 px-4 py-3.5 text-xs font-mono text-[#9ca3af] hover:text-white transition-colors tabular-nums"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#e04f26]" />
                    <span>{SITE_CONFIG.contacts.phoneDisplay}</span>
                  </a>
                </div>
              </div>
            ) : (
              /* SCROLL CHOREOGRAPHY EPISODE CARDS (Stages 2–7) */
              <div
                className={`w-full flex ${
                  currentStageData.align === 'right'
                    ? 'justify-end'
                    : currentStageData.align === 'center'
                      ? 'justify-center'
                      : 'justify-start'
                }`}
              >
                <div className="max-w-md w-full bg-[#0b0d12]/90 border border-[#222733] p-6 sm:p-7 pointer-events-auto">
                  <div className="flex items-center justify-between text-xs font-mono text-[#e04f26] uppercase tracking-wider mb-2 tabular-nums">
                    <span>{currentStageData.kicker}</span>
                    <span>{currentStageData.indexLabel}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-display font-bold uppercase text-[#f5f5f3] tracking-tight leading-tight mb-3">
                    {currentStageData.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#9ca3af] leading-relaxed mb-5">
                    {currentStageData.description}
                  </p>

                  <div className="pt-4 border-t border-[#1e222b] flex items-center justify-between gap-4 text-xs font-mono tabular-nums">
                    <span className="text-[#6b7280]">{currentStageData.metricLabel}</span>
                    <span className="text-[#f5f5f3] font-medium">
                      {currentStageData.metricValue}
                    </span>
                  </div>

                  {activeStage === 7 && (
                    <div className="mt-5 pt-4 border-t border-[#1e222b] flex flex-wrap items-center gap-3">
                      <a
                        href="#expertise"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#e04f26] hover:bg-[#c9431d] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                      >
                        <span>Перейти к услугам</span>
                        <ArrowDown className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href="#contact"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#14171f] hover:bg-[#1c202b] text-[#d1d5db] text-xs font-medium border border-[#262b36] transition-colors"
                      >
                        <span>{SITE_CONFIG.hero.primaryCta}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Studio Control Bar: 7-Stage Progress & Factory Paint Switcher */}
          <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pointer-events-auto">
            {/* 7-Stage Camera Navigation */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-[#8e939e] uppercase mr-2">
                Ракурс:
              </span>
              {SITE_CONFIG.scrollStages.map((st) => {
                const isCurrent = activeStage === st.stage;
                return (
                  <button
                    key={st.stage}
                    onClick={() => handleStageSelect(st.stage)}
                    className={`px-2.5 py-1 text-xs font-mono tabular-nums border transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-[#e04f26] border-[#e04f26] text-white font-semibold'
                        : 'bg-[#101217]/90 border-[#1e222b] text-[#9ca3af] hover:text-white hover:border-[#343a46]'
                    }`}
                    title={st.title}
                  >
                    0{st.stage}
                  </button>
                );
              })}
            </div>

            {/* Factory Paint Finish Selector & Scroll Prompt */}
            <div className="flex items-center justify-between w-full md:w-auto gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#8e939e] uppercase">
                  Цвет кузова:
                </span>
                <div className="flex items-center gap-1.5">
                  {PAINT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePaintSelect(preset.id)}
                      className={`w-5 h-5 border transition-transform cursor-pointer ${
                        activePaint === preset.id
                          ? 'border-white scale-110'
                          : 'border-white/25 hover:border-white/60'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                      title={preset.name}
                      aria-label={`Цвет кузова ${preset.name}`}
                    />
                  ))}
                </div>
              </div>

              <a
                href="#expertise"
                className="hidden sm:inline-flex items-center gap-2 text-xs font-mono text-[#9ca3af] hover:text-white transition-colors"
              >
                <span>Прокрутите вниз</span>
                <ArrowDown className="w-3.5 h-3.5 text-[#e04f26]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
