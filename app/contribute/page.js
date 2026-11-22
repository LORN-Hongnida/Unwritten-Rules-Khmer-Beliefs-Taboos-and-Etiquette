'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SiteNav from '../../components/SiteNav';
import ThemeAtmosphereBackdrop from '../../components/ThemeAtmosphereBackdrop';
import { useTheme } from '../../components/ThemeProvider';
import { useLanguage } from '../../components/LanguageProvider';
import { ThemeVibeIcon } from '../../components/KbachMotifs';
import EntryPreviewCard from '../../components/EntryPreviewCard';
import ImageCropper from '../../components/ImageCropper';
import BilingualMessage from '../../components/BilingualMessage';
import { createClient } from '../../lib/supabase/client';

const CATEGORY_OPTIONS = [
  { value: 'beliefs', labelEn: 'Belief', labelKm: 'ជំនឿ', motif: 'lantern' },
  { value: 'taboos', labelEn: 'Taboo', labelKm: 'ការហាមប្រាម', motif: 'moon' },
  { value: 'etiquette', labelEn: 'Etiquette', labelKm: 'សុជីវធម៌', motif: 'crown' },
];

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5242880; // 5 MB

// Messages live together rather than inline so the two languages stay in step:
// an English string edited on its own would otherwise drift from its Khmer.
// Which input each validation error belongs to, so a failed submit can take
// the contributor straight to the first problem instead of leaving them at
// the bottom of a long form wondering why nothing happened.
const FIELD_IDS = {
  titleKm: 'entry-title-km',
  title: 'entry-title',
  description: 'entry-description',
  reason: 'entry-reason',
  contributor: 'entry-contributor',
  place: 'entry-place',
  stillBelieved: 'entry-still-believed',
};

// Supabase errors print as {} because their fields are not enumerable.
const describeError = (error) =>
  error ? [error.code, error.message, error.details, error.hint].filter(Boolean).join(' | ') : 'no rows returned';

const MESSAGES = {
  titleRequired: { en: 'English title is required.', km: 'តម្រូវឱ្យមានចំណងជើងជាភាសាអង់គ្លេស។' },
  titleLength: { en: 'Title must be between 3 and 150 characters.', km: 'ចំណងជើងត្រូវមានពី ៣ ទៅ ១៥០ តួអក្សរ។' },
  titleKmRequired: { en: 'Khmer title is required.', km: 'តម្រូវឱ្យមានចំណងជើងជាភាសាខ្មែរ។' },
  titleKmLength: { en: 'Khmer title must be between 2 and 150 characters.', km: 'ចំណងជើងខ្មែរត្រូវមានពី ២ ទៅ ១៥០ តួអក្សរ។' },
  categoryRequired: { en: 'Please select a category.', km: 'សូមជ្រើសរើសប្រភេទ។' },
  descriptionRequired: { en: 'Description is required.', km: 'តម្រូវឱ្យមានការពិពណ៌នា។' },
  descriptionShort: { en: 'Description must be at least 10 characters long.', km: 'ការពិពណ៌នាត្រូវមានយ៉ាងតិច ១០ តួអក្សរ។' },
  descriptionLong: { en: 'Description must not exceed 1000 characters.', km: 'ការពិពណ៌នាមិនត្រូវលើសពី ១០០០ តួអក្សរទេ។' },
  reasonLong: { en: 'Practical origin must not exceed 1000 characters.', km: 'ប្រភពដើមជាក់ស្តែងមិនត្រូវលើសពី ១០០០ តួអក្សរទេ។' },
  contributorLong: { en: 'Contributor name must not exceed 100 characters.', km: 'ឈ្មោះអ្នករួមចំណែកមិនត្រូវលើសពី ១០០ តួអក្សរទេ។' },
  placeLong: { en: 'Place must not exceed 100 characters.', km: 'ទីកន្លែងមិនត្រូវលើសពី ១០០ តួអក្សរទេ។' },
  stillBelievedLong: { en: 'Still believed status must not exceed 200 characters.', km: 'ស្ថានភាពជំនឿមិនត្រូវលើសពី ២០០ តួអក្សរទេ។' },
  photoType: { en: 'Only JPEG, PNG, and WebP images are allowed.', km: 'អនុញ្ញាតតែរូបភាព JPEG, PNG និង WebP ប៉ុណ្ណោះ។' },
  photoSize: { en: 'Photo file size must not exceed 5 MB.', km: 'ទំហំរូបថតមិនត្រូវលើសពី ៥ MB ទេ។' },
  loadEditFailed: { en: 'Could not load entry for editing.', km: 'មិនអាចផ្ទុកទិន្នន័យដើម្បីកែប្រែបានទេ។' },
  notOwner: { en: "You don't have permission to edit this entry.", km: 'អ្នកគ្មានសិទ្ធិកែប្រែទិន្នន័យនេះទេ។' },
  mustLogIn: { en: 'You must be logged in to contribute.', km: 'អ្នកត្រូវចូលគណនីជាមុនសិន ដើម្បីរួមចំណែក។' },
  uploadFailed: { en: 'Failed to upload photo. Please check the image format and size (max 5MB).', km: 'មិនអាចផ្ទុករូបថតបានទេ។ សូមពិនិត្យទម្រង់ និងទំហំរូបភាព (អតិបរមា ៥MB)។' },
  updateFailed: { en: "That change wasn't saved.", km: 'ការកែប្រែមិនបានរក្សាទុកទេ។' },
  saveFailed: { en: 'Failed to save entry. Please try again.', km: 'មិនអាចរក្សាទុកទិន្នន័យបានទេ។ សូមព្យាយាមម្តងទៀត។' },
  unexpected: { en: 'An unexpected error occurred while saving.', km: 'មានបញ្ហាមិននឹកស្មានក្នុងពេលរក្សាទុក។' },
  fixErrors: { en: 'Some fields need attention before this can be submitted.', km: 'មានចន្លោះខ្លះត្រូវកែមុនពេលដាក់ស្នើ។' },
};

function getFileExtension(filename) {
  const parts = filename.split('.');
  if (parts.length > 1) {
    const ext = parts.pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return ext;
  }
  return 'jpg';
}

export default function ContributePage() {
  const { selectedTheme, setSelectedTheme, isDark, toggleMode } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [titleKm, setTitleKm] = useState('');
  const [category, setCategory] = useState('beliefs');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [stillBelieved, setStillBelieved] = useState('');
  const [place, setPlace] = useState('');
  const [contributor, setContributor] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState('');
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  // The untouched upload is kept so re-cropping always re-reads the original
  // pixels rather than compounding loss from the previous crop.
  const [originalPhotoFile, setOriginalPhotoFile] = useState(null);
  const [cropSource, setCropSource] = useState(null);
  // Rotation and selection from the last Apply, so reopening the cropper
  // resumes where the contributor left off rather than resetting.
  const [photoAdjustment, setPhotoAdjustment] = useState(null);

  // Status & errors
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingEdit, setFetchingEdit] = useState(false);
  const [rereviewWarning, setRereviewWarning] = useState(false);

  // Check logged in user
  useEffect(() => {
    let isMounted = true;
    async function checkUser() {
      try {
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (isMounted) {
          setUser(currentUser);
          setUserLoading(false);
        }
      } catch (err) {
        console.error('Failed to get auth user:', err);
        if (isMounted) setUserLoading(false);
      }
    }
    checkUser();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch entry data if in edit mode
  useEffect(() => {
    if (!editId || !user) return;
    let isMounted = true;

    async function loadEditEntry() {
      setFetchingEdit(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('entries')
          .select('*')
          .eq('id', editId)
          .single();

        if (error || !data) {
          console.error('Failed to load entry for editing:', error);
          if (isMounted) setFormError(MESSAGES.loadEditFailed);
          return;
        }

        // Must be the owner, or a reviewer (the site's admins) to edit. The
        // update policy enforces the same rule in the database.
        const { data: reviewer } = await supabase.rpc('is_reviewer');
        const isAdmin = reviewer === true;
        if (data.owner !== user.id && !isAdmin) {
          console.error('Unauthorized edit attempt: user is not owner');
          if (isMounted) setFormError(MESSAGES.notOwner);
          return;
        }

        if (isMounted) {
          // Saving will take a published entry out of the archive until it is
          // approved again (admins' edits excepted), so the author is told
          // before they press save, not after.
          setRereviewWarning(data.status === 'published' && !isAdmin);
          setTitle(data.title || '');
          setTitleKm(data.title_km || '');
          setCategory(data.category || 'beliefs');
          setDescription(data.description || '');
          setReason(data.reason || '');
          setStillBelieved(data.still_believed || '');
          setPlace(data.place || '');
          setContributor(data.contributor || '');
          setExistingPhotoUrl(data.photo_url || '');
          setPhotoPreviewUrl(data.photo_url || '');
        }
      } catch (err) {
        console.error('Error fetching edit entry:', err);
      } finally {
        if (isMounted) setFetchingEdit(false);
      }
    }

    loadEditEntry();
  }, [editId, user]);

  // Preview URLs are object URLs for freshly picked files and plain https URLs
  // for an entry being edited; only the former need revoking.
  const setPreview = (nextUrl) => {
    setPhotoPreviewUrl((prev) => {
      if (prev && prev.startsWith('blob:') && prev !== nextUrl) {
        URL.revokeObjectURL(prev);
      }
      return nextUrl;
    });
  };

  // Format and size are checked before the cropper opens: there is no point
  // framing an image the upload would reject anyway.
  const handlePhotoSelect = (file) => {
    if (!file) {
      setPhotoFile(null);
      setOriginalPhotoFile(null);
      setPreview(existingPhotoUrl);
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setFieldErrors((prev) => ({ ...prev, photo: MESSAGES.photoType }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFieldErrors((prev) => ({ ...prev, photo: MESSAGES.photoSize }));
      return;
    }

    setFieldErrors((prev) => ({ ...prev, photo: '' }));
    setOriginalPhotoFile(file);
    // A different photo starts from a clean slate.
    setPhotoAdjustment(null);
    setCropSource(file);
  };

  const handleCropApply = (croppedFile, adjustment) => {
    setPhotoFile(croppedFile);
    setPreview(URL.createObjectURL(croppedFile));
    setPhotoAdjustment(adjustment);
    setCropSource(null);
    setFieldErrors((prev) => ({ ...prev, photo: '' }));
  };

  // Backing out of the cropper leaves whatever photo was already attached.
  const handleCropCancel = () => setCropSource(null);

  const handleRecrop = () => {
    if (originalPhotoFile) setCropSource(originalPhotoFile);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setOriginalPhotoFile(null);
    setPhotoAdjustment(null);
    setExistingPhotoUrl('');
    setPreview('');
  };

  // The paste listener is bound once, so it reads the current handler through
  // a ref rather than capturing the first render's closure.
  const photoSelectRef = useRef(handlePhotoSelect);
  photoSelectRef.current = handlePhotoSelect;

  // Clipboard paste support (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            photoSelectRef.current(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoSelect(e.dataTransfer.files[0]);
    }
  };

  const validateForm = () => {
    const errors = {};
    const trimmedTitle = title.trim();
    const trimmedTitleKm = titleKm.trim();
    const trimmedDesc = description.trim();
    const trimmedReason = reason.trim();
    const trimmedPlace = place.trim();
    const trimmedContributor = contributor.trim();
    const trimmedStillBelieved = stillBelieved.trim();

    if (!trimmedTitle) {
      errors.title = MESSAGES.titleRequired;
    } else if (trimmedTitle.length < 3 || trimmedTitle.length > 150) {
      errors.title = MESSAGES.titleLength;
    }

    if (!trimmedTitleKm) {
      errors.titleKm = MESSAGES.titleKmRequired;
    } else if (trimmedTitleKm.length < 2 || trimmedTitleKm.length > 150) {
      errors.titleKm = MESSAGES.titleKmLength;
    }

    if (!category) {
      errors.category = MESSAGES.categoryRequired;
    }

    if (!trimmedDesc) {
      errors.description = MESSAGES.descriptionRequired;
    } else if (trimmedDesc.length < 10) {
      errors.description = MESSAGES.descriptionShort;
    } else if (trimmedDesc.length > 1000) {
      errors.description = MESSAGES.descriptionLong;
    }

    if (trimmedReason.length > 1000) {
      errors.reason = MESSAGES.reasonLong;
    }

    if (trimmedContributor.length > 100) {
      errors.contributor = MESSAGES.contributorLong;
    }

    if (trimmedPlace.length > 100) {
      errors.place = MESSAGES.placeLong;
    }

    if (trimmedStillBelieved.length > 200) {
      errors.stillBelieved = MESSAGES.stillBelievedLong;
    }

    // Photo is optional: validate only if a file is provided
    if (photoFile) {
      if (!ALLOWED_MIME_TYPES.includes(photoFile.type)) {
        errors.photo = MESSAGES.photoType;
      } else if (photoFile.size > MAX_FILE_SIZE) {
        errors.photo = MESSAGES.photoSize;
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFormError(MESSAGES.fixErrors);
      // In form order, so the first one on screen is the one shown.
      const firstId = Object.keys(FIELD_IDS).map((k) => errors[k] && FIELD_IDS[k]).find(Boolean);
      const field = firstId && document.getElementById(firstId);
      if (field) {
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
        field.focus({ preventScroll: true });
      }
      return;
    }

    if (!user) {
      setFormError(MESSAGES.mustLogIn);
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      let photoUrl = existingPhotoUrl;

      // Upload photo if a new file was selected
      if (photoFile) {
        const ext = getFileExtension(photoFile.name);
        const randomName = typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2) + Date.now().toString(36);
        const filePath = `${user.id}/${randomName}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, photoFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Storage upload failed:', describeError(uploadError));
          setFormError(MESSAGES.uploadFailed);
          setLoading(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath);

        photoUrl = publicUrlData?.publicUrl || photoUrl;
      }

      // Prepare explicit insert/update payload (never spreading form data)
      // No owner here: it is added on insert only, below. On an edit it would
      // hand the entry to whoever is editing, which for an admin is not the
      // author.
      const payload = {
        title: title.trim(),
        title_km: titleKm.trim(),
        category,
        description: description.trim(),
        reason: reason.trim() || null,
        still_believed: stillBelieved.trim() || null,
        place: place.trim() || null,
        contributor: contributor.trim() || null,
        photo_url: photoUrl || null,
        // No status. The column defaults to 'pending', and the insert policy
        // refuses a row that names itself published, so sending one here would
        // only turn a waiting entry into an error message.
      };

      if (editId) {
        // A gate that opens once and stays open is not a gate: an edit to a
        // published entry sends it back to review. Reviewers are the exception,
        // and the update policy's WITH CHECK enforces the same rule, so without
        // the pending status here the edit would simply be refused.
        const { data: isReviewer, error: reviewerError } = await supabase.rpc('is_reviewer');
        if (reviewerError) console.error('Could not check reviewer status:', reviewerError);

        const { data, error } = await supabase
          .from('entries')
          .update(isReviewer === true ? payload : { ...payload, status: 'pending' })
          // No owner filter: an admin edits entries they do not own. The
          // update policy still refuses anyone who is neither owner nor admin.
          .eq('id', editId)
          .select();

        if (error || !data || data.length === 0) {
          console.error('Update refused or failed:', describeError(error));
          setFormError(MESSAGES.updateFailed);
          setLoading(false);
          return;
        }

        // A non-reviewer's edit has just taken the entry out of the public
        // archive, so sending them to it on /browse would show an empty page
        // and read as a bug. /my-entries shows it waiting, which is the truth.
        if (isReviewer === true) {
          // An admin's edit keeps the entry's status. A published one is on
          // Browse; one still waiting or returned lives on the admin page.
          router.push(data[0].status === 'published' ? `/browse?entry=${data[0].id}` : '/admin/review');
        } else {
          router.push('/my-entries');
        }
        router.refresh();
      } else {
        const { data, error } = await supabase
          .from('entries')
          .insert({ ...payload, owner: user.id })
          .select();

        if (error || !data || data.length === 0) {
          console.error('Insert refused or failed:', describeError(error));
          setFormError(MESSAGES.saveFailed);
          setLoading(false);
          return;
        }

        // The entry is not in the archive yet, so sending the contributor to it
        // would show them an empty page. They get told it is waiting instead.
        setSubmitted(true);
        setLoading(false);
      }
    } catch (err) {
      console.error('Unexpected error during submission:', err);
      setFormError(MESSAGES.unexpected);
      setLoading(false);
    }
  };

  if (userLoading) {
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
          <main className="contribute-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p>{t({ en: 'Loading…', km: 'កំពុងផ្ទុក…' })}</p>
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
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
          <main className="contribute-container">
            <div className="contribute-card" style={{ textAlign: 'center', padding: '48px 24px', maxWidth: '560px', margin: '40px auto' }}>
              <div className="auth-motif" aria-hidden="true" style={{ marginBottom: '12px' }}>
                <ThemeVibeIcon motif="etiquette" size={28} />
              </div>
              <h1 className="auth-title">{t({ en: 'Sign in required', km: 'ត្រូវចូលគណនី' })}</h1>
              <p className="auth-description" style={{ margin: '16px 0 24px' }}>
                {t({
                  en: 'Only logged-in contributors can submit entries to the archive. Please sign in to share cultural knowledge.',
                  km: 'មានតែអ្នករួមចំណែកដែលបានចូលគណនីប៉ុណ្ណោះ ដែលអាចដាក់ស្នើធាតុទៅបណ្ណសារ។ សូមចូលគណនីដើម្បីចែករំលែកចំណេះដឹងវប្បធម៌។',
                })}
              </p>
              <Link href="/login" className="auth-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>
                {t({ en: 'Sign In to Contribute', km: 'ចូលគណនីដើម្បីរួមចំណែក' })}
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Nothing is persisted between visits, so an empty form has to be made by
  // hand: without this, the next contribution opens pre-filled with the one
  // that was just submitted.
  const handleContributeAnother = () => {
    setTitle('');
    setTitleKm('');
    setCategory('beliefs');
    setDescription('');
    setReason('');
    setStillBelieved('');
    setPlace('');
    setContributor('');
    setPhotoFile(null);
    setOriginalPhotoFile(null);
    setExistingPhotoUrl('');
    // setPreview rather than the raw setter, so the object URL is revoked.
    setPreview('');
    setPhotoAdjustment(null);
    setFieldErrors({});
    setFormError(null);
    setSubmitted(false);
  };

  // What a contributor sees while their entry waits. It names the review step
  // rather than leaving them to wonder why their entry is not in the archive,
  // and points at /my-entries so the waiting is something they can check on.
  if (submitted) {
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
          <main className="contribute-container">
            <div className="contribute-card" style={{ textAlign: 'center', padding: '48px 24px', maxWidth: '560px', margin: '40px auto' }}>
              <div className="auth-motif" aria-hidden="true" style={{ marginBottom: '12px' }}>
                <ThemeVibeIcon motif="lantern" size={28} />
              </div>
              <h1 className="auth-title">{t({ en: 'Thank you for your contribution!', km: 'សូមអរគុណចំពោះការរួមចំណែករបស់អ្នក!' })}</h1>
              <p className="auth-description" style={{ margin: '16px 0 24px' }}>
                {t({
                  en: 'Your entry is waiting to be reviewed before it joins the public archive.',
                  km: 'ធាតុរបស់អ្នកកំពុងរង់ចាំការពិនិត្យ មុននឹងចូលទៅក្នុងបណ្ណសារសាធារណៈ។',
                })}
              </p>
              <Link href="/my-entries" className="auth-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>
                {t({ en: 'View my entries', km: 'មើលធាតុរបស់ខ្ញុំ' })}
              </Link>
              <div className="auth-footer" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="auth-link"
                  onClick={handleContributeAnother}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
                >
                  {t({ en: 'Contribute another', km: 'រួមចំណែកម្តងទៀត' })}
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

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

        <main className="contribute-container">
          {/* Header section */}
          <div className="contribute-header">
            <Link href="/browse" className="contribute-back">
              <span>←</span>
              <span>{t({ en: 'Back to Browse Archive', km: 'ត្រឡប់ទៅបណ្ណសារ' })}</span>
            </Link>
            <div className="contribute-title-wrapper">
              <ThemeVibeIcon motif={category} size={28} />
              <h1 className="contribute-title">
                {editId
                  ? t({ en: 'Edit Entry', km: 'កែប្រែទិន្នន័យ' })
                  : t({ en: 'Contribute Entry', km: 'បន្ថែមចំណេះដឹងវប្បធម៌' })}
              </h1>
            </div>
            <p className="contribute-subtitle">
              {t({
                en: 'Document oral traditions, elder teachings, and ancient rules for preservation in the Khmer Living Archive.',
                km: 'កត់ត្រាទំនៀមទម្លាប់តាមមាត់ ពាក្យទូន្មានរបស់ចាស់ទុំ និងក្បួនច្បាប់បុរាណ ដើម្បីថែរក្សាទុកក្នុងបណ្ណសារ។',
              })}
            </p>
          </div>

          {formError && (
            <div className="auth-error" style={{ marginBottom: '24px' }}>
              <BilingualMessage en={formError.en} km={formError.km} />
            </div>
          )}

          {editId && rereviewWarning && (
            <div className="auth-success" style={{ marginBottom: '24px' }}>
              <BilingualMessage
                en="This entry is public. Saving your changes sends it back for review, and it leaves the archive until a reviewer approves it again. The reviewer will see exactly what you changed."
                km="ធាតុនេះជាសាធារណៈ។ ការរក្សាទុកការកែប្រែនឹងបញ្ជូនវាទៅពិនិត្យម្តងទៀត ហើយវានឹងចេញពីបណ្ណសាររហូតដល់អ្នកពិនិត្យអនុម័តម្តងទៀត។ អ្នកពិនិត្យនឹងឃើញអ្វីដែលអ្នកបានកែប្រែ។"
              />
            </div>
          )}

          {fetchingEdit ? (
            <div className="contribute-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p>{t({ en: 'Loading entry details…', km: 'កំពុងផ្ទុកព័ត៌មានលម្អិត…' })}</p>
            </div>
          ) : (
            <div className="contribute-grid">
              {/* Form main column */}
              <form onSubmit={handleSubmit} noValidate>

                {/* Section 1: Classification & Titles */}
                <div className="contribute-card">
                  <h3 className="contribute-section-title">
                    <ThemeVibeIcon motif="lantern" size={16} />
                    <span>1. {t({ en: 'Category & Titles', km: 'ប្រភេទ និងចំណងជើង' })}</span>
                  </h3>

                  {/* Category Pill Buttons */}
                  <div className="auth-field">
                    <label className="auth-label">
                      <span>{t({ en: 'Category', km: 'ប្រភេទ' })} <span className="auth-required">*</span></span>
                    </label>
                    <div className="category-pill-selector">
                      {CATEGORY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`category-pill-btn ${category === opt.value ? 'is-selected' : ''}`}
                          onClick={() => setCategory(opt.value)}
                        >
                          <ThemeVibeIcon motif={opt.motif} size={13} />
                          <span>{t({ en: opt.labelEn, km: opt.labelKm })}</span>
                        </button>
                      ))}
                    </div>
                    {fieldErrors.category && (
                      <p className="auth-field-error"><BilingualMessage en={fieldErrors.category.en} km={fieldErrors.category.km} /></p>
                    )}
                  </div>

                  {/* 2-column Titles Grid */}
                  <div className="contribute-row-2col" style={{ marginTop: '16px' }}>
                    <div className="auth-field" style={{ marginBottom: 0 }}>
                      <label className="auth-label" htmlFor="entry-title-km">
                        <span>{t({ en: 'Khmer Title', km: 'ចំណងជើងភាសាខ្មែរ' })} <span className="auth-required">*</span></span>
                      </label>
                      <input
                        id="entry-title-km"
                        type="text"
                        lang="km"
                        maxLength={150}
                        className={`auth-input ${fieldErrors.titleKm ? 'has-error' : ''}`}
                        placeholder="ឧទាហរណ៍៖ ក្អែកយំលើដំបូលផ្ទះ"
                        value={titleKm}
                        onChange={(e) => setTitleKm(e.target.value)}
                      />
                      <span className={`char-counter ${titleKm.length >= 140 ? 'is-near-limit' : ''}`}>
                        {titleKm.length} / 150
                      </span>
                      {fieldErrors.titleKm && (
                        <p className="auth-field-error"><BilingualMessage en={fieldErrors.titleKm.en} km={fieldErrors.titleKm.km} /></p>
                      )}
                    </div>

                    <div className="auth-field" style={{ marginBottom: 0 }}>
                      <label className="auth-label" htmlFor="entry-title">
                        <span>{t({ en: 'English Title', km: 'ចំណងជើងជាភាសាអង់គ្លេស' })} <span className="auth-required">*</span></span>
                      </label>
                      <input
                        id="entry-title"
                        type="text"
                        maxLength={150}
                        className={`auth-input ${fieldErrors.title ? 'has-error' : ''}`}
                        placeholder="e.g. Crows crying over a rooftop"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                      <span className={`char-counter ${title.length >= 140 ? 'is-near-limit' : ''}`}>
                        {title.length} / 150
                      </span>
                      {fieldErrors.title && (
                        <p className="auth-field-error"><BilingualMessage en={fieldErrors.title.en} km={fieldErrors.title.km} /></p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: Cultural Knowledge & Details */}
                <div className="contribute-card">
                  <h3 className="contribute-section-title">
                    <ThemeVibeIcon motif="beliefs" size={16} />
                    <span>2. {t({ en: 'Cultural Significance', km: 'ខ្លឹមសារ និងប្រភពដើម' })}</span>
                  </h3>

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="entry-description">
                      <span>{t({ en: 'Stated Traditional Belief', km: 'ការរៀបរាប់ពីជំនឿ ឬការហាមប្រាម' })} <span className="auth-required">*</span></span>
                    </label>
                    <textarea
                      id="entry-description"
                      maxLength={1000}
                      className={`auth-input ${fieldErrors.description ? 'has-error' : ''}`}
                      rows={4}
                      placeholder={t({ en: 'Describe what elders taught, what happens according to the belief, or how people react...', km: 'រៀបរាប់ពីអ្វីដែលចាស់ទុំបានបង្រៀន អ្វីដែលកើតឡើងតាមជំនឿ ឬរបៀបដែលមនុស្សឆ្លើយតប...' })}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    <span className={`char-counter ${description.length >= 950 ? 'is-near-limit' : ''}`}>
                      {description.length} / 1000
                    </span>
                    {fieldErrors.description && (
                      <p className="auth-field-error"><BilingualMessage en={fieldErrors.description.en} km={fieldErrors.description.km} /></p>
                    )}
                  </div>

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="entry-reason">
                      <span>{t({ en: 'Practical Origin / Rational Reason', km: 'ប្រភពដើម និងហេតុផលជាក់ស្តែង' })}</span>
                    </label>
                    <textarea
                      id="entry-reason"
                      maxLength={1000}
                      className="auth-input"
                      rows={3}
                      placeholder={t({ en: 'Why did elders pass this rule down? What practical danger or lesson does it serve?', km: 'ហេតុអ្វីចាស់ទុំបន្សល់ទុកក្បួននេះ? តើវាការពារគ្រោះថ្នាក់ ឬផ្តល់មេរៀនអ្វីខ្លះ?' })}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <span className={`char-counter ${reason.length >= 950 ? 'is-near-limit' : ''}`}>
                      {reason.length} / 1000
                    </span>
                    {fieldErrors.reason && (
                      <p className="auth-field-error"><BilingualMessage en={fieldErrors.reason.en} km={fieldErrors.reason.km} /></p>
                    )}
                  </div>

                  <div className="contribute-row-2col">
                    <div className="auth-field">
                      <label className="auth-label" htmlFor="entry-contributor">
                        <span>{t({ en: 'Contributor / Source Credit', km: 'អ្នកផ្តល់ព័ត៌មាន / ប្រភពដើម' })}</span>
                      </label>
                      <input
                        id="entry-contributor"
                        type="text"
                        maxLength={100}
                        className="auth-input"
                        placeholder={t({ en: 'e.g. Grandmother Som, Parents', km: 'ឧ. លោកយាយសុំ ឪពុកម្តាយ' })}
                        value={contributor}
                        onChange={(e) => setContributor(e.target.value)}
                      />
                      <span className={`char-counter ${contributor.length >= 90 ? 'is-near-limit' : ''}`}>
                        {contributor.length} / 100
                      </span>
                      {fieldErrors.contributor && (
                        <p className="auth-field-error"><BilingualMessage en={fieldErrors.contributor.en} km={fieldErrors.contributor.km} /></p>
                      )}
                    </div>

                    <div className="auth-field">
                      <label className="auth-label" htmlFor="entry-place">
                        <span>{t({ en: 'Place / Province', km: 'ខេត្ត / ទីកន្លែង' })}</span>
                      </label>
                      <input
                        id="entry-place"
                        type="text"
                        maxLength={100}
                        className="auth-input"
                        placeholder={t({ en: 'e.g. Kampong Cham, Siem Reap', km: 'ឧ. កំពង់ចាម សៀមរាប' })}
                        value={place}
                        onChange={(e) => setPlace(e.target.value)}
                      />
                      <span className={`char-counter ${place.length >= 90 ? 'is-near-limit' : ''}`}>
                        {place.length} / 100
                      </span>
                      {fieldErrors.place && (
                        <p className="auth-field-error"><BilingualMessage en={fieldErrors.place.en} km={fieldErrors.place.km} /></p>
                      )}
                    </div>
                  </div>

                  <div className="auth-field" style={{ marginBottom: 0 }}>
                    <label className="auth-label" htmlFor="entry-still-believed">
                      <span>{t({ en: 'Still Believed Today?', km: 'តើនៅតែជឿរហូតមកដល់សព្វថ្ងៃ?' })}</span>
                    </label>
                    <input
                      id="entry-still-believed"
                      type="text"
                      maxLength={200}
                      className="auth-input"
                      placeholder={t({ en: 'e.g. Yes, elders still observe this.', km: 'ឧ. បាទ/ចាស ចាស់ទុំនៅតែប្រតិបត្តិ។' })}
                      value={stillBelieved}
                      onChange={(e) => setStillBelieved(e.target.value)}
                    />
                    <span className={`char-counter ${stillBelieved.length >= 180 ? 'is-near-limit' : ''}`}>
                      {stillBelieved.length} / 200
                    </span>
                    {fieldErrors.stillBelieved && (
                      <p className="auth-field-error"><BilingualMessage en={fieldErrors.stillBelieved.en} km={fieldErrors.stillBelieved.km} /></p>
                    )}
                  </div>
                </div>

                {/* Section 3: Photo Upload */}
                <div className="contribute-card">
                  <h3 className="contribute-section-title">
                    <ThemeVibeIcon motif="crown" size={16} />
                    <span>3. {t({ en: 'Photo & Media', km: 'រូបថត' })}</span>
                  </h3>

                  <div className="auth-field" style={{ marginBottom: 0 }}>
                    <label className="auth-label">
                      <span>
                        {t({ en: 'Photo Upload', km: 'បញ្ចូលរូបថត' })}{' '}
                        <span style={{ fontSize: '11px', color: 'var(--ink-muted)', fontWeight: 400 }}>({t({ en: 'Optional', km: 'មិនចាំបាច់' })})</span>
                      </span>
                    </label>

                    <label
                      htmlFor="entry-photo"
                      className="photo-dropzone"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                    >
                      <ThemeVibeIcon motif="moon" size={24} />
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>
                        {photoFile ? photoFile.name : t({ en: 'Click to select, drag & drop, or press Ctrl+V to paste image from clipboard', km: 'ចុចដើម្បីជ្រើសរើស អូសទម្លាក់ ឬចុច Ctrl+V ដើម្បីបិទភ្ជាប់រូបភាព' })}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                        {t({ en: 'Allowed: JPG, PNG, WebP • Max 5 MB • Clipboard paste (Ctrl+V) enabled', km: 'អនុញ្ញាត៖ JPG, PNG, WebP • អតិបរមា 5 MB • អាចបិទភ្ជាប់ (Ctrl+V)' })}
                      </div>
                      <input
                        id="entry-photo"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }}
                        // Cleared on every pick so choosing the same file twice
                        // still fires a change event and reopens the cropper.
                        onChange={(e) => {
                          handlePhotoSelect(e.target.files[0] || null);
                          e.target.value = '';
                        }}
                      />
                    </label>

                    {photoPreviewUrl && (
                      <div className="photo-attached">
                        <div className="photo-attached-thumb">
                          <img src={photoPreviewUrl} alt={t({ en: 'Attached photo preview', km: 'មើលរូបថតដែលបានភ្ជាប់' })} />
                        </div>
                        <div className="photo-attached-body">
                          <p className="photo-attached-name">
                            {photoFile ? photoFile.name : t({ en: 'Current photo', km: 'រូបថតបច្ចុប្បន្ន' })}
                          </p>
                          <p className="photo-attached-meta">
                            {photoFile
                              ? `${t({ en: 'Cropped to 16:9', km: 'កាត់ជា ១៦:៩' })} • ${(photoFile.size / 1024).toFixed(0)} KB`
                              : t({ en: 'Saved with this entry', km: 'រក្សាទុកជាមួយធាតុនេះ' })}
                          </p>
                          <div className="photo-attached-actions">
                            {originalPhotoFile && (
                              <button type="button" className="modal-share" onClick={handleRecrop}>
                                <ThemeVibeIcon motif="crown" size={12} />
                                <span>{t({ en: 'Crop & adjust', km: 'កាត់ និងកែតម្រូវ' })}</span>
                              </button>
                            )}
                            <button
                              type="button"
                              className="modal-share photo-attached-remove"
                              onClick={handleRemovePhoto}
                            >
                              <span>{t({ en: 'Remove', km: 'ដកចេញ' })}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {fieldErrors.photo && (
                      <p className="auth-field-error"><BilingualMessage en={fieldErrors.photo.en} km={fieldErrors.photo.km} /></p>
                    )}
                  </div>
                </div>

                {/* Repeated here because the button is where the contributor is
                    looking: the same message at the top of the form is
                    usually scrolled out of view when they press Submit. */}
                {formError && (
                  <div className="auth-error" style={{ marginBottom: '12px' }}>
                    <BilingualMessage en={formError.en} km={formError.km} />
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  className="auth-submit"
                  style={{ width: '100%', padding: '16px', fontSize: '15px', fontWeight: 700 }}
                  disabled={loading}
                >
                  {loading
                    ? t({ en: 'Uploading photo & saving entry…', km: 'កំពុងបញ្ចូលរូបថត និងរក្សាទុក…' })
                    : editId
                    ? t({ en: 'Save Changes', km: 'រក្សាទុកការកែប្រែ' })
                    : t({ en: 'Submit for Review', km: 'ដាក់ស្នើដើម្បីពិនិត្យ' })}
                </button>
              </form>

              {/* Sidebar with Live Preview & Guidelines */}
              <div className="sidebar-sticky">
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginBottom: '12px' }}>
                    {t({ en: 'Live Entry Card Preview', km: 'មើលកាតធាតុជាមុន' })}
                  </h4>
                  <EntryPreviewCard
                    title={title}
                    titleKm={titleKm}
                    category={category}
                    description={description}
                    contributor={contributor}
                    place={place}
                    photoPreviewUrl={photoPreviewUrl}
                  />
                </div>

                <div className="guidelines-box">
                  <h4 className="guidelines-title">
                    <span>💡</span>
                    <span>{t({ en: 'Archive Contribution Tips', km: 'គន្លឹះសម្រាប់ការរួមចំណែក' })}</span>
                  </h4>
                  <ul className="guidelines-list">
                    <li>{t({ en: 'Write real cultural rules passed down from elders or community members.', km: 'សរសេរក្បួនច្បាប់វប្បធម៌ពិតៗ ដែលបន្តពីចាស់ទុំ ឬសមាជិកសហគមន៍។' })}</li>
                    <li>{t({ en: 'Both English and Khmer titles are required for searchability.', km: 'ត្រូវការចំណងជើងទាំងភាសាអង់គ្លេស និងខ្មែរ ដើម្បីងាយស្រួលស្វែងរក។' })}</li>
                    <li>{t({ en: 'Upload photos that clearly depict the cultural context or region.', km: 'បញ្ចូលរូបថតដែលបង្ហាញបរិបទវប្បធម៌ ឬតំបន់បានច្បាស់។' })}</li>
                    <li>{t({ en: 'Avoid test text like "asdf": every entry is checked by a reviewer before it goes public.', km: 'ជៀសវាងអត្ថបទសាកល្បងដូចជា "asdf"៖ រាល់ធាតុត្រូវបានពិនិត្យដោយអ្នកពិនិត្យ មុននឹងផ្សព្វផ្សាយ។' })}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {cropSource && (
        <ImageCropper
          file={cropSource}
          initialAdjustment={photoAdjustment}
          onCancel={handleCropCancel}
          onApply={handleCropApply}
        />
      )}
    </div>
  );
}
