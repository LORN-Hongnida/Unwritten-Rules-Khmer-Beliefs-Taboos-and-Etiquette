'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';
import { useLanguage } from './LanguageProvider';

function withTheme(href, theme) {
  return theme === 'all' ? href : `${href}?theme=${theme}`;
}

export default function UserNavAuth({ selectedTheme = 'all', onNavClick }) {
  const [user, setUser] = useState(null);
  const [isReviewer, setIsReviewer] = useState(false);
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return;
    }

    try {
      const supabase = createClient();
      supabase.auth.getUser().then(async ({ data: { user: currentUser } }) => {
        setUser(currentUser);
        if (currentUser) {
          try {
            const { data: reviewerStatus } = await supabase.rpc('is_reviewer');
            setIsReviewer(!!reviewerStatus);
          } catch { /* not a reviewer */ }
        }
      }).catch(() => {});

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) setIsReviewer(false);
      });

      return () => subscription?.unsubscribe();
    } catch {
      // Ignore auth initialization errors if variables are not set
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    if (onNavClick) onNavClick();
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore auth error during signout
    }
    setUser(null);
    router.push('/');
    router.refresh();
  };

  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    const initial = user.email ? user.email[0].toUpperCase() : 'C';

    return (
      <div className="user-menu-container" ref={menuRef}>
        <button
          type="button"
          className="user-menu-trigger"
          onClick={() => setIsOpen((open) => !open)}
          title={t({ en: 'Account options', km: 'ជម្រើសគណនី' })}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="user-menu-avatar">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={t({ en: 'Contributor avatar', km: 'រូបតំណាងអ្នករួមចំណែក' })}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>
        </button>

        {isOpen && (
          <div className="user-menu-dropdown" role="menu">
            <div className="user-menu-info">
              <div className="user-menu-role">{isReviewer
                ? t({ en: 'Admin · Reviewer', km: 'អ្នកគ្រប់គ្រង · អ្នកពិនិត្យ' })
                : t({ en: 'Contributor', km: 'អ្នករួមចំណែក' })}</div>
              <div className="user-menu-email" title={user.email}>
                {user.email}
              </div>
            </div>

            {/* Lives in this menu rather than NAV_LINKS because that list is a
                module constant shown to everyone, and this page only means
                anything to someone signed in. */}
            <Link
              href="/my-entries"
              role="menuitem"
              className="user-menu-link"
              onClick={() => {
                setIsOpen(false);
                if (onNavClick) onNavClick();
              }}
            >
              <span>{t({ en: 'My Entries', km: 'ធាតុរបស់ខ្ញុំ' })}</span>
            </Link>

            {isReviewer && (
              <Link
                href="/admin/review"
                role="menuitem"
                className="user-menu-link"
                onClick={() => {
                  setIsOpen(false);
                  if (onNavClick) onNavClick();
                }}
              >
                <span>{t({ en: 'Admin', km: 'ផ្ទាំងគ្រប់គ្រង' })}</span>
              </Link>
            )}

            <button
              type="button"
              role="menuitem"
              className="user-menu-logout"
              onClick={handleLogout}
            >
              <span>{t({ en: 'Log out', km: 'ចាកចេញ' })}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={withTheme('/login', selectedTheme)}
      className={`site-nav-link ${pathname === '/login' || pathname === '/signup' ? 'is-active' : ''}`}
      aria-current={pathname === '/login' ? 'page' : undefined}
      onClick={onNavClick}
    >
      {t({ en: 'Sign In', km: 'ចូលគណនី' })}
    </Link>
  );
}
