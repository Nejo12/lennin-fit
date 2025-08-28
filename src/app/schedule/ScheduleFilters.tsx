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

  return (
    <div className="filters row gap">
      <input
        className="search"
        placeholder="Search tasks…"
        value={value.q}
        onChange={e => onChange({ ...value, q: e.target.value })}
        aria-label="Search tasks"
      />
      <div className="chips">
        {(['todo', 'doing', 'done', 'blocked'] as const).map(s => (
          <button
            key={s}
            className={`chip ${value.status.has(s) ? 'on' : ''}`}
            onClick={() =>
              onChange({ ...value, status: toggle(value.status, s) })
            }
          >
            {s}
          </button>
        ))}
      </div>
      <div className="chips">
        {(['low', 'medium', 'high', 'urgent'] as const).map(p => (
          <button
            key={p}
            className={`chip ${value.priority.has(p) ? 'on' : ''}`}
            onClick={() =>
              onChange({ ...value, priority: toggle(value.priority, p) })
            }
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
