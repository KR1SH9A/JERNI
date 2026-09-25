import Image from 'next/image';

interface LogoProps {
  height?: number;
  className?: string;
}

export function Logo({ height = 48, className = "" }: LogoProps) {
  // Original aspect ratio is 844.5 : 545.25 ≈ 1.5488
  const width = height * 1.5488;
  return (
    <Image 
      src="/brand/new-logo.svg" 
      alt="JERNI" 
      width={width} 
      height={height} 
      className={className}
      priority
    />
  );
}
