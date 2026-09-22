'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface JourneyStub {
  id: string;
  title: string;
  tags: string[];
}

/**
 * OnboardingModal — appears immediately after signup.
 *
 * Flow:
 *  1. User types interests → "Get recommendations" → Gemini returns 3–5 journeys
 *  2. User can join any of them then → "Explore all" → /discover
 *  3. "Skip" → /discover immediately (zero API calls)
 */
export function OnboardingModal() {
  const router = useRouter();
  const [step, setStep] = useState<'input' | 'results'>('input');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<JourneyStub[]>([]);

  async function handleGetRecommendations(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/onboarding/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests }),
      });

      if (res.ok) {
        const data = await res.json() as { journeys: JourneyStub[] };
        setRecommendations(data.journeys ?? []);
        setStep('results');
      } else {
        // On any failure, skip gracefully to discover
        router.push('/discover');
      }
    } catch {
      router.push('/discover');
    } finally {
      setLoading(false);
    }
  }

  async function handleSkip() {
    // Zero API calls on skip
    router.push('/discover');
  }

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-label="Onboarding">
      <div className="onboarding-modal">
        {step === 'input' ? (
          <>
            <p className="onboarding-step-label">Welcome to JERNI</p>
            <h2 className="onboarding-heading">
              What are you trying<br />to get better at?
            </h2>
            <p className="onboarding-sub">
              Tell us your interests and we&apos;ll find the perfect journeys to get you started.
              No pressure — you can explore on your own too.
            </p>

            <form onSubmit={handleGetRecommendations} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <textarea
                  id="onboarding-interests"
                  className="form-textarea"
                  placeholder="e.g. I want to improve my coding skills, build better habits, learn a new language…"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  rows={4}
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="onboarding-actions">
                <button
                  type="button"
                  className="onboarding-skip"
                  onClick={handleSkip}
                  id="onboarding-skip"
                >
                  Skip for now →
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading || !interests.trim()}
                  id="onboarding-submit"
                  style={{ minWidth: '180px' }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <span style={{
                        width: '13px', height: '13px', border: '2px solid rgba(5,19,26,0.3)',
                        borderTopColor: '#05131a', borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.6s linear infinite',
                      }} />
                      Finding journeys…
                    </span>
                  ) : 'Get recommendations'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <p className="onboarding-step-label">Recommended for you</p>
            <h2 className="onboarding-heading" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)' }}>
              Journeys matched to your interests
            </h2>

            {recommendations.length === 0 ? (
              <p className="onboarding-sub" style={{ marginTop: '1rem' }}>
                No specific matches found — explore all our available journeys below.
              </p>
            ) : (
              <div className="rec-grid">
                {recommendations.map((j) => (
                  <Link key={j.id} href={`/journeys/${j.id}`} style={{ textDecoration: 'none' }}>
                    <div className="rec-card" id={`rec-journey-${j.id}`}>
                      <span className="rec-card-dot" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="rec-card-title">{j.title}</p>
                        {j.tags.length > 0 && (
                          <p className="rec-card-tags">{j.tags.slice(0, 3).join(' · ')}</p>
                        )}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-muted-2)', flexShrink: 0 }}>View →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="onboarding-actions" style={{ marginTop: '2rem' }}>
              <button
                type="button"
                className="onboarding-skip"
                onClick={() => router.push('/discover')}
                id="onboarding-explore-all"
              >
                Explore all journeys →
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setStep('input')}
                id="onboarding-back"
              >
                ← Refine interests
              </button>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
