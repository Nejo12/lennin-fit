import React, { useMemo, useState } from 'react';
import { buildWeek, toISODate, fmtDay, addDays } from './date';
import { useTasksInRange, useCreateTaskQuick, useUpdateTaskQuick } from './api';
import { currentOrgId } from '@/lib/workspace';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done' | 'blocked';
  priority: string;
  due_date: string;
}

export default function SchedulePage() {
  const [anchor, setAnchor] = useState<Date>(new Date());
  const week = useMemo(() => buildWeek(anchor), [anchor]);
  const { data: tasks = [], isLoading } = useTasksInRange(
    toISODate(week.start),
    toISODate(week.end)
  );
  const createTask = useCreateTaskQuick();
  const updateTask = useUpdateTaskQuick();
  const [subscribeHref, setSubscribeHref] = useState<string>('');

  React.useEffect(() => {
    // Resolve ICS link once
    (async () => {
      try {
        const org = await currentOrgId();
        setSubscribeHref(
          `/.netlify/functions/ics-tasks?org=${encodeURIComponent(org)}`
        );
      } catch {
        /* no-op */
      }
    })();
  }, []);

  const byDay = useMemo<Record<string, Task[]>>(() => {
    const map: Record<string, Task[]> = {};
    week.days.forEach(d => (map[toISODate(d)] = []));
    for (const t of tasks) {
      if (!t.due_date) continue;
      const k = t.due_date;
      if (!map[k]) map[k] = [];
      map[k].push(t);
    }
    return map;
  }, [tasks, week.days]);

  const prevWeek = () => setAnchor(addDays(week.start, -7));
  const nextWeek = () => setAnchor(addDays(week.start, 7));
  const thisWeek = () => setAnchor(new Date());

  return (
    <div className="schedule-page">
      <div className="row between center header">
        <div className="row gap">
          <button className="btn btn-ghost" onClick={prevWeek}>
            ←
          </button>
          <button className="btn" onClick={thisWeek}>
            This week
          </button>
          <button className="btn btn-ghost" onClick={nextWeek}>
            →
          </button>
        </div>
        <div className="muted">
          {week.start.toLocaleDateString()} –{' '}
          {addDays(week.end, -1).toLocaleDateString()}
        </div>
        <div className="row gap">
          {subscribeHref && (
            <a className="btn" href={subscribeHref}>
              Subscribe (ICS)
            </a>
          )}
        </div>
      </div>

      <div className="week-grid">
        {week.days.map(d => {
          const key = toISODate(d);
          const list = byDay[key] || [];
          return (
            <div className="day" key={key}>
              <div className="day-header">
                <div className="weekday">{fmtDay(d)}</div>
                <QuickAdd
                  onAdd={title => createTask.mutate({ title, due_date: key })}
                />
              </div>
              <ul className="tasks">
                {list.map(t => (
                  <li key={t.id} className={`task ${t.status}`}>
                    <span className="title">{t.title}</span>
                    <select
                      value={t.status}
                      onChange={e =>
                        updateTask.mutate({
                          id: t.id,
                          status: e.target.value as Task['status'],
                        })
                      }
                      className="status"
                    >
                      <option value="todo">todo</option>
                      <option value="doing">doing</option>
                      <option value="done">done</option>
                      <option value="blocked">blocked</option>
                    </select>
                  </li>
                ))}
                {!list.length && <li className="empty">No tasks</li>}
              </ul>
            </div>
          );
        })}
      </div>

      {isLoading && <div style={{ marginTop: 12 }}>Loading…</div>}
    </div>
  );
}

interface QuickAddProps {
  onAdd: (title: string) => void;
}

function QuickAdd({ onAdd }: QuickAddProps) {
  const [v, setV] = useState('');
  return (
    <form
      className="quick-add"
      onSubmit={e => {
        e.preventDefault();
        if (!v.trim()) return;
        onAdd(v.trim());
        setV('');
      }}
    >
      <input
        value={v}
        onChange={e => setV(e.target.value)}
        placeholder="Add task"
        aria-label="Add task"
      />
      <button className="btn btn-ghost" type="submit">
        +
      </button>
    </form>
  );
}
