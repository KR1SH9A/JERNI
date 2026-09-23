"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { animate } from "motion";
import Image from "next/image";

export function Sidebar() {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  const handleBegin = async () => {
    if (!sidebarRef.current) return;
    setIsLeaving(true);
    
    // Animate the sidebar out to the left
    await animate(
      sidebarRef.current,
      { x: "-100%", opacity: 0 },
      { duration: 0.6, ease: [0.16, 1, 0.3, 1] } as any
    );

    // After animation finishes, navigate to dashboard
    router.push("/dashboard");
  };

  return (
    <aside
      ref={sidebarRef}
      id="landing-sidebar"
      className="sidebar"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div className="sidebar-top">
        {/* Logo area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <Image
            src="/new-logo.svg"
            alt="JERNI logo"
            width={72}
            height={46}
            priority
            style={{ height: '2rem', width: 'auto', display: 'block' }}
          />
        </div>
        
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-muted)', lineHeight: 1.4 }}>
          Scientific approach to building discipline and achieving goals.
        </p>
      </div>

      <div className="sidebar-bottom" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button 
          onClick={handleBegin}
          className="btn-primary"
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
          disabled={isLeaving}
        >
          Begin your Jerni
        </button>
        
        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', textAlign: 'center' }}>
          ©2026, All rights reserved
        </div>
      </div>
    </aside>
  );
}
