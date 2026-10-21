import Image from "next/image";

/**
 * The logo in both theme variants. The plain logo has a light grey "my" that
 * only reads on dark backgrounds; CSS shows the variant that fits the theme.
 */
export function Logo({ alt, width, height, priority, className = "" }: { alt: string; width: number; height: number; priority?: boolean; className?: string }) {
  return (
    <>
      <Image src="/images/logo-light.png" alt={alt} width={width} height={height} priority={priority} className={`logo-on-light ${className}`} />
      <Image src="/images/logo.png" alt={alt} width={width} height={height} priority={priority} className={`logo-on-dark ${className}`} />
    </>
  );
}
