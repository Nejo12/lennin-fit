import React, { useState } from 'react'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from './api'
import styles from './Tasks.module.scss'

export default function TasksPage() {
  const { data, isLoading, error } = useTasks()
  const create = useCreateTask()
  const update = useUpdateTask()
  const del = useDeleteTask()
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    create.mutate({ 
      title, 
      due_date: due || null, 
      project_id: null, 
      priority: 'medium' 
    })
    setTitle('')
    setDue('')
  }

  return (
    <div className={styles.tasks}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tasks</h1>
      </div>

      {/* Create Task Form */}
      <div className={styles.formSection}>
        <h3 className={styles.formTitle}>Add New Task</h3>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Task Title</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Enter task title" 
              className={styles.formInput}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Due Date</label>
            <input 
              value={due} 
              onChange={e => setDue(e.target.value)} 
              type="date" 
              className={styles.formInput}
            />
          </div>
          <button 
            type="submit"
            disabled={create.isPending}
            className={styles.submitButton}
          >
            {create.isPending ? 'Adding...' : 'Add Task'}
          </button>
        </form>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className={styles.loadingState}>
          <span className={styles.loadingIcon}>⏳</span>
          <div>Loading tasks...</div>
        </div>
      )}
      
      {error && (
        <div className={styles.errorState}>
          <div className={styles.errorTitle}>Error loading tasks</div>
          <div className={styles.errorMessage}>{String(error)}</div>
        </div>
      )}

      {/* Tasks List */}
      <div className={styles.tasksSection}>
        <h3 className={styles.tasksTitle}>All Tasks</h3>
        {data && data.length > 0 ? (
          <div className={styles.tasksList}>
            {data.map(task => (
              <div key={task.id} className={styles.taskItem}>
                <input 
                  defaultValue={task.title} 
                  onBlur={e => update.mutate({ id: task.id, title: e.target.value })} 
                  className={styles.taskTitle}
                />
                <select 
                  defaultValue={task.status} 
                  onChange={e => update.mutate({ id: task.id, status: e.target.value as any })} 
                  className={styles.taskStatus}
                >
                  <option value="todo">Todo</option>
                  <option value="doing">Doing</option>
                  <option value="done">Done</option>
                  <option value="blocked">Blocked</option>
                </select>
                <input 
                  type="date" 
                  defaultValue={task.due_date ?? ''} 
                  onChange={e => update.mutate({ id: task.id, due_date: e.target.value || null })} 
                  className={styles.taskDate}
                />
                <button 
                  onClick={() => del.mutate(task.id)}
                  disabled={del.isPending}
                  className={styles.deleteButton}
                >
                  {del.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📋</span>
            <div>No tasks yet. Add your first task above!</div>
          </div>
        )}
      </div>
    </div>
  )
}
