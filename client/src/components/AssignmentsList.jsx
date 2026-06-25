import { useEffect, useState } from 'react';
import { fetchJson, authHeaders } from '../utils/api';

export default function AssignmentsList({ path = '/api/faculty/assignments' }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchJson(path, { headers: { ...authHeaders() } });
        if (mounted) setItems(data);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
    return () => (mounted = false);
  }, [path]);

  if (error) return <div>Error: {error}</div>;
  return (
    <div>
      <h3>Assignments</h3>
      {items.length === 0 ? (
        <p>No assignments</p>
      ) : (
        <ul>
          {items.map(a => (
            <li key={a._id}>{a.title} — due {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A'}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
