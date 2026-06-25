import { useEffect, useState } from 'react';
import { fetchJson, authHeaders } from '../utils/api';

export default function MarkAttendanceForm() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceState, setAttendanceState] = useState({}); // studentId -> status
  const [notesState, setNotesState] = useState({}); // studentId -> notes
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
    if (!classId) {
      setStudents([]);
      return;
    }
    const cls = classes.find(c => c._id === classId);
    if (cls && cls.students) {
      setStudents(cls.students);
      const initialAttendance = {};
      const initialNotes = {};
      cls.students.forEach(s => {
        const sId = s.student?._id || s.student;
        if (sId) {
          initialAttendance[sId] = 'present';
          initialNotes[sId] = '';
        }
      });
      setAttendanceState(initialAttendance);
      setNotesState(initialNotes);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
  };

  const handleNotesChange = (studentId, notes) => {
    setNotesState(prev => ({ ...prev, [studentId]: notes }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassId) {
      setMessage('Please select a class');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      const promises = students.map(s => {
        const studentId = s.student?._id || s.student;
        const payload = {
          student: studentId,
          class: selectedClassId,
          date,
          status: attendanceState[studentId],
          notes: notesState[studentId] || undefined
        };
        return fetchJson('/api/faculty/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify(payload)
        });
      });

      await Promise.all(promises);
      setMessage('Attendance successfully recorded for all students!');
    } catch (err) {
      setMessage(`Failed to record attendance: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loader">Loading classes...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="card attendance-form-container">
      <h3>Roll Call Attendance</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label>Select Class</label>
            <select value={selectedClassId} onChange={(e) => handleClassChange(e.target.value)} required>
              <option value="">-- Choose Class --</option>
              {classes.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
        </div>

        {selectedClassId && students.length === 0 && (
          <p className="no-data">No students enrolled in this class.</p>
        )}

        {selectedClassId && students.length > 0 && (
          <div>
            <table>
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const studentObj = s.student || {};
                  const studentId = studentObj._id || s.student;
                  const roll = studentObj.studentRoll || s.rollNo || '—';
                  const name = studentObj.name || 'Unknown';

                  return (
                    <tr key={studentId}>
                      <td><strong>{roll}</strong></td>
                      <td>{name}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name={`status-${studentId}`}
                              value="present"
                              checked={attendanceState[studentId] === 'present'}
                              onChange={() => handleStatusChange(studentId, 'present')}
                            />
                            Present
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name={`status-${studentId}`}
                              value="absent"
                              checked={attendanceState[studentId] === 'absent'}
                              onChange={() => handleStatusChange(studentId, 'absent')}
                            />
                            Absent
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name={`status-${studentId}`}
                              value="late"
                              checked={attendanceState[studentId] === 'late'}
                              onChange={() => handleStatusChange(studentId, 'late')}
                            />
                            Late
                          </label>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="e.g. late arrival"
                          value={notesState[studentId] || ''}
                          onChange={(e) => handleNotesChange(studentId, e.target.value)}
                          style={{ padding: '6px 12px', fontSize: '0.9rem' }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </div>
        )}
      </form>
      {message && <p style={{ marginTop: '16px', fontWeight: '500', color: message.startsWith('Failed') ? 'var(--danger)' : 'var(--success)' }}>{message}</p>}
    </div>
  );
}
