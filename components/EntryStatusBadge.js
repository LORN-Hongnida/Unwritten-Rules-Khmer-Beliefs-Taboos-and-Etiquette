'use client';

// Where an entry stands, in plain words rather than the database's vocabulary.
// A contributor should never have to learn what 'pending' means to find out
// whether their grandmother's belief made it into the archive.
const STATUS_WORDS = {
  pending: {
    km: 'កំពុងរង់ចាំការពិនិត្យ',
    en: 'Waiting for review',
    color: 'var(--accent)',
  },
  published: {
    km: 'នៅក្នុងបណ្ណាល័យ',
    en: 'In the archive',
    color: 'var(--accent)',
  },
  returned: {
    km: 'បានបញ្ជូនត្រឡប់',
    en: 'Sent back to you',
    color: 'var(--krama-red, #a44a38)',
  },
};

export default function EntryStatusBadge({ status }) {
  const words = STATUS_WORDS[status];

  // An unknown status is a real thing to say: silence would read as published.
  if (!words) {
    return (
      <span className="entry-status-badge" style={{ opacity: 0.7 }}>
        {status}
      </span>
    );
  }

  return (
    <span
      className="entry-status-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 600,
        color: words.color,
        border: `1px solid ${words.color}`,
      }}
    >
      <span lang="km">{words.km}</span>
      <span aria-hidden="true" style={{ opacity: 0.5 }}>·</span>
      <span>{words.en}</span>
    </span>
  );
}
