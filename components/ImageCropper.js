'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Entry photos are displayed in a fixed 16:9 frame on cards and in the detail
// modal, so the crop is baked in at that ratio: what the contributor frames
// here is exactly what every reader sees, with no surprise cropping later.
const OUTPUT_WIDTH = 1600;
const OUTPUT_HEIGHT = 900;
const ASPECT = OUTPUT_WIDTH / OUTPUT_HEIGHT;

// As a fraction of image width. Stops the box collapsing to nothing and keeps
// the exported 1600px wide frame from being upscaled past recognition.
const MIN_CROP_WIDTH = 0.15;

const HANDLES = ['nw', 'ne', 'se', 'sw'];

// JPEG cannot carry transparency, so anything that might have an alpha channel
// is written as WebP instead of being flattened onto an arbitrary colour.
function outputTypeFor(sourceType) {
  return sourceType === 'image/jpeg'
    ? { mime: 'image/jpeg', ext: 'jpg' }
    : { mime: 'image/webp', ext: 'webp' };
}

function baseName(filename) {
  const dot = filename.lastIndexOf('.');
  const stem = dot > 0 ? filename.slice(0, dot) : filename;
  return stem.slice(0, 60) || 'photo';
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Rotation is baked into pixels rather than tracked as an angle, so the crop
// selection is always a plain axis-aligned rectangle on the source.
function rotateCanvas(source, degrees) {
  const deg = ((degrees % 360) + 360) % 360;
  if (deg === 0) return source;
  const quarterTurn = deg % 180 !== 0;
  const canvas = document.createElement('canvas');
  canvas.width = quarterTurn ? source.height : source.width;
  canvas.height = quarterTurn ? source.width : source.height;
  const ctx = canvas.getContext('2d');
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((deg * Math.PI) / 180);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);
  return canvas;
}

// The largest 16:9 box that fits the image, centred — the default selection
// and what Reset returns to.
function defaultCrop(imageWidth, imageHeight) {
  const widthIfFull = Math.min(imageWidth, imageHeight * ASPECT);
  const w = widthIfFull / imageWidth;
  const h = widthIfFull / ASPECT / imageHeight;
  return { x: (1 - w) / 2, y: (1 - h) / 2, w };
}

function RotateLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 5v5h5" />
      <path d="M3.5 10a8 8 0 1 1 .9 6.5" />
    </svg>
  );
}

function RotateRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 5v5h-5" />
      <path d="M20.5 10a8 8 0 1 0-.9 6.5" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 1 3 6.7" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

export default function ImageCropper({ file, initialAdjustment = null, onCancel, onApply }) {
  const imageRef = useRef(null);
  const stageRef = useRef(null);
  // Holds the image with any rotation already baked in, so cropping never has
  // to reason about angles — the selection maps straight onto these pixels.
  const sourceCanvasRef = useRef(null);
  const dragRef = useRef(null);

  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceSize, setSourceSize] = useState(null); // { width, height }
  const [imageBox, setImageBox] = useState(null); // displayed rect within stage
  const [crop, setCrop] = useState(null); // { x, y, w } as fractions of source
  // Tracked alongside the baked pixels so reopening the cropper can restore
  // the adjustment instead of starting over from the raw upload.
  const [rotation, setRotation] = useState(initialAdjustment?.rotation || 0);
  const [activeDrag, setActiveDrag] = useState('');
  const [working, setWorking] = useState(false);
  const [loadError, setLoadError] = useState('');

  const cropHeight = useCallback(
    (widthFraction) => {
      if (!sourceSize) return 0;
      return (widthFraction * sourceSize.width) / ASPECT / sourceSize.height;
    },
    [sourceSize]
  );

  // Publishes a canvas as the thing the <img> shows, replacing whatever was
  // there. One object URL is alive at a time.
  const publishSource = useCallback((canvas) => {
    sourceCanvasRef.current = canvas;
    canvas.toBlob((blob) => {
      if (!blob) {
        setLoadError('That image could not be read. Try a different file.');
        return;
      }
      const url = URL.createObjectURL(blob);
      // The old measurement describes the pre-rotation letterbox; keeping it
      // would place the selection box wrong for a frame.
      setImageBox(null);
      setSourceUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setSourceSize({ width: canvas.width, height: canvas.height });
      // WebP keeps this preview blob small on large uploads. The export reads
      // from the canvas itself, so this compression never reaches the output.
    }, 'image/webp', 0.92);
  }, []);

  // Decode the upload once into a canvas; everything after works from it.
  useEffect(() => {
    if (!file) return undefined;
    let cancelled = false;
    const fileUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      if (cancelled) return;
      if (!img.naturalWidth || !img.naturalHeight) {
        setLoadError('That image could not be read. Try a different file.');
        return;
      }
      const decoded = document.createElement('canvas');
      decoded.width = img.naturalWidth;
      decoded.height = img.naturalHeight;
      decoded.getContext('2d').drawImage(img, 0, 0);

      // Reopening re-reads the untouched upload so quality never compounds,
      // then replays the saved adjustment on top of it.
      const canvas = rotateCanvas(decoded, initialAdjustment?.rotation || 0);
      publishSource(canvas);
      setCrop(initialAdjustment?.crop || defaultCrop(canvas.width, canvas.height));
      URL.revokeObjectURL(fileUrl);
    };
    img.onerror = () => {
      if (!cancelled) setLoadError('That image could not be read. Try a different file.');
      URL.revokeObjectURL(fileUrl);
    };
    img.src = fileUrl;

    return () => {
      cancelled = true;
    };
    // The adjustment is a starting point captured on open, not a live input:
    // re-running this on every change would fight the user's edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, publishSource]);

  useEffect(
    () => () => {
      setSourceUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return '';
      });
    },
    []
  );

  // The image is letterboxed inside the stage, so the overlay needs its real
  // on-screen rect rather than the stage's.
  const measure = useCallback(() => {
    const img = imageRef.current;
    const stage = stageRef.current;
    if (!img || !stage || !img.clientWidth) return;
    const imgRect = img.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    setImageBox({
      left: imgRect.left - stageRect.left,
      top: imgRect.top - stageRect.top,
      width: imgRect.width,
      height: imgRect.height,
    });
  }, []);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (imageRef.current) observer.observe(imageRef.current);
    if (stageRef.current) observer.observe(stageRef.current);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure, sourceUrl]);

  const rotate = (direction) => {
    const source = sourceCanvasRef.current;
    if (!source) return;
    const step = direction === 'left' ? -90 : 90;
    const canvas = rotateCanvas(source, step);
    publishSource(canvas);
    setRotation((prev) => (((prev + step) % 360) + 360) % 360);
    // The old selection means nothing against swapped axes.
    setCrop(defaultCrop(canvas.width, canvas.height));
  };

  // Reset returns the selection to the default box but keeps the rotation,
  // which is a correction to the photo rather than a framing choice.
  const reset = () => {
    if (sourceSize) setCrop(defaultCrop(sourceSize.width, sourceSize.height));
  };

  const beginDrag = (mode) => (e) => {
    if (!crop || !imageBox) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      mode,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origin: crop,
    };
    setActiveDrag(mode);
  };

  const onDragMove = (e) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId || !imageBox || !sourceSize) return;

    // Pointer travel is in screen pixels; the crop lives in image fractions.
    const dx = (e.clientX - drag.startX) / imageBox.width;
    const dy = (e.clientY - drag.startY) / imageBox.height;
    const origin = drag.origin;
    const originH = cropHeight(origin.w);

    if (drag.mode === 'move') {
      setCrop({
        x: clamp(origin.x + dx, 0, 1 - origin.w),
        y: clamp(origin.y + dy, 0, 1 - originH),
        w: origin.w,
      });
      return;
    }

    // Resizing pins the opposite corner and drives width from the pointer, so
    // the 16:9 ratio is never up to the user to maintain.
    const right = origin.x + origin.w;
    const bottom = origin.y + originH;
    const pullsLeft = drag.mode === 'nw' || drag.mode === 'sw';
    const pullsUp = drag.mode === 'nw' || drag.mode === 'ne';

    let width = pullsLeft ? origin.w - dx : origin.w + dx;

    // Cap at whatever still fits between the pinned corner and the edges.
    const maxWidth = pullsLeft ? right : 1 - origin.x;
    const maxHeightAsWidth =
      ((pullsUp ? bottom : 1 - origin.y) * sourceSize.height * ASPECT) / sourceSize.width;
    width = clamp(width, MIN_CROP_WIDTH, Math.min(maxWidth, maxHeightAsWidth));

    const height = cropHeight(width);
    setCrop({
      x: pullsLeft ? right - width : origin.x,
      y: pullsUp ? bottom - height : origin.y,
      w: width,
    });
  };

  const endDrag = (e) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setActiveDrag('');
  };

  // Arrow keys nudge the selection so a crop can be set without a pointer.
  const onBoxKeyDown = (e) => {
    if (!crop || !sourceSize) return;
    const step = e.shiftKey ? 0.05 : 0.01;
    const nudges = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    const nudge = nudges[e.key];
    if (!nudge) return;
    e.preventDefault();
    const h = cropHeight(crop.w);
    setCrop({
      x: clamp(crop.x + nudge.x, 0, 1 - crop.w),
      y: clamp(crop.y + nudge.y, 0, 1 - h),
      w: crop.w,
    });
  };

  useEffect(() => {
    const onEscape = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [onCancel]);

  const apply = async () => {
    const source = sourceCanvasRef.current;
    if (!source || !crop || !sourceSize) return;
    setWorking(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_WIDTH;
      canvas.height = OUTPUT_HEIGHT;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';

      const { mime, ext } = outputTypeFor(file.type);
      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
      }

      // Rotation is already in the source pixels, so the selection is a plain
      // axis-aligned rectangle on it.
      const sx = crop.x * sourceSize.width;
      const sy = crop.y * sourceSize.height;
      const sw = crop.w * sourceSize.width;
      const sh = sw / ASPECT;
      ctx.drawImage(source, sx, sy, sw, sh, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, 0.9));
      if (!blob) {
        setLoadError('Could not process the crop. Try a smaller image.');
        return;
      }

      onApply(
        new File([blob], `${baseName(file.name)}-cropped.${ext}`, {
          type: mime,
          lastModified: Date.now(),
        }),
        { rotation, crop }
      );
    } catch (err) {
      console.error('Crop failed:', err);
      setLoadError('Could not process the crop. Try a different image.');
    } finally {
      setWorking(false);
    }
  };

  // Selection rectangle in stage pixels.
  const boxStyle =
    crop && imageBox
      ? {
          left: `${imageBox.left + crop.x * imageBox.width}px`,
          top: `${imageBox.top + crop.y * imageBox.height}px`,
          width: `${crop.w * imageBox.width}px`,
          height: `${cropHeight(crop.w) * imageBox.height}px`,
        }
      : { display: 'none' };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Crop and adjust photo"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="cropper-panel">
        <div className="cropper-header">
          <div>
            <h3 className="cropper-title">Crop &amp; Adjust</h3>
            <p className="cropper-subtitle">កែតម្រូវរូបថត • Framed at 16:9 for the archive</p>
          </div>
          <div className="cropper-tools">
            <button type="button" className="cropper-tool" onClick={() => rotate('left')} title="Rotate left" aria-label="Rotate left">
              <RotateLeftIcon />
            </button>
            <button type="button" className="cropper-tool" onClick={() => rotate('right')} title="Rotate right" aria-label="Rotate right">
              <RotateRightIcon />
            </button>
            <button type="button" className="cropper-tool" onClick={reset} title="Reset crop" aria-label="Reset crop">
              <ResetIcon />
            </button>
            <button type="button" className="modal-close" onClick={onCancel} aria-label="Cancel crop">
              ✕
            </button>
          </div>
        </div>

        <div ref={stageRef} className="cropper-stage">
          {sourceUrl && (
            <img
              ref={imageRef}
              src={sourceUrl}
              alt=""
              draggable={false}
              onLoad={measure}
              className="cropper-image"
            />
          )}

          {crop && imageBox && (
            <div
              className={`cropper-box ${activeDrag ? 'is-active' : ''}`}
              style={boxStyle}
              tabIndex={0}
              role="application"
              aria-label="Crop selection: drag to move, corner handles to resize, arrow keys to nudge"
              onPointerDown={beginDrag('move')}
              onPointerMove={onDragMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onKeyDown={onBoxKeyDown}
            >
              <div className="cropper-box-grid" aria-hidden="true" />
              {HANDLES.map((handle) => (
                <span
                  key={handle}
                  className={`cropper-handle cropper-handle-${handle}`}
                  onPointerDown={beginDrag(handle)}
                  onPointerMove={onDragMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                />
              ))}
            </div>
          )}
        </div>

        {loadError && <p className="auth-field-error cropper-error">{loadError}</p>}

        <p className="cropper-hint">
          Drag the box to move it • drag a corner to resize • arrow keys nudge
        </p>

        <div className="cropper-actions">
          <button type="button" className="cropper-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="auth-submit cropper-apply"
            onClick={apply}
            disabled={!crop || working}
          >
            {working ? 'Processing…' : 'Apply Crop / យល់ព្រម'}
          </button>
        </div>
      </div>
    </div>
  );
}
