'use client';

import { ThemeVibeIcon } from "./KbachMotifs";
import { useLanguage } from "./LanguageProvider";

export default function DeleteConfirmModal({
  isOpen,
  title,
  onConfirm,
  onCancel,
  loading
}) {
  const { t } = useLanguage();
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
          {t({ en: 'Confirm Delete', km: 'បញ្ជាក់ការលុប' })}
        </h3>

        <p style={{ fontSize: '14px', color: 'var(--ink-muted)', margin: '12px 0 24px', lineHeight: 1.5 }}>
          {t({ en: 'Are you sure you want to delete', km: 'តើអ្នកប្រាកដថាចង់លុប' })}{' '}
          <strong style={{ color: 'var(--text-primary)' }}>&quot;{title}&quot;</strong>{' '}
          {t({ en: 'from the archive? This action cannot be undone.', km: 'ចេញពីបណ្ណសារមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។' })}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
            style={{ flex: 1 }}
          >
            {t({ en: 'Cancel', km: 'បោះបង់' })}
          </button>
          <button
            type="button"
            className="btn btn-danger-solid"
            onClick={onConfirm}
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? t({ en: 'Deleting…', km: 'កំពុងលុប…' }) : t({ en: 'Delete', km: 'លុប' })}
          </button>
        </div>
      </div>
    </div>
  );
}
