import { useState, useEffect } from 'react';

function EnrollStudentForm({ onEnrollSuccess }) {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const allUsers = await res.json();
        const studentList = allUsers.filter((u) => u.role === 'student');
        setStudents(studentList);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const classList = await res.json();
        setClasses(classList);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();

    if (!selectedStudent || !selectedClass) {
      setMessage('Please select both student and class');
      setMessageType('error');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/admin/classes/${selectedClass}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ studentId: selectedStudent }),
      });

      if (res.ok) {
        setMessage('Student enrolled successfully');
        setMessageType('success');
        setSelectedStudent('');
        setSelectedClass('');
        if (onEnrollSuccess) onEnrollSuccess();
      } else {
        const error = await res.json();
        setMessage(error.message || 'Failed to enroll student');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error enrolling student: ' + error.message);
      setMessageType('error');
    }
  };

  return (
    <div>
      <h3>Enroll Student in Class</h3>
      <form onSubmit={handleEnroll}>
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">Select Student</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.studentRoll})
            </option>
          ))}
        </select>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Select Class</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} ({c.code})
            </option>
          ))}
        </select>

        <button type="submit">Enroll</button>
      </form>

      {message && (
        <p style={{ color: messageType === 'success' ? 'green' : 'red' }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default EnrollStudentForm;
