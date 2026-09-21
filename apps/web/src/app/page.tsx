"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";

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
    <main style={{ background: 'var(--color-bg)', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      {/* Section 1: Hero with 3D Typography */}
      <section style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <JerniBelt />
      </section>

      {/* Section 2 & 3: Swiss Information Grid */}
      <section style={{ padding: '8rem 2rem' }}>
        <div className="container" style={{ padding: 0 }}>
          
          {/* Boxed Grid Container for true Swiss feel */}
          <div style={{ border: '1px solid var(--color-border)' }}>
            
            {/* Massive Heading */}
            <div style={{ padding: '4rem', borderBottom: '2px solid var(--color-text)' }}>
              <h2 className="heading-swiss-hero" style={{ color: 'var(--color-text)', margin: 0 }}>
                A <span style={{ color: 'var(--color-accent)' }}>RIGID</span> STRUCTURE <br/> FOR FLUID GROWTH.
              </h2>
            </div>
            
            {/* 12-column Swiss Grid with strict borders */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)' }}>
              
              {/* Left Column (Span 4) */}
              <div style={{ gridColumn: '1 / span 4', borderRight: '1px solid var(--color-border)', padding: '3rem 4rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8rem', color: 'var(--color-text)' }}>
                  THE PLATFORM
                </h3>
                <p style={{ fontSize: '1.125rem', color: 'var(--color-muted)', lineHeight: 1.6, fontWeight: 400 }}>
                  We combine rigorous academic research with elegant design to help you build lasting discipline. JERNI is a physical, tangible space for your personal growth.
                </p>
              </div>

              {/* Right Column (Span 8) split into rows/columns */}
              <div style={{ gridColumn: '5 / span 8', display: 'flex', flexDirection: 'column' }}>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--color-border)', flex: 1 }}>
                   {/* Item 1 */}
                   <div style={{ padding: '3rem 4rem', borderRight: '1px solid var(--color-border)' }}>
                      <h3 style={{ fontSize: '5rem', fontWeight: 700, color: 'var(--color-accent)', lineHeight: 0.9, marginBottom: '6rem', letterSpacing: '-0.02em' }}>01</h3>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Case Study</h4>
                      <p style={{ marginTop: '1.5rem', color: 'var(--color-muted)', fontSize: '1rem', lineHeight: 1.6 }}>Research metrics and user data tracking mapped directly to cognitive retention.</p>
                   </div>
                   {/* Item 2 */}
                   <div style={{ padding: '3rem 4rem' }}>
                      <h3 style={{ fontSize: '5rem', fontWeight: 700, color: 'var(--color-info)', lineHeight: 0.9, marginBottom: '6rem', letterSpacing: '-0.02em' }}>02</h3>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Efficacy Data</h4>
                      <p style={{ marginTop: '1.5rem', color: 'var(--color-muted)', fontSize: '1rem', lineHeight: 1.6 }}>Measured improvements in discipline through continuous iterations.</p>
                   </div>
                 </div>

                 {/* Item 3 (Full width in the remaining space) */}
                 <div style={{ padding: '3rem 4rem', flex: 1 }}>
                    <div style={{ display: 'flex', gap: '4rem', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: '5rem', fontWeight: 700, color: 'var(--color-warning)', lineHeight: 0.9, margin: 0, letterSpacing: '-0.02em' }}>03</h3>
                      <div style={{ maxWidth: '400px', paddingTop: '0.5rem' }}>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Retention</h4>
                        <p style={{ marginTop: '1.5rem', color: 'var(--color-muted)', fontSize: '1rem', lineHeight: 1.6 }}>Engaging feedback loops designed to keep you focused on the journey, not just the destination.</p>
                      </div>
                    </div>
                 </div>

              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

