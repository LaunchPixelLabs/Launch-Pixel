import { Code2, Search, Megaphone, LucideIcon } from "lucide-react"

export interface Internship {
  id: string
  title: string
  icon: LucideIcon
  gradient: string
  description: string
  responsibilities: string[]
}

export const INTERNSHIPS: Internship[] = [
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

// Static data without React components for generateStaticParams
export const INTERNSHIP_SLUGS = ['mern', 'seo', 'social'] as const
