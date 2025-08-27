import React, { useCallback, useState } from 'react';
import styles from '../app/tasks/Tasks.module.scss';
import ConfirmationModal from './ConfirmationModal';

interface Task {
  id: string;
  title: string;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'doing' | 'done';
  project_id?: string | null;
}

interface TaskItemProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

const TaskItem = React.memo<TaskItemProps>(({ task, onUpdate, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(task.id, { title: e.target.value });
    },
    [task.id, onUpdate]
  );

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onUpdate(task.id, { status: e.target.value as Task['status'] });
    },
    [task.id, onUpdate]
  );

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(task.id, { due_date: e.target.value || null });
    },
    [task.id, onUpdate]
  );

  const handleDeleteClick = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    onDelete(task.id);
  }, [task.id, onDelete]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  return (
    <>
      <div
        className={styles.taskItem}
        role="listitem"
        aria-label={`Task: ${task.title}`}
      >
        <input
          defaultValue={task.title}
          onBlur={handleTitleChange}
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
          onChange={handleStatusChange}
          className={styles.taskSelect}
          aria-label={`Status for ${task.title}`}
        >
          <option value="todo">Todo</option>
          <option value="doing">Doing</option>
          <option value="done">Done</option>
        </select>
        <input
          type="date"
          defaultValue={task.due_date ?? ''}
          onChange={handleDateChange}
          className={styles.taskDate}
          aria-label={`Due date for ${task.title}`}
        />
        <button
          onClick={handleDeleteClick}
          className={styles.deleteButton}
          aria-label={`Delete ${task.title}`}
          title="Delete task"
        >
          Delete
        </button>
      </div>

      <ConfirmationModal
        open={showDeleteModal}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"?\nThis action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
});

TaskItem.displayName = 'TaskItem';

export default TaskItem;
export type { Task, TaskItemProps };
