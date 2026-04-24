import type { Metadata } from "next"
import { Inter, Azeret_Mono as Geist_Mono } from "next/font/google"
import "./globals.css"
import React from "react"
import PersistentBackground from "../components/PersistentBackground"
import GlobalLoader from "../components/GlobalLoader"
import FloatingButtons from "../components/FloatingButtons"
import CustomCursor from "../components/CustomCursor"
import NoiseOverlay from "../components/NoiseOverlay"

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://launchpixel.com'),
  title: {
    default: "LaunchPixel | AI Automation & Digital Solutions Company",
    template: "%s | LaunchPixel"
  },
  description: "LaunchPixel is a leading AI automation company specializing in web development, AI applications, brand strategy, and digital transformation. Transform your business with cutting-edge technology solutions.",
  keywords: [
    "AI automation",
    "LaunchPixel",
    "Launch Pixel",
    "web development",
    "AI applications",
    "digital transformation",
    "business automation",
    "AI technology",
    "machine learning",
    "software development",
    "brand strategy",
    "UI UX design",
    "SEO services",
    "digital solutions",
    "AI company",
    "technology consulting",
    "business growth",
    "online presence",
    "digital marketing",
    "LLM optimization",
    "artificial intelligence",
    "chatbot development",
    "custom software",
    "mobile app development",
    "e-commerce solutions",
    "cloud solutions",
    "data analytics",
    "API development",
    "progressive web apps",
    "responsive design",
    "digital agency",
    "tech startup",
    "innovation",
    "automation solutions",
    "business intelligence",
    "digital strategy",
    "website design",
    "app development",
    "AI consulting",
    "technology partner"
  ],
  authors: [{ name: "LaunchPixel Team" }],
  creator: "LaunchPixel",
  publisher: "LaunchPixel",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://launchpixel.com',
    siteName: 'LaunchPixel',
    title: 'LaunchPixel | AI Automation & Digital Solutions',
    description: 'Transform your business with AI-powered automation and cutting-edge digital solutions',
    images: [
      {
        url: '/logo.gif',
        width: 1200,
        height: 630,
        alt: 'LaunchPixel - AI Automation Company',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LaunchPixel | AI Automation & Digital Solutions',
    description: 'Transform your business with AI-powered automation and high-end digital solutions by LaunchPixel.',
    images: ['/logo.gif'],
  },
  verification: {
    google: 'G-XXXXXXXXXX', // Note: Replace with actual Google Search Console Tag
  },
  alternates: {
    canonical: 'https://launchpixel.com',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'LaunchPixel',
  image: 'https://launchpixel.com/logo.gif',
  description: 'LaunchPixel is a premier AI automation and web development agency specializing in elite digital solutions.',
  url: 'https://launchpixel.com',
  telephone: '+1 (555) 000-0000',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Remote',
    addressCountry: 'Global'
  },
  priceRange: '$$$',
  sameAs: [
    'https://twitter.com/launchpixel',
    'https://linkedin.com/company/launchpixel'
  ]
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="theme-color" content="#6366f1" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CustomCursor />
        <NoiseOverlay />
        <GlobalLoader>
          <PersistentBackground />
          <div className="relative z-10">
            {children}
          </div>
          <FloatingButtons />
        </GlobalLoader>
      </body>
    </html>
  )
}


