import { useState } from 'react';
import { fetchJson, authHeaders } from '../utils/api';

export default function CreateNoticeForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const payload = { title, content, audience };
      const data = await fetchJson('/api/admin/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
      });
      setMessage('Notice published successfully!');
      setTitle('');
      setContent('');
      setAudience('all');
      onCreated && onCreated(data);
    } catch (err) {
      setMessage(`Failed to publish notice: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card notice-form-container">
      <h3>Create Notice</h3>
      <form onSubmit={handleSubmit}>
        <label>Notice Title</label>
        <input
          type="text"
          placeholder="e.g. Holiday Announcement, Exam Schedule"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label style={{ marginTop: '12px' }}>Target Audience</label>
        <select value={audience} onChange={(e) => setAudience(e.target.value)} required>
          <option value="all">Everyone</option>
          <option value="students">Students Only</option>
          <option value="faculty">Faculty Only</option>
        </select>

        <label style={{ marginTop: '12px' }}>Notice Content</label>
        <textarea
          placeholder="Type the notice content details..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          style={{ width: '100%', minHeight: '100px', boxSizing: 'border-box' }}
        />

        <button type="submit" disabled={submitting} style={{ marginTop: '16px' }}>
          {submitting ? 'Publishing...' : 'Publish Notice'}
        </button>
      </form>
      {message && <p style={{ marginTop: '16px', fontWeight: '500', color: message.startsWith('Failed') ? 'var(--danger)' : 'var(--success)' }}>{message}</p>}
    </div>
  );
}
