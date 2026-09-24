"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import type { CuratorJourneyCard } from "@jerni/shared-types";

import { JourneyCover } from "@/components/brand/JourneyCover";

function JourneyCard({ journey }: { journey: any }) {
  return (
    <Link href={`/journeys/${journey.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article 
        className="card" 
        aria-label={journey.title}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <JourneyCover 
          title={journey.title} 
          tags={journey.tags} 
          style={{ height: '150px' }} 
        />
        <div style={{ padding: 'var(--s4)', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {journey.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 'var(--s1)', flexWrap: 'wrap', marginBottom: 'var(--s3)' }}>
              {journey.tags.slice(0, 3).map((tag: string, i: number) => (
                <span key={`${tag}-${i}`} className="badge">{tag}</span>
              ))}
            </div>
          )}
          <h3 style={{ 
            fontFamily: 'var(--font-fraunces)', 
            fontSize: '1.5rem', 
            fontWeight: 400, 
            margin: '0 0 var(--s2) 0',
            color: 'var(--text)',
            lineHeight: 1.2
          }}>
            {journey.title}
          </h3>
          {journey.description && (
            <p style={{ 
              fontFamily: 'var(--font-ui)',
              fontSize: '1rem',
              color: 'var(--muted)',
              margin: '0 0 var(--s4) 0',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {journey.description}
            </p>
          )}
        </div>
        <div style={{ 
          marginTop: 'auto',
          borderTop: '1px solid var(--line)',
          padding: 'var(--s3) var(--s4)',
          display: 'flex',
          gap: 'var(--s4)',
          color: 'var(--muted)',
          fontSize: '0.875rem',
          fontFamily: 'var(--font-ui)',
          fontWeight: 600
        }}>
          <span>✦ {journey.taskCount} task{journey.taskCount !== 1 ? 's' : ''}</span>
          <span>♥ {journey.likeCount || 0}</span>
          {journey.memberCount !== undefined && (
            <span>◎ {journey.memberCount}</span>
          )}
        </div>
      </article>
    </Link>
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
