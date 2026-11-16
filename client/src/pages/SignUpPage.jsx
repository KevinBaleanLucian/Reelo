import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import Button from '../components/Button.jsx';
import DateInput from '../components/DateInput.jsx';
import FavoriteTitlePicker from '../components/FavoriteTitlePicker.jsx';
import GenrePicker from '../components/GenrePicker.jsx';
import { ArrowRightIcon } from '../components/Icons.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { toIsoDate, validateBirthDate } from '../utils/birthDate.js';
import { countryOptions } from '../utils/countries.js';
import './AuthForm.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-z0-9._]+$/;
const FIELD_ERRORS = [
  'firstName',
  'lastName',
  'username',
  'email',
  'password',
  'dateOfBirth',
  'favoriteTitle',
];

const initialValues = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  dateOfBirth: '',
  country: '',
  genreIds: [],
  favoriteTitle: null,
};

function validate(values) {
  const errors = {};
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const username = values.username.trim().toLowerCase();
  const email = values.email.trim();
  const { password } = values;

  if (!firstName) errors.firstName = 'First name is required';
  else if (firstName.length > 50) errors.firstName = 'First name is too long';

  if (!lastName) errors.lastName = 'Last name is required';
  else if (lastName.length > 50) errors.lastName = 'Last name is too long';

  if (!username) errors.username = 'Choose a username';
  else if (username.length < 3) errors.username = 'Username must have at least 3 characters';
  else if (username.length > 30) errors.username = 'Username must have at most 30 characters';
  else if (!USERNAME_PATTERN.test(username)) {
    errors.username = 'Username can only contain letters, numbers, dots and underscores';
  }

  if (!email) errors.email = 'Enter your email address';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address';

  if (!password) errors.password = 'Create a password';
  else if (password.length < 8) errors.password = 'Use at least 8 characters';
  else if (password.length > 72) errors.password = 'Password is too long';
  else if (!/[0-9]/.test(password)) errors.password = 'Include at least one number';
  else if (!/[^A-Za-z0-9]/.test(password)) errors.password = 'Include at least one symbol';

  const birthError = validateBirthDate(values.dateOfBirth);
  if (birthError) errors.dateOfBirth = birthError;

  return errors;
}

function buildPayload(values) {
  const payload = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    username: values.username.trim().toLowerCase(),
    email: values.email.trim(),
    password: values.password,
    genreIds: values.genreIds,
  };

  const dateOfBirth = toIsoDate(values.dateOfBirth);
  if (dateOfBirth) payload.dateOfBirth = dateOfBirth;

  if (values.country) payload.country = values.country;

  if (values.favoriteTitle) {
    payload.favoriteTitle = {
      tmdbId: values.favoriteTitle.tmdbId,
      mediaType: values.favoriteTitle.mediaType,
    };
  }

  return payload;
}

function SignUpPage() {
  useDocumentTitle('Sign Up');

  const { register } = useAuth();
  const location = useLocation();
  const formRef = useRef(null);

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [focusTick, setFocusTick] = useState(0);

  useEffect(() => {
    if (focusTick === 0) return;
    formRef.current?.querySelector('[aria-invalid="true"], [data-invalid="true"]')?.focus();
  }, [focusTick]);

  function setField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setFormError('');
  }

  function handleInput(event) {
    setField(event.target.name, event.target.value);
  }

  function handleFailure(error) {
    if (error.accountCreated) {
      setFormError(
        'Your account was created, but we couldn’t log you in. Please use Log In below with your new details.'
      );
      return;
    }

    const status = error.response?.status;
    const serverErrors = error.response?.data?.errors;

    if ((status === 400 || status === 409) && serverErrors) {
      const fields = {};
      const others = [];

      for (const [key, message] of Object.entries(serverErrors)) {
        const field = key.split('.')[0];

        if (FIELD_ERRORS.includes(field)) fields[field] ??= message;
        else others.push(message);
      }

      setErrors(fields);
      if (others.length > 0) setFormError(others[0]);
      setFocusTick((tick) => tick + 1);
    } else if (status === 409) {
      setFormError('An account with these details already exists.');
    } else if (status === 429) {
      setFormError('Too many attempts. Please wait a moment and try again.');
    } else if (status === 502 && values.favoriteTitle) {
      setErrors({ favoriteTitle: 'We couldn’t check this title right now. Remove it or try again.' });
      setFocusTick((tick) => tick + 1);
    } else {
      setFormError('We couldn’t create your account right now. Please try again.');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const found = validate(values);
    setErrors(found);
    setFormError('');

    if (Object.keys(found).length > 0) {
      setFocusTick((tick) => tick + 1);
      return;
    }

    setSubmitting(true);

    try {
      await register(buildPayload(values));
    } catch (error) {
      setSubmitting(false);
      handleFailure(error);
    }
  }

  return (
    <form className="auth-form auth-form--wide" ref={formRef} onSubmit={handleSubmit} noValidate>
      <header className="auth-form__header">
        <p className="eyebrow">For the love of cinema</p>
        <h1 className="auth-form__title">Sign Up</h1>
        <p className="auth-form__subtitle">A little about you. A world of stories to discover.</p>
      </header>

      <div className="auth-form__fields">
        <div className="auth-form__row">
          <Input
            label="First name"
            name="firstName"
            placeholder="Your first name"
            autoComplete="given-name"
            value={values.firstName}
            onChange={handleInput}
            error={errors.firstName}
          />
          <Input
            label="Last name"
            name="lastName"
            placeholder="Your last name"
            autoComplete="family-name"
            value={values.lastName}
            onChange={handleInput}
            error={errors.lastName}
          />
        </div>

        <Input
          label="Username"
          name="username"
          placeholder="yourname"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          hint="Letters, numbers, dots and underscores. This is how other people find you."
          value={values.username}
          onChange={handleInput}
          error={errors.username}
        />

        <Input
          label="Email address"
          type="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={values.email}
          onChange={handleInput}
          error={errors.email}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Create a password"
          autoComplete="new-password"
          hint="Use at least 8 characters, including a number and a symbol."
          value={values.password}
          onChange={handleInput}
          error={errors.password}
        />

        <div className="auth-form__row">
          <DateInput
            label="Date of birth"
            name="dateOfBirth"
            value={values.dateOfBirth}
            onChange={(value) => setField('dateOfBirth', value)}
            error={errors.dateOfBirth}
          />
          <Select
            label="Country"
            placeholder="Select your country"
            options={countryOptions}
            value={values.country}
            onChange={(value) => setField('country', value)}
          />
        </div>

        <GenrePicker value={values.genreIds} onChange={(ids) => setField('genreIds', ids)} />

        <FavoriteTitlePicker
          value={values.favoriteTitle}
          onChange={(title) => setField('favoriteTitle', title)}
          error={errors.favoriteTitle}
        />
      </div>

      <p className="auth-form__legal">
        By creating an account, you agree to our{' '}
        <a href="/terms" target="_blank" rel="noopener noreferrer">
          Terms of use
        </a>{' '}
        and{' '}
        <a href="/privacy" target="_blank" rel="noopener noreferrer">
          Privacy policy
        </a>
        .
      </p>

      {formError && (
        <p className="auth-form__error" role="alert">
          {formError}
        </p>
      )}

      <Button type="submit" fullWidth className="auth-form__submit" aria-disabled={submitting}>
        {submitting ? 'Creating account…' : 'Create account'}
        <ArrowRightIcon size={18} />
      </Button>

      <p className="auth-form__switch">
        Already have an account?{' '}
        <Link to="/login" replace state={location.state} className="text-link">
          Log In
        </Link>
      </p>
    </form>
  );
}

export default SignUpPage;