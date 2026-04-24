import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Portfolio | LaunchPixel - AI Automation & Web Development Projects",
  description: "Explore LaunchPixel's portfolio of successful AI automation projects, web applications, and digital solutions. See how we've helped businesses transform with technology.",
  keywords: "portfolio, web development projects, AI applications, case studies, client work, LaunchPixel projects, digital solutions, business automation examples",
  openGraph: {
    title: "Portfolio | LaunchPixel - Our Best Work",
    description: "Discover our portfolio of AI-powered applications and digital solutions",
    type: "website",
  },
}

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
