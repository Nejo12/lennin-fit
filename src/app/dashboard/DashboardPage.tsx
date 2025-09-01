import { useUnpaidTotal, useThisWeekTasks } from './api';
import { useQuickActions } from '@/app/common/actions';
import styles from './Dashboard.module.scss';

export default function DashboardPage() {
  const { data: unpaidTotal, isLoading: unpaidLoading } = useUnpaidTotal();
  const { data: thisWeekTasks, isLoading: tasksLoading } = useThisWeekTasks();
  const { newInvoice, newTask, scheduleMeeting, addLead } = useQuickActions();

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'done':
        return styles.statusDone;
      case 'doing':
        return styles.statusDoing;
      case 'blocked':
        return styles.statusBlocked;
      default:
        return styles.statusTodo;
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>
          Your TILSF overview - Tasks, Invoices, Leads, Schedule, Focus
        </p>
      </div>

      {/* Key Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Unpaid Invoices</div>
          <div className={styles.metricValue}>
            {unpaidLoading ? '...' : `€${(unpaidTotal || 0).toLocaleString()}`}
          </div>
          <div className={styles.metricSubtext}>pending</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>This Week's Tasks</div>
          <div className={styles.metricValue}>
            {tasksLoading ? '...' : thisWeekTasks?.length || 0}
          </div>
          <div className={styles.metricSubtext}>due soon</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Active Leads</div>
          <div className={styles.metricValue}>-</div>
          <div className={styles.metricSubtext}>in pipeline</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Today's Events</div>
          <div className={styles.metricValue}>-</div>
          <div className={styles.metricSubtext}>scheduled</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Unpaid Invoices */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💰</span>
            <span className={styles.sectionIcon}>🌱</span>
            Unpaid Invoices
          </div>

          {unpaidLoading ? (
            <div className={styles.loadingState}>
              <span className={styles.loadingIcon}>⏳</span>
              <div>Loading invoices...</div>
            </div>
          ) : unpaidTotal && unpaidTotal > 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>💸</span>
              <div className={styles.metricValue}>
                €{unpaidTotal.toLocaleString()}
              </div>
              <div>Total unpaid</div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🎉</span>
              <div>All invoices paid!</div>
            </div>
          )}
        </div>

        {/* This Week's Tasks */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📋</span>
            <span className={styles.sectionIcon}>✨</span>
            <span className={styles.sectionIcon}>✨</span>
            This Week's Tasks
          </div>

          {tasksLoading ? (
            <div className={styles.loadingState}>
              <span className={styles.loadingIcon}>⏳</span>
              <div>Loading tasks...</div>
            </div>
          ) : thisWeekTasks && thisWeekTasks.length > 0 ? (
            <div>
              {thisWeekTasks.map(task => (
                <div key={task.id} className={styles.taskItem}>
                  <div className={styles.taskInfo}>
                    <div className={styles.taskTitle}>{task.title}</div>
                    <div className={styles.taskDate}>Due: {task.due_date}</div>
                  </div>
                  <div
                    className={`${styles.taskStatus} ${getStatusClass(task.status)}`}
                  >
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>✨</span>
              <div>No tasks due this week!</div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h3 className={styles.quickActionsTitle}>Quick Actions</h3>
        <div className={styles.actionsGrid}>
          <button className={styles.actionButton} onClick={() => newInvoice()}>
            Create Invoice
          </button>
          <button className={styles.actionButton} onClick={() => newTask()}>
            Add Task
          </button>
          <button className={styles.actionButton} onClick={scheduleMeeting}>
            Schedule Meeting
          </button>
          <button className={styles.actionButton} onClick={addLead}>
            Add Lead
          </button>
        </div>
      </div>
    </div>
  );
}
