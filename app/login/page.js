'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteNav from '../../components/SiteNav';
import ThemeAtmosphereBackdrop from '../../components/ThemeAtmosphereBackdrop';
import { useTheme } from '../../components/ThemeProvider';
import { ThemeVibeIcon } from '../../components/KbachMotifs';
import { createClient } from '../../lib/supabase/client';
import BilingualMessage from '../../components/BilingualMessage';

// Every message a contributor can hit at the door, in both languages. The
// archive itself has always been bilingual; these pages were not, which left
// the one screen a Khmer reader meets first speaking only English.
const MESSAGES = {
  emailRequired: { en: 'Email address is required.', km: 'ត្រូវការអាសយដ្ឋានអ៊ីមែល។' },
  emailInvalid: { en: 'Email address is invalid.', km: 'អាសយដ្ឋានអ៊ីមែលមិនត្រឹមត្រូវទេ។' },
  passwordRequired: { en: 'Password is required.', km: 'ត្រូវការពាក្យសម្ងាត់។' },
};

// Supabase speaks English and speaks to developers. Its error codes are stable,
// so they are translated here and the raw message goes to the console instead of
// to the contributor.
const AUTH_ERRORS = {
  invalid_credentials: { en: 'That email and password do not match an account.', km: 'អ៊ីមែល និងពាក្យសម្ងាត់នេះមិនត្រូវនឹងគណនីណាមួយទេ។' },
  email_not_confirmed: { en: 'Please confirm your email address first. Check your inbox for the link.', km: 'សូមផ្ទៀងផ្ទាត់អ៊ីមែលរបស់អ្នកជាមុន។ សូមពិនិត្យប្រអប់សំបុត្ររកតំណភ្ជាប់។' },
  over_request_rate_limit: { en: 'Too many attempts. Please wait a moment and try again.', km: 'ព្យាយាមច្រើនដងពេក។ សូមរង់ចាំមួយសន្ទុះ ហើយព្យាយាមម្តងទៀត។' },
  unknown: { en: 'Could not sign you in. Please try again.', km: 'មិនអាចចូលគណនីបានទេ។ សូមព្យាយាមម្តងទៀត។' },
};

function authErrorMessage(error) {
  console.error('Sign-in failed:', error);
  return AUTH_ERRORS[error?.code] || AUTH_ERRORS.unknown;
}

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
  if (!trimmed) return MESSAGES.emailRequired;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return MESSAGES.emailInvalid;
  return '';
}

function getPasswordError(val) {
  if (!val) return MESSAGES.passwordRequired;
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
  const [generalError, setGeneralError] = useState(null);
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
    setGeneralError(null);
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
        setGeneralError(authErrorMessage(authError));
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setGeneralError(authErrorMessage(err));
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
                <BilingualMessage
                  en="Sign in to manage cultural entries in the archive."
                  km="ចូលគណនីដើម្បីគ្រប់គ្រងធាតុវប្បធម៌ក្នុងបណ្ណាល័យ។"
                />
              </p>
            </div>

            {generalError && (
              <div className="auth-error">
                <BilingualMessage en={generalError.en} km={generalError.km} />
              </div>
            )}

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
                  <p className="auth-field-error">
                    <BilingualMessage en={fieldErrors.email.en} km={fieldErrors.email.km} />
                  </p>
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
                  <p className="auth-field-error">
                    <BilingualMessage en={fieldErrors.password.en} km={fieldErrors.password.km} />
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? 'Signing in... / កំពុងចូល...' : 'Sign In / ចូលគណនី'}
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
