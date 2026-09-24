'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface JourneyFormValues {
  title: string;
  description: string;
  tags: string;
  visibility: 'PUBLIC' | 'PRIVATE';
}

interface JourneyFormProps {
  /** If provided, the form operates in "edit" mode (PATCH). Otherwise creates. */
  journeyId?: string;
  initialValues?: Partial<JourneyFormValues>;
}

export function JourneyForm({ journeyId, initialValues }: JourneyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [values, setValues] = useState<JourneyFormValues>({
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
    tags: initialValues?.tags ?? '',
    visibility: initialValues?.visibility ?? 'PUBLIC',
  });

  const isEdit = Boolean(journeyId);

  function handleChange(field: keyof JourneyFormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      tags: values.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      visibility: values.visibility,
    };

    startTransition(async () => {
      try {
        let res: Response;
        if (isEdit) {
          res = await fetch(`/api/journeys/${journeyId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } else {
          res = await fetch('/api/journeys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }

        if (!res.ok) {
          if (res.status === 401) {
            setError('Your session has expired. Please sign in again to continue.');
            return;
          }
          const data = await res.json().catch(() => ({}));
          setError(data.message ?? 'Something went wrong. Please try again.');
          return;
        }

        const data = await res.json();
        router.push(`/journeys/${data.id ?? journeyId}`);
      } catch {
        setError('Network error. Please try again.');
      }
    });
  }

  const inputStyle = {
    width: '100%',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    border: '1px solid var(--color-border)',
    background: 'rgba(255,255,255,0.03)',
    color: 'var(--color-text)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s, background-color 0.2s',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--color-accent)';
    e.target.style.backgroundColor = 'rgba(255,255,255,0.05)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--color-border)';
    e.target.style.backgroundColor = 'rgba(255,255,255,0.03)';
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      {error && (
        <div className="form-error-banner">
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="journey-title" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>
          Title <span aria-hidden style={{ color: 'var(--error)' }}>*</span>
        </label>
        <input
          id="journey-title"
          type="text"
          required
          minLength={3}
          maxLength={120}
          placeholder="e.g. 30-Day Coding Challenge"
          value={values.title}
          onChange={(e) => handleChange('title', e.target.value)}
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="journey-description" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>Description</label>
        <textarea
          id="journey-description"
          rows={4}
          maxLength={1000}
          placeholder="What will participants learn or accomplish?"
          value={values.description}
          onChange={(e) => handleChange('description', e.target.value)}
          style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="journey-tags" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>
          Tags <span style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: 400 }}>(comma-separated)</span>
        </label>
        <input
          id="journey-tags"
          type="text"
          placeholder="e.g. coding, react, web-dev"
          value={values.tags}
          onChange={(e) => handleChange('tags', e.target.value)}
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="journey-visibility" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>Visibility</label>
        <select
          id="journey-visibility"
          value={values.visibility}
          onChange={(e) => handleChange('visibility', e.target.value as 'PUBLIC' | 'PRIVATE')}
          style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          <option value="PUBLIC">Public — anyone can find and join</option>
          <option value="PRIVATE">Private — invite-only (future)</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button
          type="submit"
          disabled={isPending || !values.title.trim()}
          style={{
            flex: 1,
            padding: '1rem',
            borderRadius: '999px',
            background: 'var(--color-accent)',
            color: 'var(--color-bg)',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: (isPending || !values.title.trim()) ? 'not-allowed' : 'pointer',
            opacity: (isPending || !values.title.trim()) ? 0.7 : 1,
            transition: 'opacity 0.2s, transform 0.1s',
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          id={isEdit ? 'save-journey-btn' : 'create-journey-btn'}
        >
          {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Journey'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            padding: '0 1.5rem',
            borderRadius: '999px',
            background: 'transparent',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          id="cancel-form-btn"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
