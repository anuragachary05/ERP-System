import { useState } from 'react';
import { fetchJson, authHeaders } from '../utils/api';

export default function CreateUserForm({ onCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [studentRoll, setStudentRoll] = useState('');
  const [className, setClassName] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [department, setDepartment] = useState('');
  const [dob, setDob] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        email,
        password,
        role,
        studentRoll: role === 'student' ? studentRoll : undefined,
        className: role === 'student' ? className : undefined,
        facultyId: role === 'faculty' ? facultyId : undefined,
        department: role === 'faculty' ? department : undefined,
        dob: dob || undefined,
        mobile: role === 'faculty' ? mobile : undefined,
      };

      const data = await fetchJson('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      });
      setMessage('User created');
      setName('');
      setEmail('');
      setPassword('');
      setRole('student');
      setStudentRoll('');
      setClassName('');
      setFacultyId('');
      setDepartment('');
      setDob('');
      setMobile('');
      onCreated && onCreated(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h3>Create User</h3>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admin</option>
        </select>

        {role === 'student' && (
          <>
            <input placeholder="Roll Number" value={studentRoll} onChange={(e) => setStudentRoll(e.target.value)} required />
            <input placeholder="Class" value={className} onChange={(e) => setClassName(e.target.value)} required />
            <label>
              DOB
              <input value={dob} onChange={(e) => setDob(e.target.value)} type="date" />
            </label>
          </>
        )}

        {role === 'faculty' && (
          <>
            <input placeholder="Faculty ID" value={facultyId} onChange={(e) => setFacultyId(e.target.value)} required />
            <input placeholder="Dept" value={department} onChange={(e) => setDepartment(e.target.value)} required />
            <input placeholder="Mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
            <label>
              DOB
              <input value={dob} onChange={(e) => setDob(e.target.value)} type="date" />
            </label>
          </>
        )}

        <button type="submit">Create</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
