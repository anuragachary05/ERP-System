import { useEffect, useState } from 'react';
import { fetchJson, authHeaders } from '../utils/api';

export default function ClassesSchedule({ path = '/api/admin/classes', refreshKey = 0 }) {
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchJson(path, { headers: { ...authHeaders() } });
        if (mounted) setClasses(data);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [path, refreshKey]);

  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>Classes / Schedule</h3>
      {classes.length === 0 ? (
        <p>No classes</p>
      ) : (
        <ul>
          {Array.isArray(classes) && classes.length > 0 && classes[0] && classes[0].nextOccurrence ? (
            // flattened schedule entries (student/faculty endpoints)
            classes.map((e, idx) => (
              <li key={idx}>
                <strong>{e.className} ({e.code})</strong>
                <div>Faculty: {e.faculty?.name || e.faculty?.facultyId || 'TBD'}</div>
                <div>
                  {e.day}: {e.startTime} - {e.endTime} ({e.subject})
                  <div>Next: {new Date(e.nextOccurrence).toLocaleString()}</div>
                </div>
              </li>
            ))
          ) : (
            // admin/class list format
            classes.map((c) => (
              <li key={c._id}>
                <strong>{c.name} ({c.code})</strong>
                <div>Faculty: {c.faculty?.name || 'TBD'}</div>
                <div>
                  Schedule:
                  <ul>
                    {(c.schedule || []).map((s, idx) => (
                      <li key={idx}>{s.day}: {s.startTime} - {s.endTime} ({s.subject})</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
