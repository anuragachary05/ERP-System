import { useEffect, useState } from 'react';
import { fetchJson, authHeaders } from '../utils/api';

export default function UsersManagement({ path = '/api/admin/users', refreshKey = 0 }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await fetchJson(path, { headers: { ...authHeaders() } });
        if (mounted) setUsers(data);
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
      <h3>Users</h3>
      <ul>
        {users.map(u => (
          <li key={u._id}>
            {u.name} ({u.email}) — {u.role}
            <button style={{ marginLeft: 8 }} onClick={async () => {
              try {
                await fetchJson(`/api/admin/users/${u._id}/restrict`, {
                  method: 'PUT',
                  headers: { ...authHeaders() },
                });
                setUsers(users.map(x => x._id === u._id ? { ...x, restricted: true } : x));
              } catch (err) {
                setError(err.message);
              }
            }}>
              {u.restricted ? 'Restricted' : 'Restrict'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
