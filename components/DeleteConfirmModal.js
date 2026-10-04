'use client';

import { ThemeVibeIcon } from "./KbachMotifs";

export default function DeleteConfirmModal({
  isOpen,
  title,
  onConfirm,
  onCancel,
  loading
}) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{ zIndex: 1100, backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className="modal-panel"
        style={{
          maxWidth: '460px',
          padding: '28px 24px',
          borderRadius: '16px',
          textAlign: 'center',
          border: '1px solid var(--krama-red, #a44a38)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ margin: '0 auto 16px', color: 'var(--krama-red, #a44a38)' }}>
          <ThemeVibeIcon motif="moon" size={32} />
        </div>

        <h3 id="delete-modal-title" style={{ fontFamily: 'var(--font-serif-title)', fontSize: '20px', margin: '0 0 4px', color: 'var(--text-primary)' }}>
          លុបទិន្នន័យ / Confirm Delete
        </h3>

        <p style={{ fontSize: '14px', color: 'var(--ink-muted)', margin: '12px 0 24px', lineHeight: 1.5 }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>&quot;{title}&quot;</strong> from the archive? This action cannot be undone.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            type="button"
            className="auth-submit"
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1,
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--ink-muted)',
              padding: '12px 18px',
              fontSize: '13px'
            }}
          >
            Cancel / បោះបង់
          </button>
          <button
            type="button"
            className="auth-submit"
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              background: 'var(--krama-red, #a44a38)',
              borderColor: 'var(--krama-red, #a44a38)',
              color: '#fff',
              padding: '12px 18px',
              fontSize: '13px'
            }}
          >
            {loading ? 'Deleting...' : 'Delete / លុបទិន្នន័យ'}
          </button>
        </div>
      </div>
    </div>
  );
}
