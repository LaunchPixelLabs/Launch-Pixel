import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { blogs, getBlogBySlug } from "@/lib/blogs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return blogs.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const blog = getBlogBySlug(params.slug)
  if (!blog) return {}

  return {
    title: `${blog.title} | LaunchPixel Blog`,
    description: blog.description,
    keywords: blog.tags.join(", "),
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: "article",
      publishedTime: new Date(blog.date).toISOString(),
      authors: ["LaunchPixel Team"],
      tags: blog.tags,
    },
    alternates: {
      canonical: `https://launchpixel.com/blogs/${blog.slug}`,
    },
  }
}

export default function BlogDetailPage({ params }: PageProps) {
  const blog = getBlogBySlug(params.slug)
  if (!blog) return notFound()

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />
      <main className="pt-32 sm:pt-40">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <Link href="/blogs" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                ← Back to all articles
              </Link>
            </div>

            <article>
              <header className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                  {blog.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-gray-400 mb-6">
                  <span className="text-white text-sm font-medium">LaunchPixel Team</span>
                  <span>·</span>
                  <time dateTime={new Date(blog.date).toISOString()}>{blog.date}</time>
                  <span>·</span>
                  <span>{blog.readTime}</span>
                  <Badge variant="secondary" className="ml-2 bg-indigo-950/60 border border-indigo-900 text-indigo-300">
                    {blog.category}
                  </Badge>
                </div>
              </header>

              <Card className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 mb-8">
                <CardContent className="py-8 px-6">
                  <div className="prose prose-invert prose-lg max-w-none">
                    <div className="text-gray-300 leading-relaxed space-y-6">
                      {blog.content ? (
                        blog.content.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="text-gray-300 leading-relaxed text-lg">
                            {paragraph}
                          </p>
                        ))
                      ) : (
                        <p className="text-gray-300 leading-relaxed text-lg">
                          {blog.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-wrap gap-2 mb-8">
                <span className="text-gray-400 text-sm mr-2">Tags:</span>
                {blog.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Card className="bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border border-indigo-900/50">
                <CardContent className="py-6 px-6">
                  <h3 className="text-xl font-semibold text-white mb-2">Ready to transform your business?</h3>
                  <p className="text-gray-300 mb-4">
                    LaunchPixel delivers cutting-edge AI automation, web development, and digital solutions.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-block px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-500 hover:to-purple-500 transition-all"
                  >
                    Get Started
                  </Link>
                </CardContent>
              </Card>
            </article>
          </div>
        </div>
      </main>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": blog.title,
            "description": blog.description,
            "datePublished": new Date(blog.date).toISOString(),
            "author": {
              "@type": "Organization",
              "name": "LaunchPixel",
              "url": "https://launchpixel.com"
            },
            "publisher": {
              "@type": "Organization",
              "name": "LaunchPixel",
              "logo": {
                "@type": "ImageObject",
                "url": "https://launchpixel.com/logo.gif"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://launchpixel.com/blogs/${blog.slug}`
            },
            "keywords": blog.tags.join(", "),
            "articleSection": blog.category,
            "wordCount": blog.content?.split(' ').length || 0
          })
        }}
      />

      <Footer />
    </div>
  )
}



