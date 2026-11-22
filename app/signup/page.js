'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteNav from '../../components/SiteNav';
import ThemeAtmosphereBackdrop from '../../components/ThemeAtmosphereBackdrop';
import { useTheme } from '../../components/ThemeProvider';
import { useLanguage } from '../../components/LanguageProvider';
import { ThemeVibeIcon } from '../../components/KbachMotifs';
import { createClient } from '../../lib/supabase/client';
import BilingualMessage from '../../components/BilingualMessage';

// The door into the archive, in both languages. Until now this page spoke only
// English, so the first screen a Khmer reader met was the one screen that
// couldn't speak to them.
const MESSAGES = {
  displayNameRequired: { en: 'Display name is required.', km: 'ត្រូវការឈ្មោះបង្ហាញ។' },
  displayNameLength: { en: 'Display name must be 2 to 50 characters.', km: 'ឈ្មោះបង្ហាញត្រូវមានពី ២ ដល់ ៥០ តួអក្សរ។' },
  emailRequired: { en: 'Email address is required.', km: 'ត្រូវការអាសយដ្ឋានអ៊ីមែល។' },
  emailInvalid: { en: 'Email address is invalid.', km: 'អាសយដ្ឋានអ៊ីមែលមិនត្រឹមត្រូវទេ។' },
  passwordRequired: { en: 'Password is required.', km: 'ត្រូវការពាក្យសម្ងាត់។' },
  // Length only. The old rule also demanded a Latin letter and a digit, which
  // no Khmer keyboard can satisfy: it locked out the very people this archive
  // is about. Length is the part that actually resists guessing.
  passwordShort: { en: 'Password must be at least 8 characters long.', km: 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ តួអក្សរ។' },
  confirmRequired: { en: 'Please confirm your password.', km: 'សូមផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់របស់អ្នក។' },
  confirmMismatch: { en: 'Passwords do not match.', km: 'ពាក្យសម្ងាត់មិនដូចគ្នាទេ។' },
  checkInbox: {
    en: 'Account created. Please check your inbox for a confirmation link, then sign in.',
    km: 'បានបង្កើតគណនី។ សូមពិនិត្យប្រអប់សំបុត្ររបស់អ្នករកតំណភ្ជាប់ផ្ទៀងផ្ទាត់ បន្ទាប់មកចូលគណនី។',
  },
};

// Supabase speaks English and speaks to developers. Its codes are stable, so
// they are translated here; the raw message goes to the console, not to a
// contributor.
const AUTH_ERRORS = {
  user_already_exists: { en: 'An account with this email already exists. Try signing in instead.', km: 'មានគណនីជាមួយអ៊ីមែលនេះរួចហើយ។ សូមព្យាយាមចូលគណនីជំនួសវិញ។' },
  email_exists: { en: 'An account with this email already exists. Try signing in instead.', km: 'មានគណនីជាមួយអ៊ីមែលនេះរួចហើយ។ សូមព្យាយាមចូលគណនីជំនួសវិញ។' },
  weak_password: { en: 'That password is too easy to guess. Please choose a longer one.', km: 'ពាក្យសម្ងាត់នេះងាយស្រួលទាយពេក។ សូមជ្រើសរើសមួយវែងជាងនេះ។' },
  validation_failed: { en: 'Please check the email address and try again.', km: 'សូមពិនិត្យអាសយដ្ឋានអ៊ីមែល ហើយព្យាយាមម្តងទៀត។' },
  over_request_rate_limit: { en: 'Too many attempts. Please wait a moment and try again.', km: 'ព្យាយាមច្រើនដងពេក។ សូមរង់ចាំមួយសន្ទុះ ហើយព្យាយាមម្តងទៀត។' },
  unknown: { en: 'Could not create your account. Please try again.', km: 'មិនអាចបង្កើតគណនីរបស់អ្នកបានទេ។ សូមព្យាយាមម្តងទៀត។' },
};

function authErrorMessage(error) {
  console.error('Sign-up failed:', error);
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

// Counted in code points for the same reason as the password: a Khmer name
// must not be refused for being "too long" when it is not.
function getDisplayNameError(val) {
  const trimmed = val.trim();
  if (!trimmed) return MESSAGES.displayNameRequired;
  const length = [...trimmed].length;
  if (length < 2 || length > 50) return MESSAGES.displayNameLength;
  return '';
}

function getEmailError(val) {
  const trimmed = val.trim();
  if (!trimmed) return MESSAGES.emailRequired;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return MESSAGES.emailInvalid;
  return '';
}

// Counted in code points, not UTF-16 units: a Khmer syllable is often several
// units long, and val.length would quietly inflate it.
function getPasswordError(val) {
  if (!val) return MESSAGES.passwordRequired;
  if ([...val].length < 8) return MESSAGES.passwordShort;
  return '';
}

function getConfirmPasswordError(confirmVal, passVal) {
  if (!confirmVal) return MESSAGES.confirmRequired;
  if (confirmVal !== passVal) return MESSAGES.confirmMismatch;
  return '';
}

function validateSignup(displayNameVal, emailVal, passVal, confirmPassVal) {
  const errors = {};
  const displayNameErr = getDisplayNameError(displayNameVal);
  if (displayNameErr) errors.displayName = displayNameErr;

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
  const { t } = useLanguage();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
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

    if (field === 'displayName') {
      const err = displayName.trim() ? getDisplayNameError(displayName) : '';
      setFieldErrors((prev) => ({ ...prev, displayName: err }));
    } else if (field === 'email') {
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
    setGeneralError(null);
    setSuccessMessage(null);
    setHasSubmitted(true);

    const errors = validateSignup(displayName, email, password, confirmPassword);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        // Stored on the account, then copied into public.profiles by the
        // on_auth_user_created trigger in schema.sql.
        options: { data: { display_name: displayName.trim() } },
      });

      if (authError) {
        setGeneralError(authErrorMessage(authError));
        setLoading(false);
        return;
      }

      // A user with no session means Supabase is waiting on email confirmation.
      // What the contributor needs is their next step, not my project settings.
      if (data?.user && !data?.session) {
        setSuccessMessage(MESSAGES.checkInbox);
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
                <ThemeVibeIcon motif="beliefs" size={22} />
              </div>
              <h1 className="auth-title">{t({ en: 'Contributor Registration', km: 'បង្កើតគណនី' })}</h1>
              <p className="auth-description">
                <BilingualMessage
                  en="Create an account to contribute and preserve Khmer cultural knowledge."
                  km="បង្កើតគណនីដើម្បីរួមចំណែក និងថែរក្សាចំណេះដឹងវប្បធម៌ខ្មែរ។"
                />
              </p>
            </div>

            {generalError && (
              <div className="auth-error">
                <BilingualMessage en={generalError.en} km={generalError.km} />
              </div>
            )}
            {successMessage && (
              <div className="auth-success">
                <BilingualMessage en={successMessage.en} km={successMessage.km} />
              </div>
            )}

            <form className="auth-form" onSubmit={handleSignup} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="signup-display-name">
                  <span>
                    {t({ en: 'Display name', km: 'ឈ្មោះបង្ហាញ' })} <span className="auth-required">*</span>
                  </span>
                </label>
                <input
                  id="signup-display-name"
                  type="text"
                  className={`auth-input ${fieldErrors.displayName ? 'has-error' : ''}`}
                  placeholder={t({ en: 'Shown publicly on entries you submit', km: 'បង្ហាញជាសាធារណៈលើធាតុដែលអ្នកដាក់ស្នើ' })}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onBlur={() => handleBlur('displayName')}
                  autoComplete="nickname"
                />
                {fieldErrors.displayName && (
                  <p className="auth-field-error">
                    <BilingualMessage en={fieldErrors.displayName.en} km={fieldErrors.displayName.km} />
                  </p>
                )}
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="signup-email">
                  <span>
                    {t({ en: 'Email', km: 'អ៊ីមែល' })} <span className="auth-required">*</span>
                  </span>
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
                  <p className="auth-field-error">
                    <BilingualMessage en={fieldErrors.email.en} km={fieldErrors.email.km} />
                  </p>
                )}
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="signup-password">
                  <span>
                    {t({ en: 'Password', km: 'ពាក្យសម្ងាត់' })} <span className="auth-required">*</span>
                  </span>
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
                    title={t(showPassword ? { en: 'Hide password', km: 'លាក់ពាក្យសម្ងាត់' } : { en: 'Show password', km: 'បង្ហាញពាក្យសម្ងាត់' })}
                    aria-label={t(showPassword ? { en: 'Hide password', km: 'លាក់ពាក្យសម្ងាត់' } : { en: 'Show password', km: 'បង្ហាញពាក្យសម្ងាត់' })}
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

              <div className="auth-field">
                <label className="auth-label" htmlFor="signup-confirm-password">
                  <span>
                    {t({ en: 'Confirm Password', km: 'ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់' })} <span className="auth-required">*</span>
                  </span>
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
                    title={t(showConfirmPassword ? { en: 'Hide password', km: 'លាក់ពាក្យសម្ងាត់' } : { en: 'Show password', km: 'បង្ហាញពាក្យសម្ងាត់' })}
                    aria-label={t(showConfirmPassword ? { en: 'Hide password', km: 'លាក់ពាក្យសម្ងាត់' } : { en: 'Show password', km: 'បង្ហាញពាក្យសម្ងាត់' })}
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="auth-field-error">
                    <BilingualMessage
                      en={fieldErrors.confirmPassword.en}
                      km={fieldErrors.confirmPassword.km}
                    />
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? t({ en: 'Creating account…', km: 'កំពុងបង្កើតគណនី…' }) : t({ en: 'Sign Up', km: 'បង្កើតគណនី' })}
              </button>
            </form>

            <div className="auth-footer">
              {t({ en: 'Already have a contributor account?', km: 'មានគណនីអ្នករួមចំណែករួចហើយ?' })}
              <Link href="/login" className="auth-link">
                {t({ en: 'Sign in', km: 'ចូលគណនី' })}
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
