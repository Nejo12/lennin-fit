import React, { useState, useCallback, useMemo } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from './api';
import styles from './Tasks.module.scss';

// Debounce hook for performance optimization
function useDebounce<T extends (...args: never[]) => void>(
  callback: T,
  delay: number
): T {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: never[]) => {
      if (timeoutId) clearTimeout(timeoutId);
      const newTimeoutId = setTimeout(() => callback(...args), delay);
      setTimeoutId(newTimeoutId);
    }) as T,
    [callback, delay, timeoutId]
  );
}

export default function TasksPage() {
  const { data, isLoading, error, refetch } = useTasks();
  const create = useCreateTask();
  const update = useUpdateTask();
  const del = useDeleteTask();
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [optimisticTasks, setOptimisticTasks] =
    useState<typeof data>(undefined);

  // Optimistic updates for better UX
  const optimisticData = useMemo(() => {
    return optimisticTasks || data;
  }, [optimisticTasks, data]);

  // Debounced title update for performance
  const debouncedTitleUpdate = useDebounce(
    (taskId: string, newTitle: string) => {
      if (newTitle.trim() !== '') {
        update.mutate({ id: taskId, title: newTitle.trim() });
      }
    },
    500
  );

  // Debounced date update for performance
  const debouncedDateUpdate = useDebounce((taskId: string, dueDate: string) => {
    update.mutate({ id: taskId, due_date: dueDate || null });
  }, 300);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: `temp-${Date.now()}`,
      title: title.trim(),
      status: 'todo' as const,
      due_date: due || null,
      priority: 'medium' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      org_id: 'temp',
      project_id: null,
      position: 0,
    };

    // Optimistic update
    setOptimisticTasks(prev => [...(prev || []), newTask]);

    create.mutate(
      {
        title: title.trim(),
        due_date: due || null,
        project_id: null,
        priority: 'medium',
      },
      {
        onSuccess: () => {
          setTitle('');
          setDue('');
          setOptimisticTasks(undefined); // Clear optimistic data
        },
        onError: () => {
          // Revert optimistic update on error
          setOptimisticTasks(
            prev => prev?.filter(task => task.id !== newTask.id) || undefined
          );
        },
      }
    );
  };

  const handleDelete = useCallback(
    (taskId: string) => {
      if (window.confirm('Are you sure you want to delete this task?')) {
        // Optimistic update
        setOptimisticTasks(
          prev => prev?.filter(task => task.id !== taskId) || undefined
        );

        del.mutate(taskId, {
          onError: () => {
            // Revert optimistic update on error
            refetch();
          },
        });
      }
    },
    [del, refetch]
  );

  const handleTitleUpdate = useCallback(
    (taskId: string, newTitle: string) => {
      debouncedTitleUpdate(taskId, newTitle);
    },
    [debouncedTitleUpdate]
  );

  const handleStatusUpdate = useCallback(
    (taskId: string, status: 'todo' | 'doing' | 'done' | 'blocked') => {
      // Optimistic update for immediate feedback
      setOptimisticTasks(
        prev =>
          prev?.map(task =>
            task.id === taskId ? { ...task, status } : task
          ) || undefined
      );

      update.mutate(
        { id: taskId, status },
        {
          onError: () => {
            // Revert optimistic update on error
            refetch();
          },
        }
      );
    },
    [update, refetch]
  );

  const handleDateUpdate = useCallback(
    (taskId: string, dueDate: string) => {
      debouncedDateUpdate(taskId, dueDate);
    },
    [debouncedDateUpdate]
  );

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Keyboard navigation support
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, action: () => void) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        action();
      }
    },
    []
  );

  if (isLoading && !optimisticData) {
    return (
      <div className={styles.tasks}>
        <div className={styles.header}>
          <h1 className={styles.title}>Tasks</h1>
          <p className={styles.subtitle}>
            Manage your tasks and track progress
          </p>
        </div>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tasks}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tasks</h1>
        <p className={styles.subtitle}>Manage your tasks and track progress</p>
      </div>

      {/* Create Task Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Task title"
            className={styles.taskInput}
            required
            aria-label="Task title"
            aria-describedby="title-help"
            maxLength={200}
          />
          <input
            value={due}
            onChange={e => setDue(e.target.value)}
            type="date"
            className={styles.taskDate}
            aria-label="Due date"
          />
          <button
            type="submit"
            disabled={create.isPending || !title.trim()}
            className={styles.submitButton}
            aria-label="Add task"
            aria-describedby={create.isPending ? 'creating-status' : undefined}
          >
            {create.isPending ? 'Adding...' : 'Add Task'}
          </button>
        </div>
        <div id="title-help" className={styles.helpText}>
          Enter a task title (max 200 characters)
        </div>
        {create.isPending && (
          <div id="creating-status" className={styles.statusText}>
            Creating task...
          </div>
        )}
      </form>

      {/* Error State with Retry */}
      {error && (
        <div className={styles.errorState} role="alert">
          <p>Error loading tasks: {String(error)}</p>
          <button
            onClick={handleRetry}
            className={styles.retryButton}
            aria-label="Retry loading tasks"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Tasks List */}
      <div className={styles.taskList} role="list">
        {optimisticData && optimisticData.length > 0 ? (
          optimisticData.map(task => (
            <div
              key={task.id}
              className={styles.taskItem}
              role="listitem"
              aria-label={`Task: ${task.title}`}
            >
              <input
                defaultValue={task.title}
                onBlur={e => handleTitleUpdate(task.id, e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                className={styles.taskInput}
                aria-label={`Task title for ${task.title}`}
                maxLength={200}
              />
              <select
                defaultValue={task.status}
                onChange={e =>
                  handleStatusUpdate(
                    task.id,
                    e.target.value as 'todo' | 'doing' | 'done' | 'blocked'
                  )
                }
                className={styles.taskSelect}
                aria-label={`Status for ${task.title}`}
              >
                <option value="todo">Todo</option>
                <option value="doing">Doing</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </select>
              <input
                type="date"
                defaultValue={task.due_date ?? ''}
                onChange={e => handleDateUpdate(task.id, e.target.value)}
                className={styles.taskDate}
                aria-label={`Due date for ${task.title}`}
              />
              <button
                onClick={() => handleDelete(task.id)}
                onKeyDown={e => handleKeyDown(e, () => handleDelete(task.id))}
                disabled={del.isPending}
                className={styles.deleteButton}
                aria-label={`Delete ${task.title}`}
                title="Delete task"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <div className={styles.emptyState} role="status">
            <p>No tasks yet. Create your first task above!</p>
          </div>
        )}
      </div>

      {/* Loading indicator for background updates */}
      {(update.isPending || del.isPending) && (
        <div className={styles.backgroundLoading} aria-live="polite">
          <div className={styles.spinner}></div>
          <span>Updating...</span>
        </div>
      )}
    </div>
  );
}
