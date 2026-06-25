import { useEffect, useState } from 'react';
import { fetchJson, authHeaders } from '../utils/api';

export default function CreateScheduleForm({ onCreated }) {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchJson('/api/admin/classes', { headers: { ...authHeaders() } });
        if (mounted) setClasses(data);
      } catch (err) {
        setMessage(err.message);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!classId) throw new Error('Select class');
      const data = await fetchJson(`/api/admin/classes/${classId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ day, startTime, endTime, subject }),
      });
      setMessage('Schedule added');
      onCreated && onCreated(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h3>Add Class Schedule</h3>
      <form onSubmit={handleSubmit}>
        <select value={classId} onChange={(e) => setClassId(e.target.value)} required>
          <option value="">Select class</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
          ))}
        </select>
        <select value={day} onChange={(e) => setDay(e.target.value)}>
          <option>Monday</option>
          <option>Tuesday</option>
          <option>Wednesday</option>
          <option>Thursday</option>
          <option>Friday</option>
          <option>Saturday</option>
          <option>Sunday</option>
        </select>
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        <input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <button type="submit">Add</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
