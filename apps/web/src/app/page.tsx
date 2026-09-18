"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { Sidebar } from "@/components/Sidebar";

// Dynamically import the 3D scene to avoid SSR mismatch issues with Canvas
const JerniBelt = dynamic(() => import("@/components/JerniBelt"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', color: 'var(--color-muted)' }}>
      Loading 3D Scene...
    </div>
  ),
});

export default function LandingPage() {
  // Initialize Lenis for smooth scrolling
  useEffect(() => {
    (async () => {
      const Lenis = (await import('lenis')).default;
      const lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
      });

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      return () => {
        lenis.destroy();
      };
    })();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      
      <main className="main-content">
        {/* Section 1: Hero with 3D Typography */}
        <section style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
          <JerniBelt />
        </section>

        {/* Section 2: Intro & Mission */}
        <section className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
          <h2 className="heading-section" style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>
            A <span className="cutesy-accent">beautiful</span> way to learn.
          </h2>
          <p className="text-lead" style={{ maxWidth: '800px', margin: '0 auto' }}>
            We combine rigorous academic research with elegant design to help you build lasting discipline.
            JERNI isn’t just another tracker—it’s a physical, tangible space for your personal growth.
          </p>
        </section>

        {/* Section 3: Case Studies & Research Base */}
        <section className="container" style={{ padding: '4rem 2rem 8rem' }}>
          <h3 className="heading-section" style={{ marginBottom: '4rem', fontSize: '2.5rem' }}>
            Research & Metrics
          </h3>
          
          <div className="grid-projects">
            <div className="grid-item-featured card">
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-error)' }}>
                Case Study 01
              </h4>
              <p style={{ color: 'var(--color-muted-2)' }}>[ Research metrics and animated graphs will be placed here in the next step ]</p>
            </div>
            
            <div className="grid-item-half card">
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>
                Efficacy Data
              </h4>
              <p style={{ color: 'var(--color-muted-2)' }}>[ Metrics placeholder ]</p>
            </div>
            
            <div className="grid-item-half card">
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>
                User Retention
              </h4>
              <p style={{ color: 'var(--color-muted-2)' }}>[ Metrics placeholder ]</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
