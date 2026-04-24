import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog | LaunchPixel - AI Automation, Web Development & Business Insights",
  description: "Expert insights on AI automation, web development, SEO, and digital transformation. Learn practical strategies to reduce costs, improve performance, and future-proof your business with LaunchPixel.",
  keywords: "AI automation, web development, business automation, SEO optimization, AI agents, RPA, minimalist design, customer experience automation, ROI measurement, AI governance, launchpixel, launch pixel",
  openGraph: {
    title: "LaunchPixel Blog - AI Automation & Web Development Insights",
    description: "Practical guides on AI automation, web design, SEO, and business transformation",
    type: "website",
    url: "https://launchpixel.com/blogs",
  },
  alternates: {
    canonical: "https://launchpixel.com/blogs",
  },
}

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
