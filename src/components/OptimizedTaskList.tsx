import React, { useMemo, useCallback } from 'react';
import TaskItem, { type Task } from './TaskItem';
import styles from '../app/tasks/Tasks.module.scss';

interface TaskListProps {
  tasks: Task[];
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

const OptimizedTaskList = React.memo<TaskListProps>(
  ({ tasks, onUpdate, onDelete }) => {
    // Memoized sorting with proper date handling
    const sortedTasks = useMemo(() => {
      return [...tasks].sort((a, b) => {
        // Handle null dates
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;

        // Use timestamps for better performance
        const dateA = new Date(a.due_date).getTime();
        const dateB = new Date(b.due_date).getTime();
        return dateA - dateB;
      });
    }, [tasks]);

    // Memoized callbacks to prevent child re-renders
    const handleUpdate = useCallback(
      (taskId: string, updates: Partial<Task>) => {
        onUpdate(taskId, updates);
      },
      [onUpdate]
    );

    const handleDelete = useCallback(
      (taskId: string) => {
        onDelete(taskId);
      },
      [onDelete]
    );

    // For now, just use all items to match original design
    const visibleItems = sortedTasks.map((_, index) => index);

    // Empty state
    if (sortedTasks.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-lg font-medium">No tasks yet</p>
            <p className="text-sm">Create your first task to get started</p>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.taskList} role="list">
        {visibleItems.map(index => {
          const task = sortedTasks[index];
          return (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          );
        })}

        {/* Performance indicator (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 text-xs text-gray-400">
            Optimized: {visibleItems.length}/{sortedTasks.length} items rendered
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for React.memo
    return (
      prevProps.tasks === nextProps.tasks &&
      prevProps.onUpdate === nextProps.onUpdate &&
      prevProps.onDelete === nextProps.onDelete
    );
  }
);

OptimizedTaskList.displayName = 'OptimizedTaskList';

export default OptimizedTaskList;
export type { TaskListProps };
