export default function EntryCard({ entry }) {
  return (
    <article className="entry-card">
      <div className="entry-image-placeholder">image coming soon</div>

      <div className="entry-body">
        <span className="entry-category">{entry.category}</span>
        <h3 className="entry-title">{entry.title}</h3>
        <p className="entry-text">{entry.description}</p>

        {entry.reason && (
          <div className="entry-reason">
            <span className="entry-reason-label">Actual meaning</span>
            {entry.reason}
          </div>
        )}

        <div className="entry-meta">
          <span className="entry-meta-item">
            Contributed by <strong>{entry.contributor}</strong>
          </span>
          <span className="entry-meta-dot">•</span>
          <span className="entry-meta-item">
            Still believed? {entry.stillBelieved}
          </span>
          <span className="entry-meta-dot">•</span>
          <span className="entry-meta-item">
            Place: {entry.place}
          </span>
        </div>
      </div>
    </article>
  );
}
