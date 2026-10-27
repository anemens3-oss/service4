import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { WhyDetailsMatter } from './components/WhyDetailsMatter';
import { AboutSection } from './components/AboutSection';
import { ProcessSection } from './components/ProcessSection';
import { ContactsSection } from './components/ContactsSection';
import { Footer } from './components/Footer';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function App() {
  useEffect(() => {
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#08090c] text-[#f5f5f3] flex flex-col font-sans selection:bg-[#e04f26] selection:text-white">
      {/* 3-Zone Top Navigation */}
      <Header />

      {/* 6-Section User Journey */}
      <main className="flex-1 w-full">
        {/* Section 1: Hero & 7-Stage Dodge Challenger SRT Hellcat 3D Presentation */}
        <Hero />

        {/* Section 2: Expertise (4 Core Service Directions) */}
        <ServicesSection />

        {/* Section 3: Engineering (Metrology, Tolerances & Root-Cause Elimination) */}
        <WhyDetailsMatter />

        {/* Section 4: Workshop (Specialized Bays, Equipment & Standards) */}
        <AboutSection />

        {/* Section 5: Process (3 Transparent Stages) */}
        <ProcessSection />

        {/* Section 6: Contact & Booking */}
        <ContactsSection />
      </main>

      {/* Quiet Editorial Footer with 3D Asset Attribution */}
      <Footer />
    </div>
  );
}
