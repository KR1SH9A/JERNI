'use client';

import { useState, useRef } from 'react';
import { ConfirmModal } from '@/components/ui/confirm-modal';

export function SignoutButton() {
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleConfirm = () => {
    formRef.current?.submit();
  };

  return (
    <>
      <button
        type="button"
        className="nav-link-btn"
        id="nav-signout"
        aria-label="Sign out"
        onClick={() => setShowModal(true)}
      >
        Sign out
      </button>

      <form ref={formRef} action="/auth/signout" method="post" style={{ display: 'none' }} />

      <ConfirmModal
        isOpen={showModal}
        title="Sign out"
        description="Are you sure you want to sign out of your account?"
        confirmText="Sign out"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
}
