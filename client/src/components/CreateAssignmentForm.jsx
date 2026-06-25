import { useEffect, useState } from 'react';
import { fetchJson, authHeaders } from '../utils/api';

export default function CreateAssignmentForm({ onCreated }) {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadClasses = async () => {
      try {
        const data = await fetchJson('/api/faculty/classes', { headers: authHeaders() });
        if (mounted) {
          setClasses(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    loadClasses();
    return () => (mounted = false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassId) {
      setMessage('Please select a class');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      const payload = {
        title,
        description,
        class: selectedClassId,
        dueDate: dueDate || undefined
      };

      const data = await fetchJson('/api/faculty/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
      });

      setMessage('Assignment created successfully!');
      setTitle('');
      setDescription('');
      setDueDate('');
      onCreated && onCreated(data);
    } catch (err) {
      setMessage(`Failed to create assignment: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loader">Loading classes...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="card assignment-form-container">
      <h3>Create New Assignment</h3>
      <form onSubmit={handleSubmit}>
        <label>Select Class</label>
        <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} required>
          <option value="">-- Choose Class --</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
          ))}
        </select>

        <label style={{ marginTop: '12px' }}>Assignment Title</label>
        <input 
          type="text" 
          placeholder="e.g. Lab Report 1, Algebra Homework" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />

        <label style={{ marginTop: '12px' }}>Description</label>
        <textarea 
          placeholder="Explain the assignment instructions..." 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          style={{ width: '100%', minHeight: '80px', boxSizing: 'border-box' }}
        />

        <label style={{ marginTop: '12px' }}>Due Date</label>
        <input 
          type="date" 
          value={dueDate} 
          onChange={(e) => setDueDate(e.target.value)} 
        />

        <button type="submit" disabled={submitting} style={{ marginTop: '16px' }}>
          {submitting ? 'Creating...' : 'Create Assignment'}
        </button>
      </form>
      {message && <p style={{ marginTop: '16px', fontWeight: '500', color: message.startsWith('Failed') ? 'var(--danger)' : 'var(--success)' }}>{message}</p>}
    </div>
  );
}
