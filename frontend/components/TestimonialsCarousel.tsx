"use client"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Star, Quote } from "lucide-react"

interface Testimonial {
  name: string
  role: string
  company: string
  image: string
  rating: number
  text: string
}

const testimonials: Testimonial[] = [

  {
    name: "Aryan Gupta",
    role: "CEO",
    company: "VibeCast Innovations",
    image: "/Aryan.webp",
    rating: 5,
    text: "Working with LaunchPixel was a game-changer. They delivered a professional, scalable solution perfectly."
  },
  {
    name: "Shivanshu Mishra",
    role: "Director",
    company: "Madhav Fabrication",
    image: "/Shivanshu.webp",
    rating: 5,
    text: "The e-commerce platform has significantly increased our online sales. Exceptional attention to detail."
  },

  {
    name: "Priya Sharma",
    role: "Operations Manager",
    company: "Varanasi on Wheels",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    text: "Our tour booking system has streamlined operations completely. Robust and reliable platform."
  },
  {
    name: "Sunil Verma",
    role: "Owner",
    company: "Sunil Book Store",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
    rating: 5,
    text: "LaunchPixel helped establish our digital presence and brought our bookstore to a wider audience."
  },

  {
    name: "Vielorine",
    role: "Founder",
    company: "Vielorine.com",
    image: "/vielorine.webp",
    rating: 5,
    text: "LaunchPixel brought our mystical vision to life with a stunning spiritual platform. The Tree of Life animation and overall design exceeded our expectations."
  },
  {
    name: "Sharan Mehta",
    role: "Director",
    company: "Sharans Music Academy",
    image: "https://randomuser.me/api/portraits/men/71.jpg",
    rating: 5,
    text: "The music academy platform made managing classes incredibly easy. Intuitive and feature-rich."
  },

  {
    name: "Neha Gupta",
    role: "Marketing Head",
    company: "VibeCast Innovations",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    rating: 5,
    text: "Our digital signage platform has transformed how we engage with clients. Brilliant execution."
  },
  {
    name: "Rahul Sharma",
    role: "Sales Manager",
    company: "Madhav Fabrication",
    image: "https://randomuser.me/api/portraits/men/43.jpg",
    rating: 5,
    text: "Online orders have tripled since launch. The platform is fast, secure, and user-friendly."
  },

  {
    name: "Karan Verma",
    role: "Tour Manager",
    company: "Varanasi on Wheels",
    image: "https://randomuser.me/api/portraits/men/58.jpg",
    rating: 5,
    text: "Booking management is now effortless. LaunchPixel delivered exactly what we needed."
  },
  {
    name: "Anjali Verma",
    role: "Store Manager",
    company: "Sunil Book Store",
    image: "https://randomuser.me/api/portraits/women/72.jpg",
    rating: 5,
    text: "Our online catalog has attracted customers from across the city. Great ROI on investment."
  },

  {
    name: "Vielorine Team",
    role: "Content Manager",
    company: "Vielorine.com",
    image: "/vielorine.webp",
    rating: 5,
    text: "The blog system and e-commerce shop integration are seamless. Our spiritual community loves the experience."
  },
  {
    name: "Ravi Mehta",
    role: "Music Instructor",
    company: "Sharans Music Academy",
    image: "https://randomuser.me/api/portraits/men/79.jpg",
    rating: 5,
    text: "Practice logs and progress tracking help students improve faster. Very well thought out."
  }
]

export default function TestimonialsCarousel() {
  const [isPaused, setIsPaused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef(0)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId: number
    const scrollSpeed = 1.5 // Increased from 0.5 to 1.5 (3x faster)

    const animate = () => {
      if (!isPaused && scrollContainer) {
        scrollPositionRef.current += scrollSpeed
        
        // Reset scroll when reaching halfway (since we duplicate the content)
        if (scrollPositionRef.current >= scrollContainer.scrollWidth / 2) {
          scrollPositionRef.current = 0
        }
        
        scrollContainer.scrollLeft = scrollPositionRef.current
      }
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationId)
  }, [isPaused])

  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials]

  return (
    <section className="relative py-12 sm:py-20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10 mb-8 sm:mb-12">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Clients Say</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-4">
            Real testimonials from businesses we've helped transform
          </p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-hidden px-4 sm:px-6"
        style={{ scrollBehavior: 'auto' }}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <div
            key={index}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex-shrink-0 w-[280px] sm:w-[320px] p-5 sm:p-6 bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 relative cursor-pointer"
          >
            <Quote className="absolute top-3 right-3 sm:top-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 text-indigo-400/20" />
            
            <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                width={48}
                height={48}
                className="rounded-full object-cover w-10 h-10 sm:w-12 sm:h-12"
              />
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white">{testimonial.name}</h3>
                <p className="text-xs text-gray-400">{testimonial.role}</p>
                <p className="text-xs text-indigo-400">{testimonial.company}</p>
              </div>
            </div>

            <div className="flex gap-0.5 sm:gap-1 mb-2.5 sm:mb-3">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-indigo-400 text-indigo-400" />
              ))}
            </div>

            <p className="text-xs sm:text-sm text-gray-300 relative z-10 leading-relaxed">{testimonial.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
