"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import type { CuratorJourneyCard } from "@jerni/shared-types";

function JourneyCard({ journey }: { journey: any }) {
  const hue = journey.title.charCodeAt(0) * 5;
  const hue2 = (journey.title.charCodeAt(1) || hue + 40) * 5;

  return (
    <article className="journey-card" aria-label={journey.title}>
      {/* Cover gradient */}
      <div
        className="journey-card-cover"
        style={{
          background: `linear-gradient(135deg, hsl(${hue},45%,14%) 0%, hsl(${hue2 % 360},35%,10%) 100%)`,
        }}
      >
        <span className="journey-card-cover-initials">
          {journey.title.slice(0, 2).toUpperCase()}
        </span>
        {/* Subtle grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.5) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.5) 20px)',
        }} />
      </div>

      <div className="journey-card-body">
        {/* Tags */}
        {journey.tags?.length > 0 && (
          <div className="journey-card-tags">
            {journey.tags.slice(0, 3).map((tag: string, i: number) => (
              <span key={`${tag}-${i}`} className="badge">{tag}</span>
            ))}
          </div>
        )}

        {/* Title */}
        <Link href={`/journeys/${journey.id}`} style={{ textDecoration: 'none' }}>
          <h2 className="journey-card-title">{journey.title}</h2>
        </Link>

        {/* Description */}
        {journey.description && (
          <p className="journey-card-desc">
            {journey.description.length > 90
              ? `${journey.description.slice(0, 90)}…`
              : journey.description}
          </p>
        )}

        {/* Meta */}
        <div className="journey-card-meta">
          <span className="journey-card-meta-item">
            <span>✦</span>
            {journey.taskCount} task{journey.taskCount !== 1 ? 's' : ''}
          </span>
          <span className="journey-card-meta-item">
            <span>♥</span>
            {journey.likeCount}
          </span>
          {journey.memberCount !== undefined && (
            <span className="journey-card-meta-item">
              <span>◎</span>
              {journey.memberCount}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="journey-card-cta">
          <Link href={`/journeys/${journey.id}`}>
            <button
              id={`view-journey-${journey.id}`}
              style={{ width: '100%', fontSize: '0.825rem', padding: '0.55rem 1rem' }}
            >
              View journey →
            </button>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function DiscoverClient({ initialJourneys }: { initialJourneys: any[] }) {
  const [sortMethod, setSortMethod] = useState<"newest" | "most_popular" | "most_joined">("newest");
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortMethod(e.target.value as any);
    setLoading(true);
    // Simulate instant sorting with graceful loader
    setTimeout(() => {
      setLoading(false);
    }, 400); // 400ms graceful loader
  };

  const sortedJourneys = useMemo(() => {
    const copy = [...initialJourneys];
    switch (sortMethod) {
      case "most_popular":
        return copy.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      case "most_joined":
        return copy.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
      case "newest":
      default:
        return copy.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
  }, [initialJourneys, sortMethod]);

  if (!isClient) return null;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem', alignItems: 'center' }}>
        <label htmlFor="sort" style={{ marginRight: '1rem', fontSize: '0.875rem', color: 'var(--color-muted)' }}>Sort by:</label>
        <select
          id="sort"
          value={sortMethod}
          onChange={handleSortChange}
          className="form-select"
          style={{ width: 'auto', padding: '0.4rem 2.5rem 0.4rem 1rem', fontSize: '0.875rem' }}
        >
          <option value="newest">Newest</option>
          <option value="most_popular">Most Popular</option>
          <option value="most_joined">Most Joined</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
          <div className="loader" style={{ 
            width: '40px', height: '40px', 
            border: '3px solid var(--color-surface-3)', 
            borderTopColor: 'var(--color-accent)', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }} />
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}} />
        </div>
      ) : sortedJourneys.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✦</div>
          <h2 className="empty-state-title">No journeys yet</h2>
          <p className="empty-state-desc">
            Be the first to create a journey and share your knowledge with the community.
          </p>
          <Link href="/dashboard">
            <button className="btn-primary" id="discover-create-btn">Create a journey</button>
          </Link>
        </div>
      ) : (
        <div className="journey-grid">
          {sortedJourneys.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} />
          ))}
        </div>
      )}
    </>
  );
}
