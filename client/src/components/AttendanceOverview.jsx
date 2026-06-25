import { useEffect, useState } from 'react';
import { fetchJson, authHeaders } from '../utils/api';

export default function AttendanceOverview({ path = '/api/student/attendance' }) {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchJson(path, { headers: { ...authHeaders() } });
        if (mounted) setRecords(data);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
    return () => (mounted = false);
  }, [path]);

  if (error) return <div>Error: {error}</div>;
  const present = records.filter(r => r.status === 'present').length;
  const pct = records.length ? Math.round((present / records.length) * 100) : 0;

  return (
    <div>
      <h3>Attendance</h3>
      <p>{pct}% present ({present}/{records.length})</p>
      <ul>
        {records.map(r => (
          <li key={r._id}>{new Date(r.date).toLocaleDateString()}: {r.status}</li>
        ))}
      </ul>
    </div>
  );
}
