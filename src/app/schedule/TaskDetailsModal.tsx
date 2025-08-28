import React, { useEffect, useState } from 'react';
import { useTaskDetails, useUpdateTaskQuick } from './api';

type Props = { taskId: string | null; open: boolean; onClose: () => void };

export default function TaskDetailsModal({ taskId, open, onClose }: Props) {
  const { data } = useTaskDetails(taskId) || { data: null };
  const update = useUpdateTaskQuick();

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'todo' | 'doing' | 'done' | 'blocked'>(
    'todo'
  );
  const [priority, setPriority] = useState<
    'low' | 'medium' | 'high' | 'urgent'
  >('medium');
  const [due, setDue] = useState('');
  const [desc, setDesc] = useState('');
  const [rule, setRule] = useState<'NONE' | 'WEEKLY' | 'MONTHLY'>('NONE');
  const [interval, setInterval] = useState(1);
  const [count, setCount] = useState<number | ''>('');
  const [until, setUntil] = useState('');

  useEffect(() => {
    if (!open || !data) return;
    setTitle(data.title || '');
    setStatus((data.status || 'todo') as 'todo' | 'doing' | 'done' | 'blocked');
    setPriority(
      (data.priority || 'medium') as 'low' | 'medium' | 'high' | 'urgent'
    );
    setDue(data.due_date || '');
    setDesc(data.description || '');
    setRule((data.recur_rule as 'WEEKLY' | 'MONTHLY') || 'NONE');
    setInterval(data.recur_interval || 1);
    setCount(data.recur_count ?? '');
    setUntil(data.recur_until || '');
  }, [open, data]);

  if (!open || !taskId) return null;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await update.mutateAsync({
      id: taskId,
      title,
      status,
      priority,
      due_date: due || undefined,
      description: desc,
      recur_rule: rule === 'NONE' ? null : (rule as 'WEEKLY' | 'MONTHLY'),
      recur_interval: rule === 'NONE' ? null : Number(interval),
      recur_count: rule === 'NONE' ? null : count === '' ? null : Number(count),
      recur_until: rule === 'NONE' ? null : until || null,
    });
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Task details"
    >
      <div className="modal" style={{ width: 'min(640px, 96vw)' }}>
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>Task details</h3>
          <button
            className="btn btn-ghost"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <form className="modal-body" onSubmit={onSave}>
          <label>
            Title
            <input value={title} onChange={e => setTitle(e.target.value)} />
          </label>

          <div className="row gap">
            <label>
              Status
              <select
                value={status}
                onChange={e =>
                  setStatus(
                    e.target.value as 'todo' | 'doing' | 'done' | 'blocked'
                  )
                }
              >
                <option value="todo">todo</option>
                <option value="doing">doing</option>
                <option value="done">done</option>
                <option value="blocked">blocked</option>
              </select>
            </label>
            <label>
              Priority
              <select
                value={priority}
                onChange={e =>
                  setPriority(
                    e.target.value as 'low' | 'medium' | 'high' | 'urgent'
                  )
                }
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="urgent">urgent</option>
              </select>
            </label>
            <label>
              Due date
              <input
                type="date"
                value={due || ''}
                onChange={e => setDue(e.target.value)}
              />
            </label>
          </div>

          <label>
            Notes
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={4}
            />
          </label>

          <fieldset className="recurrence">
            <legend>Recurrence</legend>
            <div className="row gap">
              <label>
                Repeat
                <select
                  value={rule}
                  onChange={e =>
                    setRule(e.target.value as 'NONE' | 'WEEKLY' | 'MONTHLY')
                  }
                >
                  <option value="NONE">None</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </label>
              {rule !== 'NONE' && (
                <>
                  <label>
                    Every
                    <input
                      type="number"
                      min={1}
                      value={interval}
                      onChange={e => setInterval(Number(e.target.value) || 1)}
                    />{' '}
                    {rule === 'WEEKLY' ? 'week(s)' : 'month(s)'}
                  </label>
                  <label>
                    Times
                    <input
                      type="number"
                      min={1}
                      value={count}
                      onChange={e =>
                        setCount(
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                    />
                  </label>
                  <span className="muted">or</span>
                  <label>
                    Until
                    <input
                      type="date"
                      value={until || ''}
                      onChange={e => setUntil(e.target.value)}
                    />
                  </label>
                </>
              )}
            </div>
          </fieldset>

          <div className="row gap end">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
