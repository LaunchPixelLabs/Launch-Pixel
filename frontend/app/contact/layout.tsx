import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us | LaunchPixel - Get in Touch for AI Automation Solutions",
  description: "Contact LaunchPixel for AI automation, web development, and digital transformation services. Get a free consultation and start your project today.",
  keywords: "contact LaunchPixel, AI automation consultation, web development inquiry, get quote, business automation contact, digital solutions inquiry, free consultation",
  openGraph: {
    title: "Contact Us | LaunchPixel",
    description: "Get in touch with LaunchPixel for AI automation and digital solutions",
    type: "website",
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
