"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Sparkles, ArrowRight, Loader2, Code2, LineChart, Search, Megaphone, UploadCloud, X } from "lucide-react"
import { useRouter } from "next/navigation"
import Navigation from "../../components/Navigation"
import Footer from "../../components/Footer"
import dynamic from "next/dynamic"

import SplitTextReveal from "../../components/SplitTextReveal"
import MagneticButton from "../../components/MagneticButton"

const INTERNSHIPS = [
  {
    id: 'mern',
    title: 'AI-Powered MERN Stack Developer Intern',
    icon: Code2,
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Build robust web applications and autonomous AI architectures. Work directly alongside the Launch Pixel Agent to ship extreme code.',
    responsibilities: [
      'Engineer full-stack architectures using Node, React, and databases',
      'Deploy custom AI agents into real-world business environments',
      'Assist in constructing intelligent digital monopolies',
      'Collaborate alongside cognitive AI agents for code velocity'
    ]
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
      'Support efforts to improve search rankings'
    ]
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
      'Monitor discussions and participate in relevant conversations'
    ]
  }
]

export default function CareersPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('success') === 'true') {
        setIsSuccess(true);
        window.history.replaceState({}, '', '/careers');
      }
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles && droppedFiles.length > 0) {
      setFile(droppedFiles[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const roleData = INTERNSHIPS.find(i => i.id === selectedRole)

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-transparent">
        <Navigation />
        <div className="flex items-center justify-center px-4 py-40 relative z-10">
          <div className="max-w-md w-full text-center p-8 rounded-2xl bg-indigo-900/20 backdrop-blur-sm border border-indigo-700/30">
            <h2 className="text-2xl font-bold text-white mb-4">Application Submitted!</h2>
            <p className="text-gray-300 mb-6">Thank you for your submission. Our team will get back to you shortly!</p>
            <button
              onClick={() => { setIsSuccess(false); setSelectedRole(null); }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all shadow-lg mx-auto"
            >
              Back to Careers
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Navigation />

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-24">
        <div className="text-center mb-20 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Join Our Team
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 tracking-tight font-display">
            <SplitTextReveal mode="words" as="span" stagger={0.05} duration={1}>
              Engineer the Future.
            </SplitTextReveal>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 font-light leading-relaxed max-w-2xl mx-auto text-balance">
            We are looking for driven architects to join our covert, fully remote team. Gain real-world experience, deploy autonomous agents, and construct the monopolies of tomorrow.
          </p>
        </div>

        {!selectedRole ? (
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {INTERNSHIPS.map((internship) => (
              <div
                key={internship.id}
                className="bg-gray-900/40 backdrop-blur-2xl border border-gray-800/50 hover:border-indigo-500/50 rounded-3xl p-8 transition-all duration-500 group flex flex-col hover:shadow-2xl hover:shadow-indigo-500/10 relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${internship.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className={`w-16 h-16 rounded-2xl mb-8 flex items-center justify-center bg-gradient-to-br ${internship.gradient} bg-opacity-10 text-white shadow-lg`}>
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
                <MagneticButton strength={0.4} className="w-full mt-auto">
                  <button
                    onClick={() => setSelectedRole(internship.id)}
                    className="btn-ghost w-full justify-center"
                  >
                    <span className="font-semibold">Review Dossier</span> <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </MagneticButton>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto bg-gray-900/80 backdrop-blur-3xl border border-gray-800/60 rounded-[2rem] overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setSelectedRole(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-700 p-2.5 rounded-full transition-all z-20 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 md:p-14 border-b border-gray-800/60 bg-gradient-to-b from-gray-800/20 to-transparent relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl ${roleData?.gradient} opacity-5 blur-3xl -z-10 rounded-full translate-x-1/3 -translate-y-1/3`} />
              <div className="flex items-center gap-5 mb-5 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${roleData?.gradient} text-white shadow-lg`}>
                  {roleData && <roleData.icon className="w-7 h-7" />}
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{roleData?.title}</h2>
              </div>
              <p className="text-gray-400 text-lg font-light leading-relaxed max-w-2xl relative z-10">Complete the application below to apply for this remote position. We review applications on a rolling basis.</p>
            </div>

            <form
              ref={formRef}
              encType="multipart/form-data"
              className="p-8 sm:p-12 space-y-8"
              onSubmit={async (e) => {
                e.preventDefault()
                const isResumeRequired = selectedRole === 'mern' || selectedRole === 'seo'
                if (isResumeRequired && !file) {
                  alert("Please upload your resume. It is required for this role.")
                  return
                }
                setIsLoading(true)

                try {
                  const formData = new FormData(e.currentTarget)
                  if (file) {
                    formData.set('attachment', file)
                  }

                  const res = await fetch('/api/careers', {
                    method: 'POST',
                    body: formData,
                  })

                  if (res.ok) {
                    setIsSuccess(true)
                    window.history.replaceState({}, '', '/careers?success=true')
                  } else {
                    const errorData = await res.json()
                    alert(errorData.message || 'Something went wrong.')
                  }
                } catch (error) {
                  alert('Failed to send application. Please try again later.')
                } finally {
                  setIsLoading(false)
                }
              }}
            >
              <input type="hidden" name="Role" value={roleData?.title || ''} />
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">1</span>
                  Basic Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-5">
                  <input type="text" name="Full Name" placeholder="Full Name *" required className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" />
                  <input type="email" name="Email Address" placeholder="Email Address *" required className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" />
                  <input type="tel" name="Phone Number" placeholder="Phone Number *" required className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" />
                  <input type="text" name="City & Country" placeholder="City & Country *" required className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" />
                  <input type="url" name="LinkedIn Profile" placeholder="LinkedIn Profile URL" className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" />
                  {selectedRole === 'mern' && (
                    <>
                      <input type="url" name="GitHub Profile" placeholder="GitHub Profile URL" className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" />
                      <input type="url" name="Portfolio Website" placeholder="Portfolio / Personal Website" className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 sm:col-span-2" />
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-3 pt-4">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">2</span>
                  Education & Experience
                </h3>
                <div className="grid sm:grid-cols-2 gap-5">
                  <select name="Current Qualification" required className="form-select w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500">
                    <option value="">Current Qualification *</option>
                    <option value="B.Tech / B.E">B.Tech / B.E</option>
                    <option value="BCA / MCA">BCA / MCA</option>
                    <option value="B.Sc IT / CS">B.Sc IT / Computer Science</option>
                    <option value="MBA">MBA</option>
                    <option value="Other">Other</option>
                  </select>
                  <input type="text" name="College/University" placeholder="College / University Name *" required className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" />
                  <select name="Have you graduated" required className="form-select w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500">
                    <option value="">Have you graduated? *</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <input type="text" name="Grad Year / Semester" placeholder="Graduation Year / Current Semester" className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              {selectedRole === 'mern' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-3 pt-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">3</span>
                    Technical Skills
                  </h3>
                  <div className="space-y-5 text-gray-300">
                    <input type="text" name="Comfortable Technologies" placeholder="Technologies you are comfortable with (e.g. React, Node...) *" required className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white" />
                    <input type="number" min="1" max="5" name="MERN Stack Rating" placeholder="Rate your MERN Stack knowledge (1-5) *" required className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white" />
                    <textarea name="MERN Projects Links" placeholder="If you've built MERN projects, provide links (GitHub / Live Demo)" rows={3} className="form-textarea w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"></textarea>

                    <h3 className="text-lg font-bold text-white flex items-center gap-3 pt-8 pb-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">4</span>
                      AI & Tools Knowledge
                    </h3>
                    <input type="text" name="AI Tools Used" placeholder="Which AI tools have you used? (e.g. ChatGPT, Claude, Cursor) *" required className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white" />
                    <select name="Prompt Engineering Experience" className="form-select w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white">
                      <option value="">Do you have experience with Prompt Engineering?</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              )}



              {selectedRole === 'seo' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-3 pt-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">3</span>
                    Role Specific Questions
                  </h3>
                  <div className="space-y-5 text-gray-300">
                    <select name="SEO Experience Level" required className="form-select w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white">
                      <option value="">What is your experience level with SEO? *</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                    <input type="text" name="SEO Tools" placeholder="Which SEO tools have you used?" className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white" />
                    <textarea name="Keyword Strategy" placeholder="Explain how you find keywords for a website and provide 5 keywords for a web dev company. *" required rows={4} className="form-textarea w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white"></textarea>
                    <textarea name="Screening Task" placeholder="Practical Task: Search Google for 'website development company' and list 2 competitors from the first page. *" required rows={3} className="form-textarea w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white"></textarea>
                  </div>
                </div>
              )}

              {selectedRole === 'social' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-3 pt-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">3</span>
                    Role Specific Questions
                  </h3>
                  <div className="space-y-5 text-gray-300">
                    <input type="text" name="Social Platforms" placeholder="Which platforms do you actively use? *" required className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white" />
                    <select name="Managed Accounts Before" className="form-select w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white">
                      <option value="">Have you managed social media accounts before?</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    <textarea name="Writing Skills" placeholder="Write a short LinkedIn comment promoting a web dev service AND a Reddit comment engaging in a startup discussion. *" required rows={5} className="form-textarea w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white"></textarea>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-3 pt-4">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">!</span>
                  Final Details
                </h3>
                <div className="grid sm:grid-cols-2 gap-5">
                  <select name="Hours per Week" required className="form-select w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500">
                    <option value="">Internship availability (hours per week) *</option>
                    <option value="5-10 hours">5-10 hours</option>
                    <option value="10-15 hours">10-15 hours</option>
                    <option value="15-20 hours">15-20 hours</option>
                    <option value="20+ hours">20+ hours</option>
                  </select>
                  <select name="Expected Duration" required className="form-select w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500">
                    <option value="">Expected internship duration *</option>
                    <option value="1 Month">1 Month</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
                <textarea name="Why this role" placeholder="Why do you want this internship? *" required rows={3} className="form-textarea w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500"></textarea>
              </div>

              {/* Drag and Drop File Upload for Resume */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">
                  Resume / Portfolios {(selectedRole === 'mern' || selectedRole === 'seo') && <span className="text-red-500">*</span>}
                </h3>
                <div
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${file ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 bg-gray-800/30 hover:bg-gray-800/50'}`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    name="attachment"
                    accept=".pdf,.doc,.docx,.zip"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />

                  {file ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UploadCloud className="w-8 h-8 text-indigo-400" />
                      </div>
                      <p className="text-white font-medium mb-1">{file.name}</p>
                      <p className="text-gray-400 text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      <p className="text-indigo-400 text-sm mt-4 hover:underline cursor-pointer">Click to change file</p>
                    </div>
                  ) : (
                    <div className="text-center cursor-pointer">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UploadCloud className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-white font-medium mb-2">Drag and drop your resume here</p>
                      <p className="text-gray-400 text-sm mb-4">or click to browse from your computer (PDF, DOCX, ZIP max 10MB)</p>
                      <span className="inline-block px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors">
                        Select File
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 pb-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-1">
                    <input 
                      type="checkbox" 
                      name="Declaration" 
                      value="I hereby declare the above are true to the best of my knowledge and I will face consequences if I am caught providing false testimonials."
                      required 
                      className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded bg-gray-800/50 checked:bg-indigo-500 checked:border-indigo-500 transition-all cursor-pointer"
                    />
                    <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-tight">
                    I hereby declare the above are true to the best of my knowledge and I will face consequences if I am caught providing false testimonials. <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>

              <div className="pt-4 pb-4">
                <MagneticButton strength={0.4} className="w-full">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-gradient w-full py-5 text-white font-bold text-lg flex items-center justify-center gap-3 border-none disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/25 group relative"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Transmitting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
                          Transmit Operations Dossier
                        </>
                      )}
                    </span>
                  </button>
                </MagneticButton>
              </div>
            </form>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}