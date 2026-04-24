import React from 'react'
import { INTERNSHIPS, INTERNSHIP_SLUGS } from "../../../lib/careers"
import ApplyPageClient from "./ApplyPageClient"

export function generateStaticParams() {
  return INTERNSHIP_SLUGS.map((slug) => ({
    slug,
  }))
}

export default function ApplyPage({ params }: { params: { slug: string } }) {
  const slug = params.slug
  const roleData = INTERNSHIPS.find((i) => i.id === slug)

  // Redirect to /careers if slug is invalid
  if (!roleData) {
    return null
  }

  return <ApplyPageClient slug={slug} />
}
