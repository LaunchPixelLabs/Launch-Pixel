"use client"

import React, { useState, useRef } from 'react'
import { Sparkles, Loader2, UploadCloud, ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Navigation from "../../../components/Navigation"
import Footer from "../../../components/Footer"
import dynamic from "next/dynamic"
import { INTERNSHIPS } from "../page"

const Antigravity = dynamic(() => import('../../../components/Antigravity'), { ssr: false })

export default function ApplyPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string

  const roleData = INTERNSHIPS.find((i) => i.id === slug)

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Redirect to /careers if slug is invalid
  if (!roleData) {
    if (typeof window !== 'undefined') router.replace('/careers')
    return null
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="fixed inset-0 z-0">
          <Antigravity color="#5227FF" />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-gray-950/80 to-gray-950 pointer-events-none" />
        </div>
        <div className="flex items-center justify-center px-4 py-40 relative z-10">
          <div className="max-w-md w-full text-center p-8 rounded-2xl bg-indigo-900/20 backdrop-blur-sm border border-indigo-700/30">
            <h2 className="text-2xl font-bold text-white mb-4">Application Submitted!</h2>
            <p className="text-gray-300 mb-6">Thank you for your submission. Our team will get back to you shortly!</p>
            <button
              onClick={() => router.push('/careers')}
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

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation() }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    const dropped = e.dataTransfer.files
    if (dropped?.length > 0) setFile(dropped[0])
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="fixed inset-0 z-0">
        <Antigravity color="#5227FF" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-gray-950/80 to-gray-950 pointer-events-none" />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-24 max-w-4xl">
        <button
          onClick={() => router.push('/careers')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Careers
        </button>

        <div className="bg-gray-900/80 backdrop-blur-3xl border border-gray-800/60 rounded-[2rem] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-8 md:p-14 border-b border-gray-800/60 bg-gradient-to-b from-gray-800/20 to-transparent relative overflow-hidden">
            <div
              className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl ${roleData.gradient} opacity-5 blur-3xl -z-10 rounded-full translate-x-1/3 -translate-y-1/3`}
            />
            <div className="flex items-center gap-5 mb-5 relative z-10">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${roleData.gradient} text-white shadow-lg`}
              >
                <roleData.icon className="w-7 h-7" />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{roleData.title}</h2>
            </div>
            <p className="text-gray-400 text-lg font-light leading-relaxed max-w-2xl relative z-10">
              Complete the application below to apply for this remote position. We review applications on a rolling basis.
            </p>
          </div>

          {/* Form */}
          <form
            encType="multipart/form-data"
            className="p-8 sm:p-12 space-y-8"
            onSubmit={async (e) => {
              e.preventDefault()
              const isResumeRequired = slug === 'mern' || slug === 'seo'
              if (isResumeRequired && !file) {
                alert('Please upload your resume. It is required for this role.')
                return
              }
              setIsLoading(true)
              try {
                const formData = new FormData(e.currentTarget)
                if (file) formData.set('attachment', file)

                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/candidates`,
                  { method: 'POST', body: formData }
                )

                const data = await res.json()
                if (res.ok && data.success) {
                  setIsSuccess(true)
                } else {
                  alert(data.message || 'Something went wrong.')
                }
              } catch (err) {
                console.error('Submit error:', err)
                alert('Failed to send application. Please try again later.')
              } finally {
                setIsLoading(false)
              }
            }}
          >
            <input type="hidden" name="Role" value={roleData.title} />

            {/* Section 1 — Basic Info */}
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
                {slug === 'mern' && (
                  <>
                    <input type="url" name="GitHub Profile" placeholder="GitHub Profile URL" className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" />
                    <input type="url" name="Portfolio Website" placeholder="Portfolio / Personal Website" className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 sm:col-span-2" />
                  </>
                )}
              </div>
            </div>

            {/* Section 2 — Education */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-3 pt-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">2</span>
                Education & Experience
              </h3>
              <div className="grid sm:grid-cols-2 gap-5">
                <select name="Current Qualification" required className="form-select w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500">
                  <option value="">Current Qualification *</option>
                  <option>B.Tech / B.E</option>
                  <option>BCA / MCA</option>
                  <option>B.Sc IT / CS</option>
                  <option>MBA</option>
                  <option>Other</option>
                </select>
                <input type="text" name="College/University" placeholder="College / University Name *" required className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" />
                <select name="Have you graduated" required className="form-select w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500">
                  <option value="">Have you graduated? *</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
                <input type="text" name="Grad Year / Semester" placeholder="Graduation Year / Current Semester" className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            {/* Section 3 — Role Specific */}
            {slug === 'mern' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-3 pt-4">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">3</span>
                  Technical Skills
                </h3>
                <div className="space-y-5">
                  <input type="text" name="Comfortable Technologies" placeholder="Technologies you are comfortable with (e.g. React, Node...) *" required className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white" />
                  <input type="number" min="1" max="5" name="MERN Stack Rating" placeholder="Rate your MERN Stack knowledge (1-5) *" required className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white" />
                  <textarea name="MERN Projects Links" placeholder="MERN project links (GitHub / Live Demo)" rows={3} className="form-textarea w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" />
                  <h3 className="text-lg font-bold text-white flex items-center gap-3 pt-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">4</span>
                    AI & Tools Knowledge
                  </h3>
                  <input type="text" name="AI Tools Used" placeholder="Which AI tools have you used? (e.g. ChatGPT, Claude, Cursor) *" required className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white" />
                  <select name="Prompt Engineering Experience" className="form-select w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white">
                    <option value="">Do you have experience with Prompt Engineering?</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              </div>
            )}

            {slug === 'seo' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-3 pt-4">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">3</span>
                  Role Specific Questions
                </h3>
                <div className="space-y-5">
                  <select name="SEO Experience Level" required className="form-select w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white">
                    <option value="">What is your experience level with SEO? *</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                  <input type="text" name="SEO Tools" placeholder="Which SEO tools have you used?" className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white" />
                  <textarea name="Keyword Strategy" placeholder="Explain how you find keywords and provide 5 keywords for a web dev company. *" required rows={4} className="form-textarea w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white" />
                  <textarea name="Screening Task" placeholder="List 2 competitors from Google's first page for 'website development company'. *" required rows={3} className="form-textarea w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white" />
                </div>
              </div>
            )}

            {slug === 'social' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-3 pt-4">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">3</span>
                  Role Specific Questions
                </h3>
                <div className="space-y-5">
                  <input type="text" name="Social Platforms" placeholder="Which platforms do you actively use? *" required className="form-input w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white" />
                  <select name="Managed Accounts Before" className="form-select w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white">
                    <option value="">Have you managed social media accounts before?</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                  <textarea name="Writing Skills" placeholder="Write a short LinkedIn comment promoting a web dev service AND a Reddit comment engaging in a startup discussion. *" required rows={5} className="form-textarea w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white" />
                </div>
              </div>
            )}

            {/* Final Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-3 pt-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">!</span>
                Final Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-5">
                <select name="Hours per Week" required className="form-select w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500">
                  <option value="">Availability (hours per week) *</option>
                  <option>5-10 hours</option>
                  <option>10-15 hours</option>
                  <option>15-20 hours</option>
                  <option>20+ hours</option>
                </select>
                <select name="Expected Duration" required className="form-select w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500">
                  <option value="">Expected duration *</option>
                  <option>1 Month</option>
                  <option>3 Months</option>
                  <option>6 Months</option>
                  <option>Flexible</option>
                </select>
              </div>
              <textarea name="Why this role" placeholder="Why do you want this internship? *" required rows={3} className="form-textarea w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" />
            </div>

            {/* Resume Upload */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">
                Resume / Portfolio{(slug === 'mern' || slug === 'seo') && <span className="text-red-500"> *</span>}
              </h3>
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${file ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 bg-gray-800/30 hover:bg-gray-800/50'}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" name="attachment" accept=".pdf,.doc,.docx,.zip" className="hidden" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${file ? 'bg-indigo-500/20' : 'bg-gray-800'}`}>
                  <UploadCloud className={`w-8 h-8 ${file ? 'text-indigo-400' : 'text-gray-400'}`} />
                </div>
                {file ? (
                  <>
                    <p className="text-white font-medium mb-1">{file.name}</p>
                    <p className="text-gray-400 text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    <p className="text-indigo-400 text-sm mt-4 hover:underline">Click to change file</p>
                  </>
                ) : (
                  <>
                    <p className="text-white font-medium mb-2">Drag and drop your resume here</p>
                    <p className="text-gray-400 text-sm mb-4">or click to browse (PDF, DOCX, ZIP — max 10MB)</p>
                    <span className="inline-block px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors">Select File</span>
                  </>
                )}
              </div>
            </div>

            {/* Declaration */}
            <div className="pt-4 pb-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-1">
                  <input
                    type="checkbox"
                    name="Declaration"
                    value="I hereby declare the above are true to the best of my knowledge."
                    required
                    className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded bg-gray-800/50 checked:bg-indigo-500 checked:border-indigo-500 transition-all cursor-pointer"
                  />
                  <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-tight">
                  I hereby declare the above are true to the best of my knowledge and I will face consequences if I am caught providing false testimonials. <span className="text-red-500">*</span>
                </span>
              </label>
            </div>

            {/* Submit */}
            <div className="pt-4 pb-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-8 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] text-white rounded-2xl font-bold text-lg hover:bg-right transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/25 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
                <span className="relative z-10 flex items-center gap-3">
                  {isLoading ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> Submitting Application...</>
                  ) : (
                    <><Sparkles className="w-6 h-6" /> Submit Application</>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}
