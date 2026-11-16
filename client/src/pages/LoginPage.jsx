import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import Button from '../components/Button.jsx';
import Checkbox from '../components/Checkbox.jsx';
import { ArrowRightIcon } from '../components/Icons.jsx';
import Input from '../components/Input.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import './AuthForm.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password }) {
  const errors = {};

  if (!email.trim()) errors.email = 'Enter your email address';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address';

  if (!password) errors.password = 'Enter your password';

  return errors;
}

function focusField(name) {
  document.getElementById(`login-${name}`)?.focus();
}

function LoginPage() {
  useDocumentTitle('Log In');

  const { login } = useAuth();
  const location = useLocation();

  const [values, setValues] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, type, value, checked } = event.target;

    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const found = validate(values);
    setErrors(found);
    setFormError('');

    const firstInvalid = ['email', 'password'].find((name) => found[name]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    setSubmitting(true);

    try {
      await login({
        email: values.email.trim(),
        password: values.password,
        rememberMe: values.rememberMe,
      });
    } catch (error) {
      setSubmitting(false);

      const status = error.response?.status;
      const serverErrors = error.response?.data?.errors;

      if (status === 400 && serverErrors) {
        const fromServer = { email: serverErrors.email, password: serverErrors.password };
        setErrors(fromServer);
        focusField(fromServer.email ? 'email' : 'password');
      } else if (status === 401) {
        setFormError('Invalid email or password.');
        focusField('password');
      } else if (status === 429) {
        setFormError('Too many attempts. Please wait a moment and try again.');
      } else {
        setFormError('We couldn’t log you in right now. Please try again.');
      }
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <header className="auth-form__header">
        <p className="eyebrow">Your next great story awaits</p>
        <h1 className="auth-form__title">Log In</h1>
        <p className="auth-form__subtitle">Welcome back. Pick up where you left off.</p>
      </header>

      <div className="auth-form__fields">
        <Input
          id="login-email"
          label="Email address"
          type="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />

        <Input
          id="login-password"
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />

        <Checkbox
          label="Remember me"
          name="rememberMe"
          checked={values.rememberMe}
          onChange={handleChange}
        />
      </div>

      {formError && (
        <p className="auth-form__error" role="alert">
          {formError}
        </p>
      )}

      <Button type="submit" fullWidth className="auth-form__submit" aria-disabled={submitting}>
        {submitting ? 'Logging in…' : 'Log In'}
        <ArrowRightIcon size={18} />
      </Button>

      <p className="auth-form__switch">
        Not part of the story yet?{' '}
        <Link to="/signup" replace state={location.state} className="text-link">
          Sign Up
        </Link>
      </p>
    </form>
  );
}

export default LoginPage;