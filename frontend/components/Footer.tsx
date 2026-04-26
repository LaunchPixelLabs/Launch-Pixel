import Link from "next/link"
import { Linkedin, Github, Twitter, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative bg-gray-950/80 backdrop-blur-lg border-t border-gray-800 py-8 sm:py-12 mt-12 sm:mt-20">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-3 sm:mb-4">
              LaunchPixel
            </h3>
            <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">
              Transforming ideas into powerful digital solutions through AI automation and innovation.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <a
                href="https://linkedin.com/company/launchpixel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-indigo-400 hover:bg-gray-700 transition-all"
              >
                <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="https://github.com/launchpixel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-indigo-400 hover:bg-gray-700 transition-all"
              >
                <Github className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="https://twitter.com/launchpixel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-indigo-400 hover:bg-gray-700 transition-all"
              >
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-white text-sm sm:text-base">Company</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-gray-400 text-sm sm:text-base">
              <li>
                <Link href="/portfolio" className="hover:text-indigo-400 transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="hover:text-indigo-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/hiring" className="hover:text-indigo-400 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-white text-sm sm:text-base">What We Do</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-gray-400 text-sm sm:text-base">
              <li>
                <span className="text-gray-400">Web Development</span>
              </li>
              <li>
                <span className="text-gray-400">AI Applications</span>
              </li>
              <li>
                <span className="text-gray-400">Brand Strategy</span>
              </li>
              <li>
                <span className="text-gray-400">UI/UX Design</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-white text-sm sm:text-base">Contact</h4>
            <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:contact@launchpixel.in" className="hover:text-indigo-400 transition-colors break-all">
                  contact@launchpixel.in
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <a href="tel:+917004635011" className="hover:text-indigo-400 transition-colors">
                  +91 7004635011
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>India (Remote Worldwide)</span>
              </li>
            </ul>
            <Link
              href="/contact"
              className="inline-block mt-3 sm:mt-4 px-5 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-full hover:from-indigo-500 hover:to-indigo-400 transition-all duration-300 text-xs sm:text-sm font-medium"
            >
              Get in Touch
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
              © 2026 LaunchPixel. All rights reserved.
            </p>
            <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-indigo-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-indigo-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/sitemap.xml" className="hover:text-indigo-400 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
