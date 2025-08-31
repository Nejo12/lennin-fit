import React, { useState, useCallback, useMemo } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from './api';
import OptimizedTaskList from '../../components/OptimizedTaskList';
import { type Task } from '../../components/TaskItem';
import styles from './Tasks.module.scss';

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
        onError: error => {
          // Revert optimistic update on error
          setOptimisticTasks(
            prev => prev?.filter(task => task.id !== newTask.id) || undefined
          );

          // Log the error for debugging
          console.error('Task creation failed:', error);
        },
      }
    );
  };

  const handleDelete = useCallback(
    (taskId: string) => {
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
    },
    [del, refetch]
  );

  const handleTaskUpdate = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      // Optimistic update for immediate feedback
      setOptimisticTasks(
        prev =>
          prev?.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
          ) || undefined
      );

      update.mutate(
        { id: taskId, ...updates },
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

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Helper function to get user-friendly error message
  const getErrorMessage = (error: unknown) => {
    if (!error) return 'An unknown error occurred';

    const errorMessage = String(error);

    if (errorMessage.includes('row-level security policy')) {
      return 'Access denied. Please try signing out and signing back in.';
    }

    if (errorMessage.includes('foreign key violation')) {
      return 'Workspace configuration error. Please try refreshing the page.';
    }

    if (errorMessage.includes('No workspace')) {
      return 'No workspace configured. Please try refreshing the page.';
    }

    if (errorMessage.includes('User not authenticated')) {
      return 'Please sign in to create tasks.';
    }

    return errorMessage;
  };

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

        {/* Task Creation Error */}
        {create.error && (
          <div className={styles.errorState} role="alert">
            <p>Failed to create task: {getErrorMessage(create.error)}</p>
            <button
              onClick={() => create.reset()}
              className={styles.retryButton}
              aria-label="Clear error and try again"
            >
              Try Again
            </button>
          </div>
        )}
      </form>

      {/* Error State with Retry */}
      {error && (
        <div className={styles.errorState} role="alert">
          <p>Error loading tasks: {getErrorMessage(error)}</p>
          <button
            onClick={handleRetry}
            className={styles.retryButton}
            aria-label="Retry loading tasks"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Optimized Tasks List */}
      {optimisticData && (
        <OptimizedTaskList
          tasks={optimisticData.map(task => ({
            ...task,
            due_date: task.due_date || null,
            priority:
              (task.priority === 'urgent' ? 'high' : task.priority) || 'medium',
            status:
              (task.status === 'blocked' ? 'todo' : task.status) || 'todo',
          }))}
          onUpdate={handleTaskUpdate}
          onDelete={handleDelete}
        />
      )}

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
