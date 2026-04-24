"use client"

import React from 'react'
import { Sparkles, ArrowRight, Code2, Search, Megaphone } from "lucide-react"
import { useRouter } from "next/navigation"
import Navigation from "../../components/Navigation"
import Footer from "../../components/Footer"
import dynamic from "next/dynamic"

const Antigravity = dynamic(() => import('../../components/Antigravity'), { ssr: false })

export const INTERNSHIPS = [
  {
    id: 'mern',
    title: 'AI-Powered MERN Stack Developer Intern',
    icon: Code2,
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Build web applications using MongoDB, Express, React, Node.js with AI tools and prompt engineering.',
    responsibilities: [
      'Build and improve web applications using MERN stack',
      'Use AI tools and prompt engineering to assist development',
      'Assist in creating clean and responsive UI',
      'Collaborate with the development team on real-world projects',
    ],
  },
  {
    id: 'seo',
    title: 'SEO & Keyword Research Intern',
    icon: Search,
    gradient: 'from-green-500 to-emerald-500',
    description: 'Conduct keyword research, analyze competitors, and optimize website content for search engines.',
    responsibilities: [
      'Conduct keyword research for different industries',
      'Analyze competitors and search trends',
      'Assist in optimizing website content for search engines',
      'Support efforts to improve search rankings',
    ],
  },
  {
    id: 'social',
    title: 'Social Media Outreach & Community Engagement Intern',
    icon: Megaphone,
    gradient: 'from-orange-500 to-red-500',
    description: 'Engage on platforms like Reddit, Quora, LinkedIn to increase brand visibility and engagement.',
    responsibilities: [
      'Engage on platforms such as Reddit, Quora, LinkedIn',
      'Create meaningful posts and comments related to client services',
      'Help increase brand visibility and audience engagement',
      'Monitor discussions and participate in relevant conversations',
    ],
  },
]

export default function CareersPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="fixed inset-0 z-0">
        <Antigravity color="#5227FF" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-gray-950/80 to-gray-950 pointer-events-none" />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-24">
        <div className="text-center mb-20 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Join Our Team
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 tracking-tight">
            Build the Future with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">
              LaunchPixel
            </span>
          </h1>
          <p className="text-xl text-gray-400 font-light leading-relaxed max-w-2xl mx-auto">
            We are looking for passionate, driven individuals to join our fully remote team. Gain real-world experience
            and shape the next generation of AI and tech.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {INTERNSHIPS.map((internship) => (
            <div
              key={internship.id}
              className="bg-gray-900/40 backdrop-blur-2xl border border-gray-800/50 hover:border-indigo-500/50 rounded-3xl p-8 transition-all duration-500 group flex flex-col hover:shadow-2xl hover:shadow-indigo-500/10 relative overflow-hidden"
            >
              <div
                className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${internship.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div
                className={`w-16 h-16 rounded-2xl mb-8 flex items-center justify-center bg-gradient-to-br ${internship.gradient} bg-opacity-10 text-white shadow-lg`}
              >
                <internship.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{internship.title}</h3>
              <p className="text-gray-400 mb-6 flex-grow">{internship.description}</p>
              <div className="mb-8">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Key Responsibilities</h4>
                <ul className="text-sm text-gray-400 list-none space-y-3">
                  {internship.responsibilities.slice(0, 3).map((r, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                      <span className="leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => router.push(`/careers/${internship.id}`)}
                className="w-full py-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 text-white rounded-2xl transition-all duration-300 flex justify-center items-center gap-2 group-hover:bg-indigo-600 group-hover:border-indigo-600 shadow-sm"
              >
                <span className="font-semibold">Apply Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
