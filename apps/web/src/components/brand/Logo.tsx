import Image from "next/image";

export default function Logo({ height = 48 }: { height?: number }) {
  return (
    <Image 
      src="/brand/new-logo.svg" 
      alt="JERNI" 
      width={(height * 844.5) / 545.25} 
      height={height} 
      priority
    />
  );
}
