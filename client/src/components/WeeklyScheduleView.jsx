import { useEffect, useState } from 'react';
import { fetchJson, authHeaders } from '../utils/api';
import '../styles/WeeklySchedule.css';

export default function WeeklyScheduleView({ path = '/api/student/schedule' }) {
  const [scheduleEntries, setScheduleEntries] = useState([]);
  const [error, setError] = useState('');
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d;
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchJson(path, { headers: { ...authHeaders() } });
        if (mounted) setScheduleEntries(data || []);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
    return () => (mounted = false);
  }, [path, weekStart]);

  if (error) return <div className="schedule-error">Error: {error}</div>;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = Array.from({ length: 10 }, (_, i) => `${9 + i}:00`);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const getItemsForSlot = (dayIdx, hour) => {
    return scheduleEntries.filter((entry) => {
      const entryDate = new Date(entry.nextOccurrence);
      const entryDay = entryDate.getDay();
      const entryHour = parseInt(entry.startTime.split(':')[0], 10);
      return entryDay === dayIdx && entryHour === hour;
    });
  };

  const goToPreviousWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const goToNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  return (
    <div className="weekly-schedule-container">
      <h3>Weekly Schedule</h3>
      <div className="schedule-navigation">
        <button onClick={goToPreviousWeek}>← Previous Week</button>
        <span className="week-label">
          {weekStart.toLocaleDateString()} - {new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}
        </span>
        <button onClick={goToNextWeek}>Next Week →</button>
      </div>

      <div className="schedule-table-wrapper">
        <table className="schedule-table">
          <thead>
            <tr>
              <th className="time-header">Time</th>
              {weekDates.map((date, i) => (
                <th key={i} className="day-header">
                  <div className="day-name">{days[date.getDay()]}</div>
                  <div className="day-date">{date.toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time, hourIdx) => (
              <tr key={time}>
                <td className="time-cell">{time}</td>
                {weekDates.map((date, dayIdx) => {
                  const items = getItemsForSlot(date.getDay(), 9 + hourIdx);
                  return (
                    <td key={`${dayIdx}-${hourIdx}`} className="schedule-cell">
                      {items.length > 0 && (
                        <div className="schedule-items">
                          {items.map((item, idx) => (
                            <div key={idx} className="schedule-item">
                              <div className="item-class">{item.className}</div>
                              <div className="item-code">{item.code}</div>
                              <div className="item-time">
                                {item.startTime} - {item.endTime}
                              </div>
                              {item.subject && <div className="item-subject">{item.subject}</div>}
                              {item.faculty && (
                                <div className="item-faculty">
                                  {item.faculty.name || item.faculty.facultyId}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {scheduleEntries.length === 0 && (
        <div className="no-schedule">No classes scheduled for this week</div>
      )}
    </div>
  );
}
