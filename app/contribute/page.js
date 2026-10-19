'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SiteNav from '../../components/SiteNav';
import ThemeAtmosphereBackdrop from '../../components/ThemeAtmosphereBackdrop';
import { useTheme } from '../../components/ThemeProvider';
import { ThemeVibeIcon } from '../../components/KbachMotifs';
import EntryPreviewCard from '../../components/EntryPreviewCard';
import { createClient } from '../../lib/supabase/client';

const CATEGORY_OPTIONS = [
  { value: 'beliefs', labelEn: 'Belief', labelKm: 'ជំនឿ', motif: 'lantern' },
  { value: 'taboos', labelEn: 'Taboo', labelKm: 'ការហាមប្រាម', motif: 'moon' },
  { value: 'etiquette', labelEn: 'Etiquette', labelKm: 'សុជីវធម៌', motif: 'crown' },
];

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5242880; // 5 MB

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

  // Status & errors
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingEdit, setFetchingEdit] = useState(false);

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
          if (isMounted) setFormError('Could not load entry for editing.');
          return;
        }

        // Security check: must be owner to edit
        if (data.owner !== user.id) {
          console.error('Unauthorized edit attempt: user is not owner');
          if (isMounted) setFormError("You don't have permission to edit this entry.");
          return;
        }

        if (isMounted) {
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

  const handlePhotoSelect = (file) => {
    setPhotoFile(file);
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setPhotoPreviewUrl(tempUrl);
    } else {
      setPhotoPreviewUrl(existingPhotoUrl);
    }
  };

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
            setPhotoFile(file);
            const tempUrl = URL.createObjectURL(file);
            setPhotoPreviewUrl(tempUrl);
            setFieldErrors((prev) => ({ ...prev, photo: '' }));
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
      const file = e.dataTransfer.files[0];
      handlePhotoSelect(file);
      setFieldErrors((prev) => ({ ...prev, photo: '' }));
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
      errors.title = 'English title is required.';
    } else if (trimmedTitle.length < 3 || trimmedTitle.length > 150) {
      errors.title = 'Title must be between 3 and 150 characters.';
    }

    if (!trimmedTitleKm) {
      errors.titleKm = 'Khmer title (ចំណងជើងភាសាខ្មែរ) is required.';
    } else if (trimmedTitleKm.length < 2 || trimmedTitleKm.length > 150) {
      errors.titleKm = 'Khmer title must be between 2 and 150 characters.';
    }

    if (!category) {
      errors.category = 'Please select a category.';
    }

    if (!trimmedDesc) {
      errors.description = 'Description is required.';
    } else if (trimmedDesc.length < 10) {
      errors.description = 'Description must be at least 10 characters long.';
    } else if (trimmedDesc.length > 1000) {
      errors.description = 'Description must not exceed 1000 characters.';
    }

    if (trimmedReason.length > 1000) {
      errors.reason = 'Practical origin must not exceed 1000 characters.';
    }

    if (trimmedContributor.length > 100) {
      errors.contributor = 'Contributor name must not exceed 100 characters.';
    }

    if (trimmedPlace.length > 100) {
      errors.place = 'Place must not exceed 100 characters.';
    }

    if (trimmedStillBelieved.length > 200) {
      errors.stillBelieved = 'Still believed status must not exceed 200 characters.';
    }

    // Photo is optional: validate only if a file is provided
    if (photoFile) {
      if (!ALLOWED_MIME_TYPES.includes(photoFile.type)) {
        errors.photo = 'Only JPEG, PNG, and WebP images are allowed.';
      } else if (photoFile.size > MAX_FILE_SIZE) {
        errors.photo = 'Photo file size must not exceed 5 MB.';
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (!user) {
      setFormError('You must be logged in to contribute.');
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
          console.error('Storage upload failed:', uploadError);
          setFormError('Failed to upload photo. Please check the image format and size (max 5MB).');
          setLoading(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath);

        photoUrl = publicUrlData?.publicUrl || photoUrl;
      }

      // Prepare explicit insert/update payload (never spreading form data)
      const payload = {
        owner: user.id,
        title: title.trim(),
        title_km: titleKm.trim(),
        category,
        description: description.trim(),
        reason: reason.trim() || null,
        still_believed: stillBelieved.trim() || null,
        place: place.trim() || null,
        contributor: contributor.trim() || null,
        photo_url: photoUrl || null,
        status: 'published',
      };

      if (editId) {
        const { data, error } = await supabase
          .from('entries')
          .update(payload)
          .eq('id', editId)
          .eq('owner', user.id)
          .select();

        if (error || !data || data.length === 0) {
          console.error('Update refused or failed:', error);
          setFormError("That change wasn't saved.");
          setLoading(false);
          return;
        }

        router.push(`/browse?entry=${data[0].id}`);
        router.refresh();
      } else {
        const { data, error } = await supabase
          .from('entries')
          .insert(payload)
          .select();

        if (error || !data || data.length === 0) {
          console.error('Insert refused or failed:', error);
          setFormError('Failed to save entry. Please try again.');
          setLoading(false);
          return;
        }

        router.push(`/browse?entry=${data[0].id}`);
        router.refresh();
      }
    } catch (err) {
      console.error('Unexpected error during submission:', err);
      setFormError('An unexpected error occurred while saving.');
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
            <p>Loading session...</p>
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
              <h1 className="auth-title">ចូលប្រើប្រាស់គណនី</h1>
              <div className="auth-title-sub">Contributor Authentication Required</div>
              <p className="auth-description" style={{ margin: '16px 0 24px' }}>
                Only logged-in contributors can submit entries to the archive. Please sign in to share cultural knowledge.
              </p>
              <Link href="/login" className="auth-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Sign In to Contribute / ចូលគណនី
              </Link>
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
              <span>Back to Browse Archive (ត្រឡប់ទៅប័ណ្ណសារ)</span>
            </Link>
            <div className="contribute-title-wrapper">
              <ThemeVibeIcon motif={category} size={28} />
              <h1 className="contribute-title">
                {editId ? 'កែប្រែទិន្នន័យ / Edit Entry' : 'បន្ថែមចំណេះដឹងវប្បធម៌ / Contribute Entry'}
              </h1>
            </div>
            <p className="contribute-subtitle">
              Document oral traditions, elder teachings, and ancient rules for preservation in the Khmer Living Archive.
            </p>
          </div>

          {formError && <div className="auth-error" style={{ marginBottom: '24px' }}>{formError}</div>}

          {fetchingEdit ? (
            <div className="contribute-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p>Loading entry details...</p>
            </div>
          ) : (
            <div className="contribute-grid">
              {/* Form main column */}
              <form onSubmit={handleSubmit} noValidate>

                {/* Section 1: Classification & Titles */}
                <div className="contribute-card">
                  <h3 className="contribute-section-title">
                    <ThemeVibeIcon motif="lantern" size={16} />
                    <span>1. Category & Titles (ប្រភេទ និងចំណងជើង)</span>
                  </h3>

                  {/* Category Pill Buttons */}
                  <div className="auth-field">
                    <label className="auth-label">
                      <span>Category <span className="auth-required">*</span></span>
                      <span className="auth-label-km">ប្រភេទ</span>
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
                          <span>{opt.labelEn} ({opt.labelKm})</span>
                        </button>
                      ))}
                    </div>
                    {fieldErrors.category && (
                      <p className="auth-field-error">{fieldErrors.category}</p>
                    )}
                  </div>

                  {/* 2-column Titles Grid */}
                  <div className="contribute-row-2col" style={{ marginTop: '16px' }}>
                    <div className="auth-field" style={{ marginBottom: 0 }}>
                      <label className="auth-label" htmlFor="entry-title-km">
                        <span>Khmer Title <span className="auth-required">*</span></span>
                        <span className="auth-label-km">ចំណងជើងភាសាខ្មែរ</span>
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
                        <p className="auth-field-error">{fieldErrors.titleKm}</p>
                      )}
                    </div>

                    <div className="auth-field" style={{ marginBottom: 0 }}>
                      <label className="auth-label" htmlFor="entry-title">
                        <span>English Title <span className="auth-required">*</span></span>
                        <span className="auth-label-km">ចំណងជើងជាភាសាអង់គ្លេស</span>
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
                        <p className="auth-field-error">{fieldErrors.title}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: Cultural Knowledge & Details */}
                <div className="contribute-card">
                  <h3 className="contribute-section-title">
                    <ThemeVibeIcon motif="beliefs" size={16} />
                    <span>2. Cultural Significance (ខ្លឹមសារ និងប្រភពដើម)</span>
                  </h3>

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="entry-description">
                      <span>Stated Traditional Belief <span className="auth-required">*</span></span>
                      <span className="auth-label-km">ការរៀបរាប់ពីជំនឿ ឬការហាមប្រាម</span>
                    </label>
                    <textarea
                      id="entry-description"
                      maxLength={1000}
                      className={`auth-input ${fieldErrors.description ? 'has-error' : ''}`}
                      rows={4}
                      placeholder="Describe what elders taught, what happens according to the belief, or how people react..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    <span className={`char-counter ${description.length >= 950 ? 'is-near-limit' : ''}`}>
                      {description.length} / 1000
                    </span>
                    {fieldErrors.description && (
                      <p className="auth-field-error">{fieldErrors.description}</p>
                    )}
                  </div>

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="entry-reason">
                      <span>Practical Origin / Rational Reason</span>
                      <span className="auth-label-km">ប្រភពដើម និងហេតុផលជាក់ស្តែង</span>
                    </label>
                    <textarea
                      id="entry-reason"
                      maxLength={1000}
                      className="auth-input"
                      rows={3}
                      placeholder="Why did elders pass this rule down? What practical danger or lesson does it serve?"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <span className={`char-counter ${reason.length >= 950 ? 'is-near-limit' : ''}`}>
                      {reason.length} / 1000
                    </span>
                    {fieldErrors.reason && (
                      <p className="auth-field-error">{fieldErrors.reason}</p>
                    )}
                  </div>

                  <div className="contribute-row-2col">
                    <div className="auth-field">
                      <label className="auth-label" htmlFor="entry-contributor">
                        <span>Contributor / Source Credit</span>
                        <span className="auth-label-km">អ្នកផ្តល់ព័ត៌មាន / ប្រភពដើម</span>
                      </label>
                      <input
                        id="entry-contributor"
                        type="text"
                        maxLength={100}
                        className="auth-input"
                        placeholder="e.g. Heng Vicheka, Grandmother Som, Parents"
                        value={contributor}
                        onChange={(e) => setContributor(e.target.value)}
                      />
                      <span className={`char-counter ${contributor.length >= 90 ? 'is-near-limit' : ''}`}>
                        {contributor.length} / 100
                      </span>
                    </div>

                    <div className="auth-field">
                      <label className="auth-label" htmlFor="entry-place">
                        <span>Place / Province</span>
                        <span className="auth-label-km">ខេត្ត / ទីកន្លែង</span>
                      </label>
                      <input
                        id="entry-place"
                        type="text"
                        maxLength={100}
                        className="auth-input"
                        placeholder="e.g. Kampong Cham, Siem Reap"
                        value={place}
                        onChange={(e) => setPlace(e.target.value)}
                      />
                      <span className={`char-counter ${place.length >= 90 ? 'is-near-limit' : ''}`}>
                        {place.length} / 100
                      </span>
                    </div>
                  </div>

                  <div className="auth-field" style={{ marginBottom: 0 }}>
                    <label className="auth-label" htmlFor="entry-still-believed">
                      <span>Still Believed Today?</span>
                      <span className="auth-label-km">តើនៅតែជឿរហូតមកដល់សព្វថ្ងៃ?</span>
                    </label>
                    <input
                      id="entry-still-believed"
                      type="text"
                      maxLength={200}
                      className="auth-input"
                      placeholder="e.g. Yes, elders still observe this."
                      value={stillBelieved}
                      onChange={(e) => setStillBelieved(e.target.value)}
                    />
                    <span className={`char-counter ${stillBelieved.length >= 180 ? 'is-near-limit' : ''}`}>
                      {stillBelieved.length} / 200
                    </span>
                  </div>
                </div>

                {/* Section 3: Photo Upload */}
                <div className="contribute-card">
                  <h3 className="contribute-section-title">
                    <ThemeVibeIcon motif="crown" size={16} />
                    <span>3. Photo & Media (រូបថត)</span>
                  </h3>

                  <div className="auth-field" style={{ marginBottom: 0 }}>
                    <label className="auth-label">
                      <span>
                        Photo Upload <span style={{ fontSize: '11px', color: 'var(--ink-muted)', fontWeight: 400 }}>(Optional / ជម្រើសបន្ថែម)</span>
                      </span>
                      <span className="auth-label-km">រូបថត (JPG, PNG, WebP, max 5MB)</span>
                    </label>

                    <label
                      htmlFor="entry-photo"
                      className="photo-dropzone"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                    >
                      <ThemeVibeIcon motif="moon" size={24} />
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>
                        {photoFile ? photoFile.name : 'Click to select, drag & drop, or press Ctrl+V to paste image from clipboard'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>
                        Allowed: JPG, PNG, WebP • Max 5 MB • Clipboard paste (Ctrl+V) enabled
                      </div>
                      <input
                        id="entry-photo"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }}
                        onChange={(e) => handlePhotoSelect(e.target.files[0] || null)}
                      />
                    </label>
                    {fieldErrors.photo && (
                      <p className="auth-field-error">{fieldErrors.photo}</p>
                    )}
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="auth-submit"
                  style={{ width: '100%', padding: '16px', fontSize: '15px', fontWeight: 700 }}
                  disabled={loading}
                >
                  {loading
                    ? 'Uploading Photo & Saving Entry...'
                    : editId
                    ? 'Save Changes / រក្សាទុកការកែប្រែ'
                    : 'Publish Entry to Archive / បញ្ចូលទិន្នន័យ'}
                </button>
              </form>

              {/* Sidebar with Live Preview & Guidelines */}
              <div className="sidebar-sticky">
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginBottom: '12px' }}>
                    Live Entry Card Preview
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
                    <span>Archive Contribution Tips</span>
                  </h4>
                  <ul className="guidelines-list">
                    <li>Write real cultural rules passed down from elders or community members.</li>
                    <li>Both English and Khmer titles are required for searchability.</li>
                    <li>Upload photos that clearly depict the cultural context or region.</li>
                    <li>Avoid test text like &quot;asdf&quot;—entries are published directly to the public archive.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
