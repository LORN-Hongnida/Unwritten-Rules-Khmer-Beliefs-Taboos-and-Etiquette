'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteNav from '../../components/SiteNav';
import ThemeAtmosphereBackdrop from '../../components/ThemeAtmosphereBackdrop';
import { useTheme } from '../../components/ThemeProvider';
import { ThemeVibeIcon } from '../../components/KbachMotifs';
import { createClient } from '../../lib/supabase/client';

export default function SignupPage() {
  const { selectedTheme, setSelectedTheme, isDark, toggleMode } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Invalid email or password');
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

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSignup}>
              <div className="auth-field">
                <label className="auth-label" htmlFor="signup-email">
                  <span>Email</span>
                  <span className="auth-label-km">អ៊ីមែល</span>
                </label>
                <input
                  id="signup-email"
                  type="email"
                  className={`auth-input ${error && error !== 'Passwords do not match' ? 'has-error' : ''}`}
                  placeholder="contributor@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="signup-password">
                  <span>Password</span>
                  <span className="auth-label-km">ពាក្យសម្ងាត់</span>
                </label>
                <input
                  id="signup-password"
                  type="password"
                  className={`auth-input ${error ? 'has-error' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="signup-confirm-password">
                  <span>Confirm Password</span>
                  <span className="auth-label-km">ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់</span>
                </label>
                <input
                  id="signup-confirm-password"
                  type="password"
                  className={`auth-input ${error ? 'has-error' : ''}`}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  autoComplete="new-password"
                />
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
