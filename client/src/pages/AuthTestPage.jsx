import { useState } from 'react';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import { useAuth } from '../hooks/useAuth.js';

function readStorage(kind) {
  try {
    return window[kind].getItem('reelo_token') ? 'token present' : 'empty';
  } catch {
    return 'unavailable';
  }
}

function AuthTestPage() {
  const { status, user, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState('');

  async function handleLogin() {
    setMessage('');
    try {
      await login({ email, password, rememberMe: remember });
      setMessage('Logged in');
    } catch (error) {
      const code = error.response?.status ?? 'network';
      setMessage(`${code}: ${error.response?.data?.message ?? error.message}`);
    }
  }

  return (
    <div
      className="container"
      style={{ paddingBlock: 'var(--space-7)', display: 'grid', gap: 'var(--space-4)', maxWidth: 420 }}
    >
      <h1>Auth test</h1>

      <p>
        Status: <strong>{status}</strong>
      </p>
      <p>User: {user ? `${user.email} (${user.country ?? 'no country'}, ${user.genres.length} genres)` : '-'}</p>
      <p>
        localStorage: {readStorage('localStorage')} · sessionStorage: {readStorage('sessionStorage')}
      </p>
      {message && <p>{message}</p>}

      <Input label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <label>
        <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />{' '}
        Remember me
      </label>

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <Button onClick={handleLogin}>Log in</Button>
        <Button variant="secondary" onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  );
}

export default AuthTestPage;