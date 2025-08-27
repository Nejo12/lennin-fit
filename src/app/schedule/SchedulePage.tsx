import { useState } from 'react'
import styles from './Schedule.module.scss'

interface Event {
  id: string
  title: string
  date: string
  time: string
  type: 'meeting' | 'task' | 'appointment'
  client?: string
  description?: string
}

export default function SchedulePage() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Client Meeting - TechStart',
      date: '2024-02-15',
      time: '10:00',
      type: 'meeting',
      client: 'TechStart Inc',
      description: 'Discuss mobile app requirements'
    },
    {
      id: '2',
      title: 'Website Review',
      date: '2024-02-15',
      time: '14:00',
      type: 'task',
      description: 'Review and update client website'
    },
    {
      id: '3',
      title: 'Design Consultation',
      date: '2024-02-16',
      time: '11:00',
      type: 'appointment',
      client: 'Design Studio',
      description: 'Initial design consultation'
    }
  ])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    type: 'meeting' as Event['type'],
    client: '',
    description: ''
  })

  const getCurrentMonth = () => {
    const now = new Date()
    return {
      year: now.getFullYear(),
      month: now.getMonth()
    }
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date)
  }

  const handleCreateEvent = () => {
    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time,
      type: newEvent.type,
      client: newEvent.client || undefined,
      description: newEvent.description || undefined
    }
    setEvents([...events, event])
    setNewEvent({ title: '', date: '', time: '', type: 'meeting', client: '', description: '' })
    setShowCreateForm(false)
  }

  const getEventClass = (type: Event['type']) => {
    switch (type) {
      case 'meeting': return styles.eventMeeting
      case 'task': return styles.eventTask
      case 'appointment': return styles.eventAppointment
      default: return styles.eventMeeting
    }
  }

  const { year, month } = getCurrentMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const renderCalendar = () => {
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={styles.calendarDay}></div>)
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayEvents = getEventsForDate(date)
      
      days.push(
        <div key={day} className={styles.calendarDay}>
          <div className={styles.calendarDayNumber}>{day}</div>
          <div className={styles.calendarEvents}>
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`${styles.calendarEvent} ${getEventClass(event.type)}`}
                title={`${event.time} - ${event.title}`}
              >
                {event.time} {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className={styles.moreEvents}>
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      )
    }
    
    return days
  }

  return (
    <div className={styles.schedule}>
      <div className={styles.header}>
        <h1 className={styles.title}>Schedule</h1>
      </div>

      {/* Create Event Form */}
      {showCreateForm && (
        <div className={styles.formSection}>
          <h3 className={styles.formTitle}>Add New Event</h3>
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Event Title</label>
              <input
                type="text"
                placeholder="Enter event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Event Type</label>
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({...newEvent, type: e.target.value as Event['type']})}
                className={styles.formSelect}
              >
                <option value="meeting">Meeting</option>
                <option value="task">Task</option>
                <option value="appointment">Appointment</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Date</label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Time</label>
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Client (Optional)</label>
              <input
                type="text"
                placeholder="Enter client name"
                value={newEvent.client}
                onChange={(e) => setNewEvent({...newEvent, client: e.target.value})}
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description (Optional)</label>
              <textarea
                placeholder="Enter event description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                className={styles.formTextarea}
                rows={3}
              />
            </div>
          </div>
          <div className={styles.formActions}>
            <button
              onClick={handleCreateEvent}
              className={styles.submitButton}
            >
              Add Event
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className={styles.calendarSection}>
        <h3 className={styles.calendarHeader}>{monthNames[month]} {year}</h3>
        <div className={styles.calendarGrid}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className={styles.calendarDayHeader}>
              {day}
            </div>
          ))}
          {renderCalendar()}
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legendSection}>
        <h3 className={styles.legendTitle}>Legend</h3>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.legendMeeting}`}></div>
            <span className={styles.legendText}>Meetings</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.legendTask}`}></div>
            <span className={styles.legendText}>Tasks</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.legendAppointment}`}></div>
            <span className={styles.legendText}>Appointments</span>
          </div>
        </div>
      </div>
    </div>
  )
}
