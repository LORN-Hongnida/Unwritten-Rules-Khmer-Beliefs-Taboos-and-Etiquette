'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteNav from '../../components/SiteNav';
import ThemeAtmosphereBackdrop from '../../components/ThemeAtmosphereBackdrop';
import { useTheme } from '../../components/ThemeProvider';
import { ThemeVibeIcon } from '../../components/KbachMotifs';
import { createClient } from '../../lib/supabase/client';

export default function LoginPage() {
  const { selectedTheme, setSelectedTheme, isDark, toggleMode } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
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
                <ThemeVibeIcon motif="etiquette" size={22} />
              </div>
              <h1 className="auth-title">ចូលគណនី</h1>
              <div className="auth-title-sub">Contributor Login</div>
              <p className="auth-description">
                Sign in to manage cultural entries in the archive.
              </p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-field">
                <label className="auth-label" htmlFor="email-input">
                  <span>Email</span>
                  <span className="auth-label-km">អ៊ីមែល</span>
                </label>
                <input
                  id="email-input"
                  type="email"
                  className={`auth-input ${error ? 'has-error' : ''}`}
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
                <label className="auth-label" htmlFor="password-input">
                  <span>Password</span>
                  <span className="auth-label-km">ពាក្យសម្ងាត់</span>
                </label>
                <input
                  id="password-input"
                  type="password"
                  className={`auth-input ${error ? 'has-error' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  autoComplete="current-password"
                />
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
