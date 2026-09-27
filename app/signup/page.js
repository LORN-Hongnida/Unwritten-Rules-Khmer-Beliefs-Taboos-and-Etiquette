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
  if (val.length < 8 || !/(?=.*[A-Za-z])(?=.*\d)/.test(val)) {
    return 'Password must be at least 8 characters long and contain both letters and numbers';
  }
  return '';
}

function getConfirmPasswordError(confirmVal, passVal) {
  if (!confirmVal) return 'Please confirm your password';
  if (confirmVal !== passVal) return 'Passwords do not match';
  return '';
}

function validateSignup(emailVal, passVal, confirmPassVal) {
  const errors = {};
  const emailErr = getEmailError(emailVal);
  if (emailErr) errors.email = emailErr;

  const passErr = getPasswordError(passVal);
  if (passErr) errors.password = passErr;

  const confirmErr = getConfirmPasswordError(confirmPassVal, passVal);
  if (confirmErr) errors.confirmPassword = confirmErr;

  return errors;
}

export default function SignupPage() {
  const { selectedTheme, setSelectedTheme, isDark, toggleMode } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (confirmPassword) {
      const confirmErr = getConfirmPasswordError(confirmPassword, newVal);
      setFieldErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
    }
  };

  const handleConfirmPasswordChange = (newVal) => {
    setConfirmPassword(newVal);
    if (!hasSubmitted) return;

    if (!newVal) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
    } else {
      const err = getConfirmPasswordError(newVal, password);
      setFieldErrors((prev) => ({ ...prev, confirmPassword: err }));
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
    } else if (field === 'confirmPassword') {
      if (!confirmPassword) {
        setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
      } else {
        const err = getConfirmPasswordError(confirmPassword, password);
        setFieldErrors((prev) => ({ ...prev, confirmPassword: err }));
      }
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setHasSubmitted(true);

    const errors = validateSignup(email, password, confirmPassword);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
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
                <ThemeVibeIcon motif="beliefs" size={22} />
              </div>
              <h1 className="auth-title">បង្កើតគណនី</h1>
              <div className="auth-title-sub">Contributor Registration</div>
              <p className="auth-description">
                Create an account to contribute and preserve Khmer cultural knowledge.
              </p>
            </div>

            {generalError && <div className="auth-error">{generalError}</div>}

            <form className="auth-form" onSubmit={handleSignup} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="signup-email">
                  <span>
                    Email <span className="auth-required">*</span>
                  </span>
                  <span className="auth-label-km">អ៊ីមែល</span>
                </label>
                <input
                  id="signup-email"
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
                <label className="auth-label" htmlFor="signup-password">
                  <span>
                    Password <span className="auth-required">*</span>
                  </span>
                  <span className="auth-label-km">ពាក្យសម្ងាត់</span>
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`auth-input ${fieldErrors.password ? 'has-error' : ''}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onBlur={() => handleBlur('password')}
                    autoComplete="new-password"
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

              <div className="auth-field">
                <label className="auth-label" htmlFor="signup-confirm-password">
                  <span>
                    Confirm Password <span className="auth-required">*</span>
                  </span>
                  <span className="auth-label-km">ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់</span>
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`auth-input ${fieldErrors.confirmPassword ? 'has-error' : ''}`}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowConfirmPassword((show) => !show)}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="auth-field-error">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign Up / បង្កើតគណនី'}
              </button>
            </form>

            <div className="auth-footer">
              Already have a contributor account?
              <Link href="/login" className="auth-link">
                Sign in
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
