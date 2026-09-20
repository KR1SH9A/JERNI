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
        router.refresh();
      } catch {
        setError('Network error. Please try again.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {error && (
        <div className="form-error-banner">
          {error}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="journey-title">Title <span aria-hidden>*</span></label>
        <input
          id="journey-title"
          type="text"
          required
          minLength={3}
          maxLength={120}
          placeholder="e.g. 30-Day Coding Challenge"
          value={values.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="journey-description">Description</label>
        <textarea
          id="journey-description"
          rows={4}
          maxLength={1000}
          placeholder="What will participants learn or accomplish?"
          value={values.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="journey-tags">
          Tags <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>(comma-separated)</span>
        </label>
        <input
          id="journey-tags"
          type="text"
          placeholder="e.g. coding, react, web-dev"
          value={values.tags}
          onChange={(e) => handleChange('tags', e.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="journey-visibility">Visibility</label>
        <select
          id="journey-visibility"
          value={values.visibility}
          onChange={(e) => handleChange('visibility', e.target.value as 'PUBLIC' | 'PRIVATE')}
        >
          <option value="PUBLIC">Public — anyone can find and join</option>
          <option value="PRIVATE">Private — invite-only (future)</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button
          type="submit"
          className="btn-primary"
          disabled={isPending || !values.title.trim()}
          style={{ flex: 1 }}
          id={isEdit ? 'save-journey-btn' : 'create-journey-btn'}
        >
          {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Journey'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          style={{ padding: '0 1.25rem' }}
          id="cancel-form-btn"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
