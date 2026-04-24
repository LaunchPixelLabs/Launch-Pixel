import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Star, Quote } from "lucide-react"
import Navigation from "../../components/Navigation"
import Footer from "../../components/Footer"
import dynamic from "next/dynamic"

const Antigravity = dynamic(() => import('../../components/Antigravity'), { ssr: false })

export const metadata: Metadata = {
  title: "Client Testimonials | LaunchPixel - AI Automation Success Stories",
  description: "Read what our clients say about LaunchPixel's AI automation and web development services. Real testimonials from businesses we've helped transform.",
  keywords: "client testimonials, customer reviews, LaunchPixel reviews, AI automation success stories, web development testimonials, client feedback",
  openGraph: {
    title: "Client Testimonials | LaunchPixel",
    description: "See what our clients say about working with LaunchPixel",
    type: "website",
  },
}

const testimonials = [

  {
    name: "Aryan Gupta",
    role: "CEO, VibeCast Innovations",
    image: "/Aryan.webp",
    rating: 5,
    text: "Working with LaunchPixel was a game-changer for our business. They delivered a professional, scalable solution that perfectly represents our brand."
  },
  {
    name: "Shivanshu Mishra",
    role: "Director, Madhav Fabrication",
    image: "/Shivanshu.webp",
    rating: 5,
    text: "The e-commerce platform LaunchPixel built for us has significantly increased our online sales. Their attention to detail and user experience is exceptional."
  }
]

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      {/* Antigravity Background */}
      <div className="fixed inset-0 z-0">
        <Antigravity
          count={300}
          magnetRadius={15}
          ringRadius={12}
          waveSpeed={0.5}
          waveAmplitude={1.2}
          particleSize={1.2}
          lerpSpeed={0.05}
          color="#5227FF"
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

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-36 md:pt-40 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
              <span className="block text-white">Client</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-[length:200%_auto] animate-gradient-flow">Testimonials</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">
              Don't just take our word for it. Here's what our clients have to say about working with LaunchPixel.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 relative"
              >
                <Quote className="absolute top-6 right-6 w-8 h-8 text-indigo-400/20" />

                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{testimonial.name}</h3>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-indigo-400 text-indigo-400" />
                  ))}
                </div>

                <p className="text-gray-300 relative z-10">{testimonial.text}</p>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
            <div className="text-center p-6 bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
                50+
              </div>
              <div className="text-gray-400 text-sm">Happy Clients</div>
            </div>
            <div className="text-center p-6 bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
                100+
              </div>
              <div className="text-gray-400 text-sm">Projects Delivered</div>
            </div>
            <div className="text-center p-6 bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
                98%
              </div>
              <div className="text-gray-400 text-sm">Client Satisfaction</div>
            </div>
            <div className="text-center p-6 bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
                5★
              </div>
              <div className="text-gray-400 text-sm">Average Rating</div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Ready to Join Our Success Stories?</h2>
            <p className="text-sm sm:text-base text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Let's create something amazing together. Contact us today to discuss your project.
            </p>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-full hover:from-indigo-500 hover:to-indigo-400 transition-all duration-300 text-sm sm:text-base"
            >
              Start Your Project
            </Link>
          </div>
        </div>
      </section>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "LaunchPixel",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5",
              "reviewCount": "50"
            }
          })
        }}
      />

      <Footer />
    </div>
  )
}
