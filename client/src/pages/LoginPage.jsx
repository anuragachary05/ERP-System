import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJson } from '../utils/api';
import { setCurrentUser } from '../utils/auth';

function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await fetchJson('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      setCurrentUser(data.user, data.token);
      if (data.user.role === 'admin') navigate('/admin');
      if (data.user.role === 'faculty') navigate('/faculty');
      if (data.user.role === 'student') navigate('/student');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="page">
      <h1>ERP Login</h1>
      <form onSubmit={handleSubmit}>
        <label>Email / Roll No / Faculty ID</label>
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          type="text"
          placeholder="Email / Roll No / Faculty ID"
          required
        />
        <label>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
      <p>
        Forgot password? <a href="/forgot-password">Reset here</a>
      </p>
    </div>
  );
}

export default LoginPage;
