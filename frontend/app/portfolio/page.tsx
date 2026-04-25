"use client"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ExternalLink, X } from "lucide-react"
import Navigation from "../../components/Navigation"
import Footer from "../../components/Footer"
import dynamic from "next/dynamic"
import { useState } from "react"
import { motion } from "framer-motion"

const TiltedCard = dynamic(() => import('../../components/TiltedCard'), { ssr: false })
import SplitTextReveal from '../../components/SplitTextReveal'
import MagneticButton from '../../components/MagneticButton'

// Metadata moved to layout or handled differently for client components

const portfolioItems = [
  {
    title: "LaunchPixel.agent",
    displayName: "Launch Pixel AI Agent",
    type: "AI Product / Service",
    description: "Launch Pixel's proprietary, fully autonomous AI calling agent designed to revolutionize sales workflows, scale communication bandwidth, and close deals 24/7.",
    fullDescription: "Our flagship AI calling product. We didn't just wrap an LLM — we engineered an autonomous sales agent that makes real phone calls, handles objections, confirms bookings, and sends WhatsApp notifications to your team. Trained on your business docs and website. Powered by ElevenLabs voice synthesis.",
    image: "/lp-ai-agent.png",
    video: "/launch_hero.mp4",
    link: "/call",
    tags: ["Autonomous AI", "Sales Agent", "Voice AI", "Calling"],
    technologies: ["Cloudflare Workers", "ElevenLabs", "RAG", "Twilio", "WhatsApp API"],
    features: ["AI Sales Calls", "24/7 Availability", "Document Training", "Booking Confirmation", "WhatsApp Alerts"]
  },

  {
    title: "Akonomics.in",
    displayName: "Akonomics",
    type: "EdTech Platform",
    description: "Expert-led economics coaching platform with mobile app integration, empowering students with concept-driven learning and exam preparation.",
    fullDescription: "Akonomics is a premier economics education platform offering both physical classes in Delhi and a comprehensive mobile learning app. Designed for students preparing for competitive exams like CUET PG, IES, and RBI, it features expert-led video lessons, mock tests, and personalized mentorship. The platform bridges the gap between complex economic theories and practical understanding.",
    image: "/akonomics.webp",
    link: "https://akonomics.in",
    tags: ["EdTech", "Mobile App", "Education"],
    technologies: ["React", "Node.js", "Mobile App", "LMS", "Video Streaming"],
    features: ["Interactive Lessons", "Exam Prep", "Mentorship", "Mock Tests", "Offline Access"]
  },

  {
    title: "MadhavFabrication.in",
    displayName: "Madhav Fabrication",
    type: "E-commerce",
    description: "Modern e-commerce platform for women's clothing with seamless shopping experience, secure payments, and inventory management.",
    fullDescription: "Madhav Fabrication is a full-featured e-commerce platform specializing in women's clothing and fashion. The platform offers a seamless shopping experience with advanced filtering, secure payment integration, real-time inventory management, and order tracking. Built with performance and conversion optimization in mind.",
    image: "/madhavfabrications.webp",
    video: "/madhavfabrication.mp4",
    link: "https://madhavfabrication.in",
    tags: ["E-commerce", "Fashion", "Payment Integration"],
    technologies: ["Next.js", "Stripe", "MongoDB", "Redis", "Cloudinary"],
    features: ["Product Catalog", "Secure Payments", "Order Tracking", "Inventory Management", "Wishlist"]
  },
  {
    title: "VibeCast.in",
    displayName: "VibeCast Innovations",
    type: "B2B Platform",
    description: "Corporate website for VibeCast Innovations PVT LTD, specializing in digital signage solutions with dynamic content management.",
    fullDescription: "VibeCast Innovations is a B2B platform for digital signage solutions. The platform enables businesses to manage and display dynamic content across multiple screens and locations. Features include content scheduling, real-time updates, analytics dashboard, and multi-location management.",
    image: "/vibecast.webp",
    video: "/vibecast.mp4",
    link: "https://vibecast.in",
    tags: ["B2B", "Digital Signage", "Corporate"],
    technologies: ["React", "Node.js", "WebSocket", "PostgreSQL", "AWS S3"],
    features: ["Content Management", "Multi-location Support", "Real-time Updates", "Analytics", "Scheduling"]
  },
  {
    title: "VaranasionWheels.com",
    displayName: "Varanasi on Wheels",
    type: "Tours & Travel",
    description: "Comprehensive tours and travel agency platform with booking system, tour packages, and customer management for Varanasi tourism.",
    fullDescription: "Varanasi on Wheels is a complete tours and travel management platform for exploring Varanasi. The platform offers customizable tour packages, online booking, payment processing, itinerary management, and customer reviews. Integrated with Google Maps for real-time location tracking.",
    image: "/varanasionwheels.webp",
    video: "/varanasionwheels.mp4",
    link: "https://varanasionwheels.com",
    tags: ["Travel", "Booking System", "Tourism"],
    technologies: ["Next.js", "Stripe", "Google Maps API", "MongoDB", "Twilio"],
    features: ["Tour Packages", "Online Booking", "Payment Gateway", "Itinerary Builder", "Customer Reviews"]
  },
  {
    title: "Prajapatiagroexim.com",
    displayName: "Prajapati Agro Exim",
    type: "Agriculture Export",
    description: "Trusted agriculture manufacturing and trading export company specializing in the bulk supply of high-quality agricultural products.",
    fullDescription: "Prajapati Agro Exim is a leading agriculture export company trusted for delivering high-quality commodities worldwide. Specializing in bulk supply of corn, rice, onions, and chickpeas, they ensure direct sourcing from reliable farms. The platform facilitates international trade with a focus on trust and excellence.",
    image: "/prajapatiagro.webp",
    link: "https://prajapatiagroexim.com",
    tags: ["Agriculture", "Export", "B2B"],
    technologies: ["Next.js", "React", "TailwindCSS", "Multi-language", "SEO"],
    features: ["Product Catalog", "Bulk Ordering", "Export Compliance", "Farm-to-Table", "Inquiry System"]
  },
  {
    title: "Mornova.in",
    displayName: "Mornova",
    type: "Health & Wellness",
    description: "Premium Moringa-based superfood products store promoting holistic health and wellness through nature's most potent ingredients.",
    fullDescription: "Mornova is a dedicated health and wellness brand bringing the benefits of Moringa to daily life. The platform offers a curated selection of premium Moringa products, including herbal sips and pure powders. With a focus on purity and sustainability, Mornova provides scientifically proven health solutions driven by nature.",
    image: "/mornova.webp",
    link: "https://mornova.in",
    tags: ["Health", "E-commerce", "Wellness"],
    technologies: ["Next.js", "React", "TailwindCSS", "Payment Gateway", "SEO"],
    features: ["Product Catalog", "Health Education", "Secure Checkout", "Mobile Responsive", "Wellness Blog"],
    imageStyle: { objectPosition: 'left center' }
  },
  {
    title: "SunilBookStore.store",
    displayName: "Sunil Book Store",
    type: "Portfolio Website",
    description: "Digital presence for Sunil Book Store, expanding their reach to wider audiences with online catalog and contact features.",
    fullDescription: "Sunil Book Store's digital platform showcases their extensive book collection and services. The website features an online catalog, search functionality, book recommendations, and easy contact options. Optimized for local SEO to attract nearby customers.",
    image: "/sunilbookstore.webp",
    link: "https://sunilbookstore.store",
    tags: ["Portfolio", "Local Business", "SEO"],
    technologies: ["Next.js", "TailwindCSS", "Vercel", "Google Analytics"],
    features: ["Book Catalog", "Search", "Contact Form", "Local SEO", "Mobile Responsive"]
  },

  {
    title: "VivekSharma.space",
    displayName: "Vivek Sharma",
    type: "Interactive Resume",
    description: "An interactive resume with a retro pixel-art gaming aesthetic, featuring animated characters, parallax scrolling, and a unique exploratory experience.",
    fullDescription: "VivekSharma.space is a one-of-a-kind interactive resume built with a retro pixel-art gaming aesthetic. The experience features animated characters, parallax scrolling, and stylized environments that guide visitors through skills, experience, and accomplishments. Users can explore the resume like a side-scrolling game, making it a memorable and engaging portfolio piece.",
    image: "/viveksharma.webp",
    link: "https://viveksharma.space",
    tags: ["Interactive", "Portfolio", "Animation", "Gaming"],
    technologies: ["HTML5", "CSS3", "JavaScript", "Canvas API", "Parallax"],
    features: ["Pixel Art Design", "Interactive Navigation", "Parallax Scrolling", "Animated Characters", "Responsive Layout"]
  },
  {
    title: "Vielorine.com",
    displayName: "Vielorine",
    type: "Spiritual & Tarot Platform",
    description: "Mystical tarot readings & spiritual guidance platform featuring blog system, e-commerce shop, appointment booking, and immersive Tree of Life animation.",
    fullDescription: "Vielorine is a premium spiritual guidance platform offering personalized tarot readings and mystical wisdom. The website features an immersive Tree of Life scroll animation, a curated blog system with spiritual articles, an e-commerce shop for spiritual accessories, and a contact system for booking readings. Designed with earthy aesthetics and smooth animations for a mystical user experience.",
    image: "/vielorine.webp",
    link: "https://vielorine.com",
    tags: ["Spiritual", "E-commerce", "Blog", "Animation"],
    technologies: ["Next.js", "TypeScript", "TailwindCSS", "GSAP", "Cloudflare Pages"],
    features: ["Tarot Readings", "Blog System", "E-commerce Shop", "Booking System", "Tree of Life Animation"],
    imageStyle: { objectPosition: 'left center' }
  },
  {
    title: "sharansmusicacademy.com",
    displayName: "Sharans Music Academy",
    type: "Music Academy",
    description: "Music academy management platform with student enrollment, class scheduling, and online booking capabilities.",
    fullDescription: "Sharans Music Academy platform manages music education with features for student enrollment, class scheduling, instrument tracking, practice logs, and performance recordings. Includes parent portal for progress monitoring and online fee payment.",
    image: "/sharansmusicacademy.webp",
    link: "https://sharansmusicacademy.com",
    tags: ["Music", "Education", "Management"],
    technologies: ["Next.js", "MongoDB", "Stripe", "AWS S3", "Socket.io"],
    features: ["Student Enrollment", "Class Scheduling", "Practice Logs", "Recordings", "Fee Management"]
  },
]

export default function PortfolioPage() {
  const [selectedProject, setSelectedProject] = useState<typeof portfolioItems[0] | null>(null)

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      {/* Background is globally handled by PersistentBackground in layout.tsx */}
      
      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-36 md:pt-40 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 sm:mb-6 font-display">
              <SplitTextReveal mode="words" as="span" stagger={0.05} duration={1}>
                Our Digital Arsenal
              </SplitTextReveal>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto px-4 font-light text-balance leading-relaxed">
              Explore our successful combat records across AI automation, high-end web development, and digital transformation. Real systems for real dominance.
            </p>
          </div>

          {/* Portfolio Grid */}
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
          >
            {portfolioItems.map((item, index) => (
              <motion.div
                key={index}
                className="cursor-pointer"
                variants={{
                  hidden: { opacity: 0, y: 50, scale: 0.95 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { type: "spring", stiffness: 100, damping: 20 }
                  }
                }}
                whileHover={{ scale: 1.02, zIndex: 10 }}
              >
                <TiltedCard
                  imageSrc={item.image}
                  altText={item.displayName}
                  captionText={item.displayName}
                  containerHeight="280px"
                  containerWidth="100%"
                  imageHeight="280px"
                  imageWidth="100%"
                  scaleOnHover={1.05}
                  rotateAmplitude={12}
                  showMobileWarning={false}
                  showTooltip={true}
                  // @ts-ignore
                  imageStyle={item.imageStyle}
                  onClick={() => setSelectedProject(item)}
                />
              </motion.div>
            ))}
          </motion.div>



          <div className="text-center mt-20 mb-10">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 font-display text-balance">Ready to forge your own monopoly?</h3>
            <MagneticButton strength={0.4}>
              <Link
                href="/contact"
                className="btn-gradient inline-flex items-center gap-2 rounded-full font-medium"
              >
                Let's Work Together
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Launch Pixel Portfolio",
            "description": "Portfolio of AI automation, Autonomous AI Agents, and high-end web development projects engineered by Launch Pixel.",
            "provider": {
              "@type": "Organization",
              "name": "Launch Pixel"
            }
          })
        }}
      />

      {/* Modal Popup */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-[calc(100%-1.5rem)] sm:max-w-xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-gray-800/80 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
            >
              <X size={16} />
            </button>

            {/* Project Image/Video */}
            <div className="relative h-40 sm:h-56 overflow-hidden">
              {selectedProject.video ? (
                <video
                  src={selectedProject.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={selectedProject.image}
                  alt={selectedProject.displayName}
                  width={800}
                  height={400}
                  className="w-full h-full object-cover"
                  // @ts-ignore
                  style={(selectedProject as any).imageStyle}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
            </div>

            {/* Project Details */}
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white truncate">{selectedProject.displayName}</h2>
                  <p className="text-xs sm:text-sm text-indigo-400">{selectedProject.type}</p>
                </div>
                {selectedProject.link && (
                  <a
                    href={selectedProject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-full hover:from-indigo-500 hover:to-indigo-400 transition-all duration-300 flex items-center gap-1.5 text-xs sm:text-sm flex-shrink-0"
                  >
                    Visit
                    <ExternalLink size={12} className="sm:w-3.5 sm:h-3.5" />
                  </a>
                )}
              </div>

              <p className="text-gray-400 text-xs sm:text-sm mb-4 line-clamp-3">{selectedProject.description}</p>

              {/* Technologies */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {selectedProject.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs bg-gray-800 text-gray-300 rounded-full border border-gray-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
