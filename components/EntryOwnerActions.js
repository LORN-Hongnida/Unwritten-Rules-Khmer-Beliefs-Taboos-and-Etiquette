'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';

import DeleteConfirmModal from './DeleteConfirmModal';
import { useLanguage } from './LanguageProvider';
import { EditIcon, DeleteIcon } from './ActionIcons';

// `knownOwner` is for pages that already know the viewer owns the entry (My
// Entries lists only the viewer's own), so a list of twenty rows does not make
// twenty separate "who is signed in?" requests. The database policies still
// decide whether the edit or delete is allowed.
// `compact` draws the buttons in the entry view's top bar style, beside Share;
// on a phone their text hides and the icon remains (see .modal-action-label).
export default function EntryOwnerActions({ entryId, ownerId, entryTitle = 'this entry', onClose, knownOwner = false, compact = false }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isReviewer, setIsReviewer] = useState(false);
  const { t } = useLanguage();
  const editLabel = t({ en: 'Edit', km: 'កែប្រែ' });
  const deleteLabel = t({ en: 'Delete', km: 'លុប' });

  useEffect(() => {
    if (knownOwner) return;
    let isMounted = true;
    const supabase = createClient();

    async function fetchUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        // A failed lookup and a non-owner both render nothing, so without this
        // an auth problem is invisible.
        if (error) console.error('Could not resolve the signed-in user:', error);
        if (isMounted) setCurrentUser(user);
        // Reviewers are the site's admins and manage every entry. This only
        // decides whether the buttons show; the database policies are what
        // actually allow or refuse the edit and delete.
        if (user) {
          const { data: reviewer } = await supabase.rpc('is_reviewer');
          if (isMounted) setIsReviewer(reviewer === true);
        }
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

  const isOwner = currentUser && ownerId && currentUser.id === ownerId;
  if (!knownOwner && (!currentUser || (!isOwner && !isReviewer))) {
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
        alert(t({ en: "That change wasn't saved", km: 'ការផ្លាស់ប្តូរនោះមិនត្រូវបានរក្សាទុកទេ' }));
        setDeleting(false);
        setShowConfirmModal(false);
        return;
      }

      setShowConfirmModal(false);
      if (onClose) onClose();
      // Stay on whichever page the delete happened on (Browse, My Entries or
      // the admin page) and reload it, so the deleted entry is gone from it.
      window.location.reload();
    } catch (err) {
      console.error('Delete error:', err);
      alert(t({ en: "That change wasn't saved", km: 'ការផ្លាស់ប្តូរនោះមិនត្រូវបានរក្សាទុកទេ' }));
      setDeleting(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <>
      <div className="entry-owner-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Link
          href={`/contribute?edit=${entryId}`}
          className={compact ? 'modal-share' : 'btn btn-secondary'}
          onClick={() => onClose && onClose()}
          title={editLabel}
          aria-label={editLabel}
        >
          <EditIcon />
          <span className="modal-action-label">{editLabel}</span>
        </Link>
        <button
          type="button"
          className={compact ? 'modal-share modal-share-danger' : 'btn btn-danger'}
          onClick={() => setShowConfirmModal(true)}
          disabled={deleting}
          title={deleteLabel}
          aria-label={deleteLabel}
        >
          <DeleteIcon />
          <span className="modal-action-label">{deleteLabel}</span>
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
