'use client';

import { useState, useRef } from 'react';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import PillNav, { PillNavItem } from './pill-nav';
import { Logo } from '@/components/brand/Logo';

export function NavClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [showSignoutModal, setShowSignoutModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleConfirmSignout = () => {
    formRef.current?.submit();
  };

  const items: PillNavItem[] = [
    { label: 'Discover', href: '/discover' }
  ];

  if (isLoggedIn) {
    items.push({ label: 'Dashboard', href: '/dashboard' });
    items.push({
      label: 'Sign out',
      onClick: (e) => {
        e.preventDefault();
        setShowSignoutModal(true);
      }
    });
  } else {
    items.push({ label: 'Sign in', href: '/auth/login' });
    items.push({ label: 'Get started', href: '/auth/signup' });
  }

  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000, pointerEvents: 'none' }}>
        <div className="container" style={{ position: 'relative', pointerEvents: 'auto' }}>
          <PillNav
            logo={<Logo height={48} />}
            items={items}
          />
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
