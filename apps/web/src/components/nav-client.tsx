'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import Logo from '@/components/brand/Logo';

export function NavClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [showSignoutModal, setShowSignoutModal] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect current theme on mount
    const root = document.documentElement;
    const current = root.getAttribute('data-theme') as 'light' | 'dark' | null;
    if (current) {
      setTheme(current);
    } else {
      if (typeof window !== 'undefined') {
        const isLight = localStorage.getItem('theme') === 'light' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: light)').matches);
        setTheme(isLight ? 'light' : 'dark');
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAvatarMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConfirmSignout = () => {
    formRef.current?.submit();
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const navItems = [
    { label: 'Discover', href: '/discover' }
  ];

  if (isLoggedIn) {
    navItems.push({ label: 'Dashboard', href: '/dashboard' });
  }

  return (
    <>
      <div style={{ position: 'fixed', top: '16px', left: 0, width: '100%', zIndex: 100, display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 'var(--container)', padding: '0 var(--gutter)' }}>
          
          <Link href="/" aria-label="Home" style={{ display: 'flex' }}>
            <Logo height={48} />
          </Link>

          <nav style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--rp)',
            padding: '4px',
            display: 'flex',
            gap: '4px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  style={{
                    fontFamily: 'var(--f-ui)',
                    fontWeight: 600,
                    fontSize: '14px',
                    padding: '8px 24px',
                    borderRadius: 'var(--rp)',
                    textDecoration: 'none',
                    color: isActive ? 'var(--cream)' : 'var(--text)',
                    background: isActive ? 'var(--lav-600)' : 'transparent',
                    transition: 'background var(--d1) var(--ease), color var(--d1) var(--ease)'
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div style={{ position: 'relative' }} ref={menuRef}>
            {isLoggedIn ? (
              <button 
                onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'var(--accent)', border: '2px solid var(--surface)',
                  color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 0, cursor: 'pointer'
                }}
              >
                U
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link href="/auth/login" className="btn btn-ghost">Sign in</Link>
                <Link href="/auth/signup" className="btn btn-primary">Get started</Link>
              </div>
            )}

            {isLoggedIn && isAvatarMenuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                background: 'var(--surface)', border: '1px solid var(--line)',
                borderRadius: 'var(--r2)', padding: '8px', minWidth: '160px',
                boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '4px'
              }}>
                <button className="btn-ghost" onClick={toggleTheme} style={{ width: '100%', justifyContent: 'flex-start' }}>
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </button>
                <div style={{ height: '1px', background: 'var(--line)', margin: '4px 0' }} />
                <button className="btn-ghost" onClick={() => { setShowSignoutModal(true); setIsAvatarMenuOpen(false); }} style={{ width: '100%', justifyContent: 'flex-start' }}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoggedIn && (
        <>
          <form ref={formRef} action="/auth/signout" method="post" style={{ display: 'none' }} />
          <ConfirmModal
            isOpen={showSignoutModal}
            title="Sign out"
            description="Are you sure you want to sign out of your account?"
            confirmText="Sign out"
            cancelText="Cancel"
            onConfirm={handleConfirmSignout}
            onCancel={() => setShowSignoutModal(false)}
          />
        </>
      )}
    </>
  );
}
