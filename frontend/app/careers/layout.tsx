import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Careers | LaunchPixel - Join Our Team",
  description: "Join LaunchPixel. We are looking for passionate interns to join our fully remote team and gain real-world experience.",
  keywords: "careers, internship, remote work, LaunchPixel careers, MERN stack intern, SEO intern, Lead Gen intern",
  openGraph: {
    title: "Careers | LaunchPixel",
    description: "Join our team and build the future with LaunchPixel",
    type: "website",
  },
}

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
