import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchJson } from '../utils/api';

function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirm) {
      setMessage('Passwords must match');
      return;
    }
    try {
      const data = await fetchJson('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="page">
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit}>
        <label>New Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        <label>Confirm Password</label>
        <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" required />
        <button type="submit">Reset Password</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default ResetPasswordPage;
