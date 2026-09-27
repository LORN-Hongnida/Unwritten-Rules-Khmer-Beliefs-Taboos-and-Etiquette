'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteNav from '../../components/SiteNav';
import ThemeAtmosphereBackdrop from '../../components/ThemeAtmosphereBackdrop';
import { useTheme } from '../../components/ThemeProvider';
import { ThemeVibeIcon } from '../../components/KbachMotifs';
import { createClient } from '../../lib/supabase/client';

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function getEmailError(val) {
  const trimmed = val.trim();
  if (!trimmed) return 'Email address is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Email address is invalid.';
  return '';
}

function getPasswordError(val) {
  if (!val) return 'Password is required';
  return '';
}

function validateLogin(emailVal, passVal) {
  const errors = {};
  const emailErr = getEmailError(emailVal);
  if (emailErr) errors.email = emailErr;

  const passErr = getPasswordError(passVal);
  if (passErr) errors.password = passErr;

  return errors;
}

export default function LoginPage() {
  const { selectedTheme, setSelectedTheme, isDark, toggleMode } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (newVal) => {
    setEmail(newVal);
    if (!hasSubmitted) return;

    const trimmed = newVal.trim();
    if (!trimmed) {
      setFieldErrors((prev) => ({ ...prev, email: '' }));
    } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFieldErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (newVal) => {
    setPassword(newVal);
    if (!hasSubmitted) return;

    if (!newVal) {
      setFieldErrors((prev) => ({ ...prev, password: '' }));
    } else {
      const err = getPasswordError(newVal);
      setFieldErrors((prev) => ({ ...prev, password: err }));
    }
  };

  const handleBlur = (field) => {
    if (!hasSubmitted) return;

    if (field === 'email') {
      const trimmed = email.trim();
      if (!trimmed) {
        setFieldErrors((prev) => ({ ...prev, email: '' }));
      } else {
        const err = getEmailError(email);
        setFieldErrors((prev) => ({ ...prev, email: err }));
      }
    } else if (field === 'password') {
      if (!password) {
        setFieldErrors((prev) => ({ ...prev, password: '' }));
      } else {
        const err = getPasswordError(password);
        setFieldErrors((prev) => ({ ...prev, password: err }));
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setHasSubmitted(true);

    const errors = validateLogin(email, password);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setGeneralError('Invalid email or password');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setGeneralError('Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div>
      <ThemeAtmosphereBackdrop selectedTheme={selectedTheme} />

      <div className="page-content">
        <SiteNav
          selectedTheme={selectedTheme}
          onSelectTheme={setSelectedTheme}
          isDark={isDark}
          onToggleMode={toggleMode}
        />

        <main className="auth-page">
          <div className="auth-panel">
            <div className="auth-header">
              <div className="auth-motif" aria-hidden="true">
                <ThemeVibeIcon motif="etiquette" size={22} />
              </div>
              <h1 className="auth-title">ចូលគណនី</h1>
              <div className="auth-title-sub">Contributor Login</div>
              <p className="auth-description">
                Sign in to manage cultural entries in the archive.
              </p>
            </div>

            {generalError && <div className="auth-error">{generalError}</div>}

            <form className="auth-form" onSubmit={handleLogin} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="email-input">
                  <span>
                    Email <span className="auth-required">*</span>
                  </span>
                  <span className="auth-label-km">អ៊ីមែល</span>
                </label>
                <input
                  id="email-input"
                  type="email"
                  className={`auth-input ${fieldErrors.email ? 'has-error' : ''}`}
                  placeholder="contributor@example.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  autoComplete="email"
                />
                {fieldErrors.email && (
                  <p className="auth-field-error">{fieldErrors.email}</p>
                )}
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="password-input">
                  <span>
                    Password <span className="auth-required">*</span>
                  </span>
                  <span className="auth-label-km">ពាក្យសម្ងាត់</span>
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    className={`auth-input ${fieldErrors.password ? 'has-error' : ''}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onBlur={() => handleBlur('password')}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((show) => !show)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="auth-field-error">{fieldErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In / ចូលគណនី'}
              </button>
            </form>

            <div className="auth-footer">
              Don&apos;t have a contributor account?
              <Link href="/signup" className="auth-link">
                Sign up
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
