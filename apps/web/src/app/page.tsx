"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrambleTextPlugin);
}
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
  const topicRef = useRef<HTMLSpanElement>(null);
  const topics = ["Journey", "Routine", "Path", "Workflow", "Curriculum"];

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

  // Flipping text effect with GSAP ScrambleText
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % topics.length;
      if (topicRef.current) {
        gsap.to(topicRef.current, {
          duration: 0.8,
          scrambleText: {
            text: topics[index],
            chars: "lowerCase",
            revealDelay: 0.1,
            speed: 0.5,
          },
        });
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [topics.length]);

  const handleNavHover = (e: React.MouseEvent<HTMLAnchorElement>, text: string) => {
    gsap.to(e.currentTarget, {
      duration: 0.5,
      scrambleText: { text, chars: "lowerCase", speed: 1 },
    });
  };

  return (
    <main style={{ background: 'var(--color-bg)', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      {/* Section 1: Hero with 3D Typography */}
      <section style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <JerniBelt />
        
        {/* Overlay Navigation */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '2.5rem 3.5rem', display: 'flex', justifyContent: 'flex-end', zIndex: 10, color: '#4C5372', pointerEvents: 'none' }}>
           <nav style={{ display: 'flex', gap: '3rem', fontSize: '1.1rem', fontWeight: 500, pointerEvents: 'auto' }}>
             <a href="#about" onMouseEnter={(e) => handleNavHover(e, 'What is JERNI?')} style={{ textDecoration: 'none', color: 'inherit' }}>What is JERNI?</a>
             <a href="/auth/login" onMouseEnter={(e) => handleNavHover(e, 'Log in')} style={{ textDecoration: 'none', color: 'inherit' }}>Log in</a>
             <a href="/auth/signup" onMouseEnter={(e) => handleNavHover(e, 'Join today')} style={{ textDecoration: 'none', color: '#7C7E9D' }}>Join today</a>
           </nav>
        </div>

        {/* Overlay Bottom Left */}
        <div style={{ position: 'absolute', bottom: '3.5rem', left: '3.5rem', zIndex: 10, color: '#4C5372', pointerEvents: 'none', maxWidth: '30vw' }}>
           <h1 style={{ fontSize: 'clamp(1rem, 2vw, 2.5rem)', fontWeight: 600, margin: 0, lineHeight: 1, fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              Join or Create your own <span ref={topicRef} style={{ color: '#949AB1', display: 'inline-block', minWidth: '150px' }}>{topics[0]}</span>
           </h1>
        </div>
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

