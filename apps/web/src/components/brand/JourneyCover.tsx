import React from 'react';

const TONES = {
  teal: ["programming", "data", "sql", "coding", "learning", "tech", "science", "language"],
  sage: ["gardening", "nature", "hobby", "outdoors", "food", "cooking", "home"],
  mar: ["productivity", "career", "business", "finance"],
  rose: ["creative", "art", "music", "wellness", "health", "fitness", "design"]
} as const;

type Tone = "lav" | "teal" | "sage" | "mar" | "rose";
const ALL_TONES: Tone[] = ["lav", "teal", "sage", "mar", "rose"];

export const toneFor = (tags: string[] = [], title: string = ""): Tone => {
  const matched = tags
    .map(t => (Object.keys(TONES) as (keyof typeof TONES)[]).find(k => TONES[k].includes(t.toLowerCase() as never)))
    .find(Boolean);
  
  if (matched) return matched;
  
  const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return ALL_TONES[hash % ALL_TONES.length];
};



interface JourneyCoverProps {
  title: string;
  tags?: string[];
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function JourneyCover({ title, tags = [], className = "", style, children }: JourneyCoverProps) {
  const tone = toneFor(tags, title);

  return (
    <div 
      className={`journey-card-cover ${className}`}
      style={{
        ...style,
        "--a": `var(--cv-${tone}-a)`,
        "--b": `var(--cv-${tone}-b)`,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: "8px",
        padding: "8px",
        position: "relative",
        overflow: "hidden"
      } as React.CSSProperties}
    >
      <div style={{ backgroundColor: "var(--a)", borderRadius: "999px", width: "100%", height: "100%" }} />
      <div style={{ backgroundColor: "var(--b)", borderRadius: "24px", width: "100%", height: "100%" }} />
      <div style={{ backgroundColor: "var(--b)", borderRadius: "24px", width: "100%", height: "100%" }} />
      <div style={{ backgroundColor: "var(--a)", borderRadius: "999px", width: "100%", height: "100%" }} />
      {children}
    </div>
  );
}
