import { useState } from 'react';
import styles from './Schedule.module.scss';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'task' | 'appointment';
  client?: string;
  description?: string;
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
      description: 'Discuss mobile app requirements',
    },
    {
      id: '2',
      title: 'Website Review',
      date: '2024-02-15',
      time: '14:00',
      type: 'task',
      description: 'Review and update client website',
    },
    {
      id: '3',
      title: 'Design Consultation',
      date: '2024-02-16',
      time: '11:00',
      type: 'appointment',
      client: 'Design Studio',
      description: 'Initial design consultation',
    },
  ]);

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    type: 'meeting' as Event['type'],
    client: '',
    description: '',
  });

  const getCurrentMonth = () => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
    };
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  const handleCreateEvent = () => {
    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time,
      type: newEvent.type,
      client: newEvent.client || undefined,
      description: newEvent.description || undefined,
    };
    setEvents([...events, event]);
    setNewEvent({
      title: '',
      date: '',
      time: '',
      type: 'meeting',
      client: '',
      description: '',
    });
  };

  const getEventClass = (type: Event['type']) => {
    switch (type) {
      case 'meeting':
        return styles.eventMeeting;
      case 'task':
        return styles.eventTask;
      case 'appointment':
        return styles.eventReminder;
      default:
        return styles.eventMeeting;
    }
  };

  const { year, month } = getCurrentMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const renderCalendar = () => {
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={styles.calendarDay}></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = getEventsForDate(date);

      days.push(
        <div key={day} className={styles.calendarDay}>
          <div className={styles.dayNumber}>{day}</div>
          <div className={styles.dayEvents}>
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`${styles.event} ${getEventClass(event.type)}`}
                title={`${event.time} - ${event.title}`}
              >
                {event.time} {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className={styles.event}>+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className={styles.schedule}>
      <div className={styles.header}>
        <h1 className={styles.title}>Schedule</h1>
        <p className={styles.subtitle}>Manage your calendar and appointments</p>
      </div>

      {/* Create Event Form */}
      <div className={styles.form}>
        <div className={styles.formTitle}>Add New Event</div>
        <div className={styles.formGrid}>
          <input
            type="text"
            placeholder="Event title"
            value={newEvent.title}
            onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
            className={styles.formInput}
          />
          <select
            value={newEvent.type}
            onChange={e =>
              setNewEvent({
                ...newEvent,
                type: e.target.value as Event['type'],
              })
            }
            className={styles.formSelect}
          >
            <option value="meeting">Meeting</option>
            <option value="task">Task</option>
            <option value="appointment">Appointment</option>
          </select>
          <input
            type="date"
            value={newEvent.date}
            onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
            className={styles.formInput}
          />
          <button onClick={handleCreateEvent} className={styles.submitButton}>
            Add Event
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className={styles.calendar}>
        <div className={styles.calendarHeader}>
          <div className={styles.calendarTitle}>
            {monthNames[month]} {year}
          </div>
        </div>
        <div className={styles.calendarGrid}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className={styles.dayHeader}>
              {day}
            </div>
          ))}
          {renderCalendar()}
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendTitle}>Legend</div>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <div
              className={`${styles.legendColor} ${styles.legendColorMeeting}`}
            ></div>
            <span className={styles.legendLabel}>Meetings</span>
          </div>
          <div className={styles.legendItem}>
            <div
              className={`${styles.legendColor} ${styles.legendColorTask}`}
            ></div>
            <span className={styles.legendLabel}>Tasks</span>
          </div>
          <div className={styles.legendItem}>
            <div
              className={`${styles.legendColor} ${styles.legendColorReminder}`}
            ></div>
            <span className={styles.legendLabel}>Appointments</span>
          </div>
        </div>
      </div>
    </div>
  );
}
