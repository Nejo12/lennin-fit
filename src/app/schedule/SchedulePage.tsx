import { useMemo, useState } from 'react';
import { buildWeek, toISODate, fmtDay, addDays } from './date';
import {
  useTasksInRange,
  useCreateTaskQuick,
  useUpdateTaskQuick,
  useReorderDay,
  useMoveTaskAcrossDays,
} from './api';
import ScheduleFilters, { Filters } from './ScheduleFilters';
import TaskDetailsModal from './TaskDetailsModal';

import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Status badge component with better visual design
function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'todo':
        return {
          label: 'To Do',
          color: 'var(--status-todo)',
          bg: 'var(--status-todo-bg)',
        };
      case 'doing':
        return {
          label: 'In Progress',
          color: 'var(--status-doing)',
          bg: 'var(--status-doing-bg)',
        };
      case 'done':
        return {
          label: 'Done',
          color: 'var(--status-done)',
          bg: 'var(--status-done-bg)',
        };
      case 'blocked':
        return {
          label: 'Blocked',
          color: 'var(--status-blocked)',
          bg: 'var(--status-blocked-bg)',
        };
      default:
        return { label: status, color: 'var(--muted)', bg: 'var(--elev)' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className="status-badge"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      {config.label}
    </span>
  );
}

// Priority indicator
function PriorityIndicator({ priority }: { priority: string }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#eab308';
      case 'low':
        return '#22c55e';
      default:
        return 'var(--muted)';
    }
  };

  return (
    <div
      className="priority-dot"
      style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: getPriorityColor(priority),
        flexShrink: 0,
      }}
    />
  );
}

// Improved sortable row with better visual design
function SortRow({
  t,
  onOpen,
  onQuickActions,
}: {
  t: {
    id: string;
    title: string;
    status: string;
    priority: string;
    due_date: string;
  };
  onOpen: (id: string) => void;
  onQuickActions: (id: string, action: 'today' | 'tomorrow' | 'toggle') => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: t.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const overdue =
    t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done';

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`task-item ${t.status} ${overdue ? 'overdue' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="task-content">
        <div className="task-header">
          <PriorityIndicator priority={t.priority} />
          <button
            className="task-title"
            onClick={() => onOpen(t.id)}
            title="Open details"
          >
            {t.title}
          </button>
          <div className="task-actions">
            <button
              className="action-btn"
              onClick={e => {
                e.stopPropagation();
                onQuickActions(t.id, 'toggle');
              }}
              title="Toggle completion"
            >
              {t.status === 'done' ? '✓' : '○'}
            </button>
          </div>
        </div>

        <div className="task-footer">
          <StatusBadge status={t.status} />
          <div className="quick-actions">
            <button
              className="quick-btn"
              onClick={e => {
                e.stopPropagation();
                onQuickActions(t.id, 'today');
              }}
              title="Move to today"
            >
              Today
            </button>
            <button
              className="quick-btn"
              onClick={e => {
                e.stopPropagation();
                onQuickActions(t.id, 'tomorrow');
              }}
              title="Move to tomorrow"
            >
              Tomorrow
            </button>
          </div>
        </div>
      </div>
    </li>
  );
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
  const reorderDay = useReorderDay();
  const moveAcross = useMoveTaskAcrossDays();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const todayISO = new Date().toISOString().slice(0, 10);
  const tomorrowISO = new Date(Date.now() + 86400000)
    .toISOString()
    .slice(0, 10);

  // Filters state
  const [filters, setFilters] = useState<Filters>({
    q: '',
    status: new Set(['todo', 'doing', 'done', 'blocked']),
    priority: new Set(['low', 'medium', 'high', 'urgent']),
  });

  // Group by day + sort by position (already sorted by query)
  const byDayRaw = useMemo<
    Record<
      string,
      Array<{
        id: string;
        title: string;
        status: string;
        priority: string;
        due_date: string;
      }>
    >
  >(() => {
    const map: Record<
      string,
      Array<{
        id: string;
        title: string;
        status: string;
        priority: string;
        due_date: string;
      }>
    > = {};
    week.days.forEach(d => (map[toISODate(d)] = []));
    for (const t of tasks) {
      if (!t.due_date) continue;
      map[t.due_date]?.push(t);
    }
    return map;
  }, [tasks, week.days]);

  // Apply filters + search
  const byDay = useMemo(() => {
    const m: Record<
      string,
      Array<{
        id: string;
        title: string;
        status: string;
        priority: string;
        due_date: string;
      }>
    > = {};
    for (const [day, list] of Object.entries(byDayRaw)) {
      m[day] = list.filter(
        t =>
          filters.status.has(
            t.status as 'todo' | 'doing' | 'done' | 'blocked'
          ) &&
          filters.priority.has(
            t.priority as 'low' | 'medium' | 'high' | 'urgent'
          ) &&
          (!filters.q ||
            t.title.toLowerCase().includes(filters.q.toLowerCase()))
      );
    }
    return m;
  }, [byDayRaw, filters]);

  // DnD helpers
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);

  const onDragOver = (e: DragOverEvent) => {
    if (!e.over) return;
    const overId = e.over.id as string;
    // If hovered over a task, infer its day by lookup
    const dayHit = Object.entries(byDay).find(([, arr]) =>
      arr.some(t => t.id === overId)
    );
    if (dayHit) setDragOverDay(dayHit[0]);
  };

  const onDragEnd = (e: DragEndEvent) => {
    const activeId = e.active.id as string;
    if (!activeId) return;

    // Determine source/target days
    let fromDay: string | undefined;
    for (const [day, list] of Object.entries(byDay)) {
      if (list.some(t => t.id === activeId)) fromDay = day;
    }
    if (!fromDay) return;

    // If user dragged onto a task, we inferred dragOverDay previously
    const toDay = dragOverDay || fromDay;

    // If same day, reorder within day using DOM order
    if (toDay === fromDay) {
      const ids = (byDay[fromDay] || []).map(t => t.id);
      reorderDay.mutate({ due_date: fromDay, orderedIds: ids });
      return;
    }

    // Cross-day move: build new orders
    const fromIds = (byDay[fromDay] || [])
      .map(t => t.id)
      .filter(id => id !== activeId);
    const toIds = [...(byDay[toDay] || []).map(t => t.id), activeId];

    moveAcross.mutate({
      taskId: activeId,
      fromDate: fromDay,
      toDate: toDay!,
      fromOrderedIds: fromIds,
      toOrderedIds: toIds,
    });

    setDragOverDay(null);
  };

  const prevWeek = () => setAnchor(addDays(week.start, -7));
  const nextWeek = () => setAnchor(addDays(week.start, 7));
  const thisWeek = () => setAnchor(new Date());

  const handleQuickActions = (
    id: string,
    action: 'today' | 'tomorrow' | 'toggle'
  ) => {
    if (action === 'toggle') {
      const task = tasks.find(t => t.id === id);
      if (task) {
        updateTask.mutate({
          id,
          status: task.status === 'done' ? 'todo' : 'done',
        });
      }
    } else if (action === 'today') {
      updateTask.mutate({ id, due_date: todayISO });
    } else if (action === 'tomorrow') {
      updateTask.mutate({ id, due_date: tomorrowISO });
    }
  };

  const formatDateRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const endStr = addDays(end, -1).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <div className="header-navigation">
          <button className="nav-btn" onClick={prevWeek}>
            ← Previous
          </button>
          <button className="current-week-btn" onClick={thisWeek}>
            This Week
          </button>
          <button className="nav-btn" onClick={nextWeek}>
            Next →
          </button>
        </div>

        <div className="date-range">
          {formatDateRange(week.start, week.end)}
        </div>

        <div className="view-options">
          <a className="view-btn active" href="/app/schedule">
            Week
          </a>
          <a className="view-btn" href="/app/schedule/month">
            Month
          </a>
          <a className="view-btn" href="/app/schedule/agenda">
            Agenda
          </a>
        </div>
      </div>

      <ScheduleFilters value={filters} onChange={setFilters} />

      <DndContext
        collisionDetection={closestCenter}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="week-grid">
          {week.days.map(d => {
            const key = toISODate(d);
            const list = byDay[key] || [];
            const isToday = key === todayISO;
            const isPast = new Date(key) < new Date();

            return (
              <div
                className={`day-column ${dragOverDay === key ? 'dropping' : ''} ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}`}
                key={key}
                data-day={key}
              >
                <div className="day-header">
                  <div className="day-info">
                    <div className="weekday">{fmtDay(d)}</div>
                    <div className="date-number">{d.getDate()}</div>
                  </div>
                  <QuickAdd
                    onAdd={title => createTask.mutate({ title, due_date: key })}
                  />
                </div>

                <SortableContext
                  items={list.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="tasks-list">
                    {list.map(t => (
                      <SortRow
                        key={t.id}
                        t={t}
                        onOpen={id => setSelectedTaskId(id)}
                        onQuickActions={handleQuickActions}
                      />
                    ))}
                    {!list.length && (
                      <li className="empty-state">
                        <div className="empty-icon">📝</div>
                        <div className="empty-text">No tasks</div>
                      </li>
                    )}
                  </ul>
                </SortableContext>
              </div>
            );
          })}
        </div>
      </DndContext>

      {isLoading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <div>Loading tasks...</div>
        </div>
      )}

      <TaskDetailsModal
        taskId={selectedTaskId}
        open={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
}

function QuickAdd({ onAdd }: { onAdd: (title: string) => void }) {
  const [v, setV] = useState('');
  return (
    <form
      className="quick-add-form"
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
        placeholder="+ Add task"
        aria-label="Add task"
        className="quick-add-input"
      />
    </form>
  );
}
