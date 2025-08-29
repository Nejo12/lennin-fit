import { useState } from 'react';
import {
  useKpis,
  useTodayTasks,
  useTopOverdue,
  useWeekTasksSummary,
  useToggleTaskDone,
} from './api';
import { fetchFocusPlan, FocusAIResponse } from './ai';
import Button from '@/components/ui/Button';

function formatCurrency(n: number, currency = 'EUR'): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(n);
  } catch {
    return `€${n.toFixed(2)}`;
  }
}

export default function FocusPage() {
  const { data: kpis = { unpaidTotal: 0, overdueCount: 0 } } = useKpis();
  const { data: today = [] } = useTodayTasks();
  const { data: topOverdue = [] } = useTopOverdue(3);
  const { data: week = { dueThisWeek: 0, doneThisWeek: 0 } } =
    useWeekTasksSummary();
  const toggleDone = useToggleTaskDone();

  const [ai, setAi] = useState<FocusAIResponse | null>(null);
  const [thinking, setThinking] = useState(false);

  const onGenerate = async (): Promise<void> => {
    try {
      setThinking(true);
      const plan = await fetchFocusPlan({
        kpis,
        todayTasks: today.map(t => ({
          title: t.title,
          status: t.status,
          priority: t.priority,
        })),
        topOverdue: topOverdue.map(o => ({
          id: o.id,
          client_name: o.client_name,
          amount_total: o.amount_total,
          days_overdue: o.days_overdue,
        })),
      });
      setAi(plan);
    } finally {
      setThinking(false);
    }
  };

  const todayCount = today.length;
  const weekProgress = week.dueThisWeek
    ? Math.round((week.doneThisWeek / week.dueThisWeek) * 100)
    : 0;

  const copyPlanToClipboard = async (): Promise<void> => {
    if (!ai) return;

    const text = [
      ai.headline,
      '',
      ...ai.top_actions.map((a, i) => `${i + 1}. ${a.label} — ${a.why}`),
      '',
      ...(ai.followups.length
        ? ['Follow-ups:', ...ai.followups.map(f => `- ${f}`)]
        : []),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      alert('Plan copied.');
    } catch (error) {
      console.error('Failed to copy plan:', error);
    }
  };

  return (
    <div className="focus-page">
      <div className="kpis">
        <div className="kpi-card">
          <div className="kpi-label">Unpaid</div>
          <div className="kpi-value">{formatCurrency(kpis.unpaidTotal)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Overdue</div>
          <div className={`kpi-value ${kpis.overdueCount ? 'bad' : ''}`}>
            {kpis.overdueCount}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">This week</div>
          <div className="kpi-value">
            {week.doneThisWeek}/{week.dueThisWeek}{' '}
            <span className="muted">({weekProgress}%)</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Today</div>
          <div className="kpi-value">{todayCount} tasks</div>
        </div>
      </div>

      <div className="grid-2">
        <section className="card">
          <div className="row between center">
            <h3 style={{ margin: 0 }}>Today's tasks</h3>
            <a className="btn btn-ghost" href="/app/schedule">
              Open schedule →
            </a>
          </div>
          <ul className="list tasks-today">
            {today.map(t => (
              <li key={t.id} className={`task-line ${t.status}`}>
                <label className="row gap center">
                  <input
                    type="checkbox"
                    checked={t.status === 'done'}
                    onChange={e =>
                      toggleDone.mutate({ id: t.id, done: e.target.checked })
                    }
                  />
                  <span className="title">{t.title}</span>
                  <span className={`pill ${t.priority}`}>{t.priority}</span>
                </label>
              </li>
            ))}
            {!today.length && (
              <li className="muted">
                Nothing due today. Add a task in Schedule.
              </li>
            )}
          </ul>
        </section>

        <section className="card">
          <div className="row between center">
            <h3 style={{ margin: 0 }}>Top overdue</h3>
            <a className="btn btn-ghost" href="/app/invoices">
              Open invoices →
            </a>
          </div>
          <ul className="list">
            {topOverdue.map(o => (
              <li key={o.id} className="row between">
                <span className="muted">
                  #{o.id.slice(0, 6)} — {o.client_name}
                </span>
                <span>
                  {formatCurrency(o.amount_total)}{' '}
                  <span className="pill bad">{o.days_overdue}d</span>
                </span>
              </li>
            ))}
            {!topOverdue.length && <li className="muted">No overdue—nice.</li>}
          </ul>
        </section>

        <section className="card ai">
          <div className="row between center">
            <h3 style={{ margin: 0 }}>AI — Today's Focus</h3>
            <Button onClick={onGenerate} disabled={thinking} loading={thinking}>
              {thinking ? 'Thinking…' : 'Generate'}
            </Button>
          </div>

          {!ai && (
            <p className="muted">
              Get a short plan that prioritizes money-moving actions first.
            </p>
          )}

          {ai && (
            <div className="ai-plan">
              <h4>{ai.headline}</h4>
              <ol>
                {ai.top_actions.map((a, i) => (
                  <li key={i}>
                    <strong>{a.label}</strong>
                    <div className="muted">{a.why}</div>
                  </li>
                ))}
              </ol>
              {ai.followups.length ? (
                <>
                  <div className="muted">Follow-ups</div>
                  <ul className="bullets">
                    {ai.followups.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              <div className="row gap end">
                <button className="btn btn-ghost" onClick={copyPlanToClipboard}>
                  Copy plan
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="card tips">
          <h3 style={{ marginTop: 0 }}>Shortcuts</h3>
          <ul className="bullets">
            <li>
              <kbd>⌘/Ctrl + J</kbd> quick task capture
            </li>
            <li>Drag tasks in Schedule to reorder or move days</li>
            <li>Use "Copy reminder" on overdue to nudge clients</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
