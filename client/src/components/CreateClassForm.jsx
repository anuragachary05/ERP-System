import { useState } from 'react';
import { fetchJson, authHeaders } from '../utils/api';

export default function CreateClassForm({ onCreated }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await fetchJson('/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ name, code, faculty: facultyId }),
      });
      setMessage('Class created');
      setName('');
      setCode('');
      setFacultyId('');
      onCreated && onCreated(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h3>Create Class</h3>
      <form onSubmit={handleSubmit}>
        <input placeholder="Class name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} required />
        <input placeholder="Faculty user id / facultyId / email" value={facultyId} onChange={(e) => setFacultyId(e.target.value)} />
        <button type="submit">Create Class</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
