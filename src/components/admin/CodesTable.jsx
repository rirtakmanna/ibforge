import './CodesTable.css';

const CODE_FILTERS = ['ALL', 'ACTIVE', 'USED', 'TRIAL', 'FULL'];

export default function CodesTable({
  codes,
  codesFilter,
  codesSearch,
  onFilterChange,
  onSearchChange,
  totalCount,
}) {
  return (
    <section className="admin__section codes-table">
      <div className="admin__section-header">
        <h2 className="admin__section-title">
          All codes
          <span className="admin__count-badge">{totalCount}</span>
        </h2>
        <div className="codes-table__controls">
          <div className="admin__tabs" role="tablist" aria-label="Filter codes">
            {CODE_FILTERS.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={codesFilter === f}
                className={`admin__tab${codesFilter === f ? ' admin__tab--active' : ''}`}
                onClick={() => onFilterChange(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            type="search"
            className="admin__input codes-table__search"
            placeholder="Search code or email…"
            value={codesSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search codes"
          />
        </div>
      </div>

      {codes.length === 0 ? (
        <div className="admin__empty">No codes match this filter.</div>
      ) : (
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Email</th>
                <th>Created</th>
                <th>Used By</th>
                <th>Used At</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((code) => (
                <tr key={code.id} className="codes-table__row">
                  <td className="admin__mono codes-table__code">{code.id}</td>
                  <td>
                    <span className={`admin__status-chip admin__status-chip--plan-${code.plan}`}>
                      {code.plan?.toUpperCase() || '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`admin__status-chip ${code.used ? 'admin__status-chip--used' : 'admin__status-chip--active'}`}>
                      {code.used ? 'USED' : 'ACTIVE'}
                    </span>
                  </td>
                  <td className="admin__mono admin__email">{code.email || '—'}</td>
                  <td className="admin__mono admin__muted">{formatDate(code.createdAt)}</td>
                  <td className="admin__mono admin__email">{code.usedBy || '—'}</td>
                  <td className="admin__mono admin__muted">{formatDate(code.usedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}