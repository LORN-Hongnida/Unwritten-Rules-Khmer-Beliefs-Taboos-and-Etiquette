'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';

function withTheme(href, theme) {
  return theme === 'all' ? href : `${href}?theme=${theme}`;
}

export default function UserNavAuth({ selectedTheme = 'all', onNavClick }) {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      return;
    }

    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
        setUser(currentUser);
      }).catch(() => {});

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
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
          title="Account options"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="user-menu-avatar">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Contributor avatar"
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
              <div className="user-menu-role">Contributor</div>
              <div className="user-menu-email" title={user.email}>
                {user.email}
              </div>
            </div>

            <button
              type="button"
              role="menuitem"
              className="user-menu-logout"
              onClick={handleLogout}
            >
              <span>Log out</span>
              <span lang="km">ចាកចេញ</span>
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
      Sign In
    </Link>
  );
}
