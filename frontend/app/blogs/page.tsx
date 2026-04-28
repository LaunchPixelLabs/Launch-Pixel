"use client"

import Link from "next/link";
import { blogs } from "@/lib/blogs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import { ArrowRight, Calendar, Clock, Sparkles } from "lucide-react";

// Dynamically import heavy components
import SplitTextReveal from "@/components/SplitTextReveal";
import MagneticButton from "@/components/MagneticButton";

const SpotlightCard = dynamic(() => import('@/components/SpotlightCard'), { ssr: false });

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-transparent font-sans selection:bg-indigo-500/30">
      <Navigation />

      <main className="relative z-10 pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">

          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-2 backdrop-blur-md">
              <Sparkles size={14} />
              <span>LaunchPixel Insights</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight font-display mb-6">
              <SplitTextReveal mode="words" as="span" stagger={0.05} duration={1}>
                Intelligence & Insights.
              </SplitTextReveal>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 font-light leading-relaxed text-balance">
              Expert perspectives on AI automation, modern web architecture, and the future of digital business transformation.
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
          <div className="mt-24 text-center flex flex-col items-center">
            <p className="text-gray-500 text-sm mb-6">Want to stay updated?</p>
            <MagneticButton strength={0.2} className="inline-block">
              <Link
                href="/contact"
                className="btn-ghost inline-flex items-center gap-2 font-medium"
              >
                Subscribe to Operations Intel <ArrowRight size={16} />
              </Link>
            </MagneticButton>
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
            "name": "Launch Pixel Insights",
            "description": "Expert insights on AI automation, web development, SEO, and digital monopolies engineered by Launch Pixel.",
            "url": "https://launchpixel.in/blogs",
            "publisher": {
              "@type": "Organization",
              "name": "Launch Pixel",
              "logo": {
                "@type": "ImageObject",
                "url": "https://launchpixel.in/logo.gif"
              }
            },
            "blogPost": blogs.map((blog) => ({
              "@type": "BlogPosting",
              "headline": blog.title,
              "description": blog.description,
              "datePublished": blog.date,
              "author": {
                "@type": "Organization",
                "name": "Launch Pixel Team"
              },
              "url": `https://launchpixel.in/blogs/${blog.slug}`
            }))
          })
        }}
      />

      <Footer />
    </div>
  );
}