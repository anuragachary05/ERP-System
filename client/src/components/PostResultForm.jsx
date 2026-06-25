import { useEffect, useState } from 'react';
import { fetchJson, authHeaders } from '../utils/api';

export default function PostResultForm() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [examType, setExamType] = useState('');
  const [score, setScore] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [remarks, setRemarks] = useState('');
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

  const handleClassChange = (classId) => {
    setSelectedClassId(classId);
    setSelectedStudentId('');
    if (!classId) {
      setStudents([]);
      return;
    }
    const cls = classes.find(c => c._id === classId);
    if (cls && cls.students) {
      setStudents(cls.students);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassId || !selectedStudentId) {
      setMessage('Please select a class and a student');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      const payload = {
        student: selectedStudentId,
        class: selectedClassId,
        examType,
        score: Number(score),
        totalMarks: Number(totalMarks),
        remarks
      };

      await fetchJson('/api/faculty/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
      });

      setMessage('Result posted successfully!');
      setExamType('');
      setScore('');
      setTotalMarks('');
      setRemarks('');
      setSelectedStudentId('');
    } catch (err) {
      setMessage(`Failed to post result: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loader">Loading classes...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="card result-form-container">
      <h3>Post Exam Results</h3>
      <form onSubmit={handleSubmit}>
        <label>Select Class</label>
        <select value={selectedClassId} onChange={(e) => handleClassChange(e.target.value)} required>
          <option value="">-- Choose Class --</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
          ))}
        </select>

        {selectedClassId && (
          <>
            <label style={{ marginTop: '12px' }}>Select Student</label>
            <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} required>
              <option value="">-- Choose Student --</option>
              {students.map(s => {
                const sObj = s.student || {};
                const sId = sObj._id || s.student;
                const roll = sObj.studentRoll || s.rollNo || '—';
                const name = sObj.name || 'Unknown';
                return (
                  <option key={sId} value={sId}>{name} (Roll: {roll})</option>
                );
              })}
            </select>
          </>
        )}

        <label style={{ marginTop: '12px' }}>Exam Type / Title</label>
        <input 
          type="text" 
          placeholder="e.g. Midterm, Quiz 1" 
          value={examType} 
          onChange={(e) => setExamType(e.target.value)} 
          required 
        />

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
          <div style={{ flex: '1', minWidth: '120px' }}>
            <label>Score</label>
            <input 
              type="number" 
              placeholder="Marks obtained" 
              value={score} 
              onChange={(e) => setScore(e.target.value)} 
              required 
            />
          </div>
          <div style={{ flex: '1', minWidth: '120px' }}>
            <label>Total Marks</label>
            <input 
              type="number" 
              placeholder="Max possible marks" 
              value={totalMarks} 
              onChange={(e) => setTotalMarks(e.target.value)} 
              required 
            />
          </div>
        </div>

        <label style={{ marginTop: '12px' }}>Remarks</label>
        <textarea 
          placeholder="e.g. Excellent performance" 
          value={remarks} 
          onChange={(e) => setRemarks(e.target.value)} 
          style={{ width: '100%', minHeight: '80px', boxSizing: 'border-box' }}
        />

        <button type="submit" disabled={submitting} style={{ marginTop: '16px' }}>
          {submitting ? 'Posting...' : 'Post Result'}
        </button>
      </form>
      {message && <p style={{ marginTop: '16px', fontWeight: '500', color: message.startsWith('Failed') ? 'var(--danger)' : 'var(--success)' }}>{message}</p>}
    </div>
  );
}
