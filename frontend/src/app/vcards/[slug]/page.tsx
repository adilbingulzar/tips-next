import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { BusinessCard } from "@/components/vcards/BusinessCard";
import { getVcard } from "@/lib/public";

export async function generateMetadata({ params }: PageProps<"/vcards/[slug]">): Promise<Metadata> {
  const card = await getVcard((await params).slug);
  if (!card) {
    return { title: "Business card" };
  }
  const subtitle = [card.business.title, card.business.name].filter(Boolean).join(" · ");
  return {
    title: card.name,
    description: subtitle || `${card.name}'s business card`,
    openGraph: { title: card.name, description: subtitle || undefined, images: card.avatar ? [card.avatar] : undefined },
  };
}

/** /vcards/{slug}: the digital business card (same address as in the old app). */
export default function Page({ params }: PageProps<"/vcards/[slug]">) {
  return (
    <Suspense fallback={<div data-theme="light" className="min-h-dvh animate-pulse bg-stone-900" aria-busy="true" />}>
      <Card params={params} />
    </Suspense>
  );
}

async function Card({ params }: { params: Promise<{ slug: string }> }) {
  const card = await getVcard((await params).slug);
  if (!card) {
    notFound();
  }
  return <BusinessCard card={card} />;
}
