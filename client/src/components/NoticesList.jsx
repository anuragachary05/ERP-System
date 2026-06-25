import { useEffect, useState } from 'react';
import { fetchJson, authHeaders } from '../utils/api';

export default function NoticesList({ path = '/api/admin/notices', refreshKey = 0 }) {
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchJson(path, { headers: { ...authHeaders() } });
        if (mounted) setNotices(data);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
    return () => (mounted = false);
  }, [path, refreshKey]);

  if (error) return <div>Error: {error}</div>;
  return (
    <div>
      <h3>Notices</h3>
      {notices.length === 0 ? (
        <p>No notices</p>
      ) : (
        <ul>
          {notices.map((n) => (
            <li key={n._id}>
              <strong>{n.title}</strong> — {n.content}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
