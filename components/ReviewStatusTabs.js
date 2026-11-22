'use client';

import { useLanguage } from './LanguageProvider';

// Which entries the admin page lists. Pending comes first because the queue is
// the page's main job; the rest let an admin find and manage any entry.
const TABS = [
  { value: 'pending', en: 'Pending', km: 'កំពុងរង់ចាំ' },
  { value: 'returned', en: 'Returned', km: 'បានបញ្ជូនត្រឡប់' },
  { value: 'published', en: 'Published', km: 'បានផ្សព្វផ្សាយ' },
  { value: 'all', en: 'All', km: 'ទាំងអស់' },
];

// `tabs` lets another page (My Entries) bring its own set; `counts`, when
// given, shows how many entries sit behind each tab. Styled with Browse's
// category pills so every filter on the site looks the same.
export default function ReviewStatusTabs({ value, onChange, tabs = TABS, counts = null }) {
  const { t } = useLanguage();
  return (
    <div role="tablist" aria-label={t({ en: 'Filter entries by status', km: 'ត្រងធាតុតាមស្ថានភាព' })} className="filter-pills"
      style={{ marginBottom: '20px' }}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={`filter-pill ${active ? 'is-active' : ''}`}
            onClick={() => onChange(tab.value)}
          >
            <span>{t(tab)}</span>
            {counts && <span className="filter-pill-count">{counts[tab.value] ?? 0}</span>}
          </button>
        );
      })}
    </div>
  );
}
