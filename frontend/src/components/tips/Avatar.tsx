/**
 * Profile photo, or the old app's grey placeholder photo when there is none.
 * The name is kept for callers that show it next to the photo.
 */
export function Avatar({ src }: { name: string; src: string | null }) {
  // eslint-disable-next-line @next/next/no-img-element -- photos come from the API or the old app's domain
  return <img src={src ?? "/images/user-image.jpg"} alt="" width={96} height={96} className="tip-avatar bg-stone-200" />;
}
