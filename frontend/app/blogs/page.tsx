"use client"

import Link from "next/link";
import { blogs } from "@/lib/blogs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import { ArrowRight, Calendar, Clock, Sparkles } from "lucide-react";

// Dynamically import heavy components
const Antigravity = dynamic(() => import('@/components/Antigravity'), { ssr: false });
const SpotlightCard = dynamic(() => import('@/components/SpotlightCard'), { ssr: false });

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-gray-950 font-sans selection:bg-indigo-500/30">
      <Navigation />

      {/* Background Effect */}
      <div className="fixed inset-0 z-0">
        <Antigravity
          count={300} // Slightly reduced for performance on content-heavy pages
          magnetRadius={15}
          ringRadius={12}
          waveSpeed={0.5}
          waveAmplitude={1.2}
          particleSize={1.2}
          lerpSpeed={0.05}
          color="#5227FF" // Primary Brand Color
          autoAnimate
          particleVariance={1}
          rotationSpeed={0}
          depthFactor={1}
          pulseSpeed={3}
          particleShape="box"
          fieldStrength={10}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-gray-950/80 to-gray-950 pointer-events-none" />
      </div>

      <main className="relative z-10 pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">

          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-2 backdrop-blur-md">
              <Sparkles size={14} />
              <span>LaunchPixel Insights</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              <span className="block text-white">Navigating the</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-[length:200%_auto] animate-gradient-flow">Digital Frontier</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
              Expert perspectives on AI automation, modern web architecture, <br className="hidden sm:block" /> and the future of digital business transformation.
            </p>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {blogs.map((blog, index) => (
              <div key={blog.id} className="h-full">
                <SpotlightCard
                  className="h-full flex flex-col bg-gray-900/40 border-white/5 p-6 hover:border-indigo-500/30 transition-all duration-500 group"
                  spotlightColor="rgba(99, 102, 241, 0.15)"
                  borderColor="rgba(255, 255, 255, 0.1)"
                >
                  {/* Category Badge */}
                  <div className="mb-6 flex justify-between items-start">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-white/5 text-gray-300 border border-white/10 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 group-hover:border-indigo-500/30 transition-colors duration-300">
                      {blog.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-tight group-hover:text-indigo-400 transition-colors duration-300">
                    <Link href={`/blogs/${blog.slug}`} className="focus:outline-none">
                      <span className="absolute inset-0 z-20" aria-hidden="true" />
                      {blog.title}
                    </Link>
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 line-clamp-3 mb-6 flex-grow leading-relaxed">
                    {blog.description}
                  </p>

                  {/* Footer / Meta */}
                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>{new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{blog.readTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-indigo-400 group-hover:translate-x-1 transition-transform duration-300">
                      <span className="font-medium text-xs uppercase tracking-wider">Read</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </SpotlightCard>
              </div>
            ))}
          </div>

          {/* Newsletter / CTA (Optional Enhancement) */}
          <div className="mt-24 text-center">
            <p className="text-gray-500 text-sm mb-4">Want to stay updated?</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 hover:border-white/20 transition-all duration-300 text-sm font-medium"
            >
              Subscribe to Newsletter <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </main>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "LaunchPixel Insights",
            "description": "Expert insights on AI automation, web development, SEO, and digital transformation",
            "url": "https://launchpixel.com/blogs",
            "publisher": {
              "@type": "Organization",
              "name": "LaunchPixel",
              "logo": {
                "@type": "ImageObject",
                "url": "https://launchpixel.com/logo.gif"
              }
            },
            "blogPost": blogs.map((blog) => ({
              "@type": "BlogPosting",
              "headline": blog.title,
              "description": blog.description,
              "datePublished": blog.date,
              "author": {
                "@type": "Organization",
                "name": "LaunchPixel Team"
              },
              "url": `https://launchpixel.com/blogs/${blog.slug}`
            }))
          })
        }}
      />

      <Footer />
    </div>
  );
}