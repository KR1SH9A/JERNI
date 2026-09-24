import React from 'react';

const TONES = {
  teal: ["programming", "data", "sql", "coding", "learning", "tech", "science", "language"],
  sage: ["gardening", "nature", "hobby", "outdoors", "food", "cooking", "home"],
  mar: ["productivity", "career", "business", "finance"],
  rose: ["creative", "art", "music", "wellness", "health", "fitness", "design"]
} as const;

export const toneFor = (tags: string[]) =>
  tags.map(t => (Object.keys(TONES) as (keyof typeof TONES)[]).find(k => (TONES[k] as readonly string[]).includes(t.toLowerCase()))).find(Boolean) ?? "lav";

const STOP = new Set(["a", "an", "the", "to", "of", "and", "for", "in", "with"]);

export const glyphFor = (title: string) => {
  const words = title.split(/\s+/).filter(w => !STOP.has(w.toLowerCase()));
  const word = words.pop() ?? title;
  return word[0]?.toUpperCase() ?? "J";
};

interface JourneyCoverProps {
  title: string;
  tags?: string[];
  imageUrl?: string | null;
  className?: string;
  style?: React.CSSProperties;
}

export function JourneyCover({ title, tags = [], imageUrl, className = '', style = {} }: JourneyCoverProps) {
  // If there is an image, we render it (per the media_uploads requirement)
  if (imageUrl) {
    return (
      <div 
        className={`journey-cover image-cover ${className}`}
        style={{
          ...style,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
    );
  }

  const tone = toneFor(tags);
  const glyph = glyphFor(title);

  return (
    <div 
      className={`journey-cover generated-cover ${className}`}
      style={{
        ...style,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 'var(--s2, 8px)',
        padding: 'var(--s2, 8px)',
        background: 'var(--surface, #1a1524)',
        position: 'relative'
      }}
    >
      {/* Top Left: Pill */}
      <div style={{ background: `var(--cv-${tone}-a)`, borderRadius: '999px' }} />
      {/* Top Right: Tile */}
      <div style={{ background: `var(--cv-${tone}-b)`, borderRadius: 'var(--r3, 24px)' }} />
      {/* Bottom Left: Tile */}
      <div style={{ background: `var(--cv-${tone}-b)`, borderRadius: 'var(--r3, 24px)' }} />
      {/* Bottom Right: Pill */}
      <div style={{ background: `var(--cv-${tone}-a)`, borderRadius: '999px' }} />

      {/* Glyph Overlay */}
      <div 
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--cream, #fdf1e4)',
          fontFamily: 'var(--font-fraunces)',
          fontSize: '4rem',
          fontWeight: 300,
          mixBlendMode: 'overlay', // To make it blend into the tessellation nicely, optional but spec says cream
          opacity: 0.9,
          pointerEvents: 'none'
        }}
      >
        {glyph}
      </div>
    </div>
  );
}
