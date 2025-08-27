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
        <p className={styles.subtitle}>Manage your tasks and track progress</p>
      </div>

      {/* Create Task Form */}
      <div className={styles.form}>
        <div className={styles.formRow}>
          <input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Task title" 
            className={styles.taskInput}
            required
          />
          <input 
            value={due} 
            onChange={e => setDue(e.target.value)} 
            type="date" 
            className={styles.taskDate}
          />
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={create.isPending}
            className={styles.submitButton}
          >
            {create.isPending ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </div>

      {/* Loading and Error States */}
      {isLoading && <div>Loading tasks...</div>}
      
      {error && <div>Error loading tasks: {String(error)}</div>}

      {/* Tasks List */}
      <div className={styles.taskList}>
        {data && data.length > 0 ? (
          data.map(task => (
            <div key={task.id} className={styles.taskItem}>
              <input 
                defaultValue={task.title} 
                onBlur={e => update.mutate({ id: task.id, title: e.target.value })} 
                className={styles.taskInput}
              />
              <select 
                defaultValue={task.status} 
                onChange={e => update.mutate({ id: task.id, status: e.target.value as any })} 
                className={styles.taskSelect}
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
                Delete
              </button>
            </div>
          ))
        ) : (
          <div>No tasks yet. Create your first task above!</div>
        )}
      </div>
    </div>
  )
}
