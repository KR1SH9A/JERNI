"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import type { CuratorJourneyCard } from "@jerni/shared-types";
import { JourneyCover } from "@/components/brand/JourneyCover";
import { CheckSquare, Users, Heart, ArrowRight, Clock, Sparkles } from 'lucide-react';

function JourneyCard({ journey }: { journey: any }) {

  return (
    <article className="journey-card" aria-label={journey.title}>
      {/* Cover */}
      <JourneyCover title={journey.title} tags={journey.tags} />

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
          <span className="journey-card-meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckSquare size={14} />
            {journey.taskCount} task{journey.taskCount !== 1 ? 's' : ''}
          </span>
          <span className="journey-card-meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Heart size={14} />
            {journey.likeCount}
          </span>
          {journey.memberCount !== undefined && (
            <span className="journey-card-meta-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Users size={14} />
              {journey.memberCount}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="journey-card-cta">
          <Link href={`/journeys/${journey.id}`}>
            <button
              id={`view-journey-${journey.id}`}
              style={{ width: '100%', fontSize: '0.825rem', padding: '0.55rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}
            >
              View journey <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function DiscoverClient({ initialJourneys, total }: { initialJourneys: any[], total?: number }) {
  const [sortMethod, setSortMethod] = useState<"newest" | "most_popular" | "most_joined">("newest");
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSort = (method: "newest" | "most_popular" | "most_joined") => {
    if (method === sortMethod) return;
    setSortMethod(method);
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
      {/* Page header — Swiss editorial style */}
      <div style={{ borderBottom: '1px solid var(--color-border-subtle)', padding: '3rem 0 2.5rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <p className="page-header-label">Browse</p>
            <h1 className="page-title">Discover Journeys</h1>
            <p className="page-subtitle">
              Curated learning paths crafted by the community.
              {(total || 0) > 0 && ` ${total} journeys available.`}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--color-surface-2)', padding: '0.25rem', borderRadius: '999px', border: '1px solid var(--color-border)', alignSelf: 'flex-end' }}>
            <button 
              onClick={() => handleSort('newest')} 
              style={{ padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: sortMethod === 'newest' ? 'var(--color-bg)' : 'transparent', color: sortMethod === 'newest' ? 'var(--color-text)' : 'var(--color-muted)', boxShadow: sortMethod === 'newest' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <Sparkles size={14} /> Newest
            </button>
            <button 
              onClick={() => handleSort('most_popular')} 
              style={{ padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: sortMethod === 'most_popular' ? 'var(--color-bg)' : 'transparent', color: sortMethod === 'most_popular' ? 'var(--color-text)' : 'var(--color-muted)', boxShadow: sortMethod === 'most_popular' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <Heart size={14} /> Popular
            </button>
            <button 
              onClick={() => handleSort('most_joined')} 
              style={{ padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: sortMethod === 'most_joined' ? 'var(--color-bg)' : 'transparent', color: sortMethod === 'most_joined' ? 'var(--color-text)' : 'var(--color-muted)', boxShadow: sortMethod === 'most_joined' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <Users size={14} /> Joined
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
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
          <div className="empty-state-icon" style={{ fontSize: '2rem', opacity: 0.5, marginBottom: '1rem' }}><Sparkles size={32} /></div>
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
      </div>
    </>
  );
}
