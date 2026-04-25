import type { Metadata } from "next"
import { Inter, Azeret_Mono as Geist_Mono, Outfit } from "next/font/google"
import "./globals.css"
import React from "react"
import PersistentBackground from "../components/PersistentBackground"
import GlobalLoader from "../components/GlobalLoader"
import FloatingButtons from "../components/FloatingButtons"
import ClickSpark from "../components/ClickSpark"
import NoiseOverlay from "../components/NoiseOverlay"
import { ThemeProvider } from "../components/theme-provider"

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
})

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL('https://launchpixel.com'),
  title: {
    default: "LaunchPixel | AI Outbound Sales Calling Automation",
    template: "%s | LaunchPixel"
  },
  description: "Automate your entire sales floor with AI voice agents. LaunchPixel delivers scalable 80%+ efficiency outbound and inbound calling automation, replacing the overhead of human lead management while maximizing conversion flow.",
  keywords: [
    "Launch Pixel",
    "LaunchPixel",
    "Launch Pixel AI Agent",
    "AI automation company",
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
    "Autonomous AI Agents",
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
  authors: [{ name: "Launch Pixel Team" }],
  creator: "Launch Pixel",
  publisher: "Launch Pixel",
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
    url: 'https://launchpixel.in',
    siteName: 'Launch Pixel',
    title: 'Launch Pixel | AI Automation & Digital Solutions',
    description: 'Transform your business with AI-powered automation, autonomous AI Agents, and high-end digital solutions by Launch Pixel.',
    images: [
      {
        url: '/logo.gif',
        width: 1200,
        height: 630,
        alt: 'Launch Pixel - AI Automation Company',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Launch Pixel | AI Automation & Digital Solutions',
    description: 'Transform your business with AI-powered automation, custom AI Agents, and high-end digital solutions by Launch Pixel.',
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
  '@graph': [
    {
      '@type': 'LocalBusiness',
      '@id': 'https://launchpixel.in/#organization',
      'name': 'Launch Pixel',
      'alternateName': 'LaunchPixel',
      'image': 'https://launchpixel.in/logo.gif',
      'logo': 'https://launchpixel.in/logo.gif',
      'description': 'Launch Pixel (also known as LaunchPixel) is a premier AI automation and web development agency specializing in elite digital solutions, Autonomous AI Agents, and brand strategy.',
      'url': 'https://launchpixel.in',
      'telephone': '+91-80851-49514',
      'email': 'contact@launchpixel.in',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Remote',
        'addressCountry': 'IN'
      },
      'priceRange': '$$$',
      'sameAs': [
        'https://twitter.com/launchpixel',
        'https://linkedin.com/company/launchpixel'
      ]
    },
    {
      '@type': 'SoftwareApplication',
      'name': 'Launch Pixel AI Agent',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'Cloud',
      'author': {
        '@id': 'https://launchpixel.in/#organization'
      },
      'description': 'Autonomous AI Agents engineered by Launch Pixel to optimize business workflows, perform intelligent automation, and capture digital monopolies.'
    }
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
      <body className={`${outfit.variable} ${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-500`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="theme-main" themes={['theme-main', 'theme-alt']}>
          <NoiseOverlay />
          <GlobalLoader>
            <ClickSpark
              sparkColor="#ffffff"
              sparkSize={9}
              sparkRadius={20}
              sparkCount={9}
              duration={500}
            >
              <PersistentBackground />
              <div className="relative z-10">
                {children}
              </div>
              <FloatingButtons />
            </ClickSpark>
          </GlobalLoader>
        </ThemeProvider>
      </body>
    </html>
  )
}


