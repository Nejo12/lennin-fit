export type Filters = {
  q: string;
  status: Set<'todo' | 'doing' | 'done' | 'blocked'>;
  priority: Set<'low' | 'medium' | 'high' | 'urgent'>;
};

export default function ScheduleFilters({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (f: Filters) => void;
}) {
  const toggle = <T extends string>(set: Set<T>, v: T): Set<T> => {
    const next = new Set(set);
    if (next.has(v)) {
      next.delete(v);
    } else {
      next.add(v);
    }
    return next;
  };

  const statusConfig = {
    todo: { label: 'To Do', color: 'var(--status-todo)' },
    doing: { label: 'In Progress', color: 'var(--status-doing)' },
    done: { label: 'Done', color: 'var(--status-done)' },
    blocked: { label: 'Blocked', color: 'var(--status-blocked)' },
  };

  const priorityConfig = {
    low: { label: 'Low', color: '#22c55e' },
    medium: { label: 'Medium', color: '#eab308' },
    high: { label: 'High', color: '#f97316' },
    urgent: { label: 'Urgent', color: '#ef4444' },
  };

  return (
    <div className="schedule-filters">
      <div className="filters-header">
        <div className="search-container">
          <input
            className="search-input"
            placeholder="Search tasks..."
            value={value.q}
            onChange={e => onChange({ ...value, q: e.target.value })}
            aria-label="Search tasks"
          />
        </div>

        <div className="filter-groups">
          <div className="filter-group">
            <div className="filter-label">Status</div>
            <div className="filter-chips">
              {(['todo', 'doing', 'done', 'blocked'] as const).map(s => (
                <button
                  key={s}
                  className={`filter-chip ${value.status.has(s) ? 'active' : ''}`}
                  style={
                    {
                      '--chip-color': statusConfig[s].color,
                    } as React.CSSProperties
                  }
                  onClick={() =>
                    onChange({ ...value, status: toggle(value.status, s) })
                  }
                >
                  {statusConfig[s].label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-label">Priority</div>
            <div className="filter-chips">
              {(['low', 'medium', 'high', 'urgent'] as const).map(p => (
                <button
                  key={p}
                  className={`filter-chip ${value.priority.has(p) ? 'active' : ''}`}
                  style={
                    {
                      '--chip-color': priorityConfig[p].color,
                    } as React.CSSProperties
                  }
                  onClick={() =>
                    onChange({ ...value, priority: toggle(value.priority, p) })
                  }
                >
                  {priorityConfig[p].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
