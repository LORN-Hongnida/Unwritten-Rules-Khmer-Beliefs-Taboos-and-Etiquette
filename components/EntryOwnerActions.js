'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';

import DeleteConfirmModal from './DeleteConfirmModal';

export default function EntryOwnerActions({ entryId, ownerId, entryTitle = 'this entry', onClose }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function fetchUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        // A failed lookup and a non-owner both render nothing, so without this
        // an auth problem is invisible.
        if (error) console.error('Could not resolve the signed-in user:', error);
        if (isMounted) setCurrentUser(user);
      } catch (err) {
        console.error('Could not resolve the signed-in user:', err);
      }
    }
    fetchUser();

    // The modal often mounts long after sign-in; this keeps the owner controls
    // in step with a session that refreshes or changes while it is open.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setCurrentUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  if (!currentUser || !ownerId || currentUser.id !== ownerId) {
    return null;
  }

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('entries')
        .delete()
        .eq('id', entryId)
        .select();

      if (error || !data || data.length === 0) {
        console.error('Delete refused or failed:', error);
        alert("That change wasn't saved");
        setDeleting(false);
        setShowConfirmModal(false);
        return;
      }

      setShowConfirmModal(false);
      if (onClose) onClose();
      window.location.href = '/browse';
    } catch (err) {
      console.error('Delete error:', err);
      alert("That change wasn't saved");
      setDeleting(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <>
      <div className="entry-owner-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Link
          href={`/contribute?edit=${entryId}`}
          className="owner-btn-edit"
          onClick={() => onClose && onClose()}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--accent)',
            border: '1px solid var(--accent)',
            textDecoration: 'none',
            cursor: 'pointer'
          }}
        >
          Edit Entry / <span className="btn-label-km" lang="km">កែប្រែ</span>
        </Link>
        <button
          type="button"
          className="owner-btn-delete"
          onClick={() => setShowConfirmModal(true)}
          disabled={deleting}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--krama-red, #a44a38)',
            border: '1px solid var(--krama-red, #a44a38)',
            background: 'transparent',
            cursor: deleting ? 'not-allowed' : 'pointer'
          }}
        >
          Delete / <span className="btn-label-km" lang="km">លុប</span>
        </button>
      </div>

      <DeleteConfirmModal
        isOpen={showConfirmModal}
        title={entryTitle}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
}
