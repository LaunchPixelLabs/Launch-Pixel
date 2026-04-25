"use client"
import { useEffect, useState } from "react"
import {
  Code2,
  Smartphone,
  Brain,
  Book,
  IdCard,
  LayoutDashboard,
  PenTool,
  BarChart2,
  Twitter,
  Linkedin,
  Github,
  DiscIcon as Discord,
  ChevronRight,
  MessageSquare,
  Menu,
  X,
} from "lucide-react"
import { motion } from 'framer-motion'
import Image from "next/image"

function LandingPage() {
  // Animated counters for stats
  const [clientCount, setClientCount] = useState(1);
  const [projectCount, setProjectCount] = useState(1);

  useEffect(() => {
    let clientTarget = 50;
    let projectTarget = 100;
    // Make animation 5x slower by multiplying intervals by 5
    let clientInterval = setInterval(() => {
      setClientCount((prev) => {
        if (prev < clientTarget) return prev + 1;
        clearInterval(clientInterval);
        return clientTarget;
      });
    }, 90); // 18 * 5 = 90ms
    let projectInterval = setInterval(() => {
      setProjectCount((prev) => {
        if (prev < projectTarget) return prev + 1;
        clearInterval(projectInterval);
        return projectTarget;
      });
    }, 50); // 10 * 5 = 50ms
    return () => {
      clearInterval(clientInterval);
      clearInterval(projectInterval);
    };
  }, []);
  const [isVisible, setIsVisible] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const [isSuccess, setIsSuccess] = useState(false); // Success state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
      alert('Name is required.');
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
      alert('Email is required.');
    } else if (!/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,7}$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email.';
      alert('Enter a valid email.');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Formsubmit action URL
    if (validateStep()) {
      setIsLoading(true);  // Set loading to true when the submit is clicked

      const formActionURL = 'https://formsubmit.co/contact@launchpixel.in'; // Replace with your email
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('_captcha', 'false');

      try {
        // Use await to send data to Formsubmit
        const response = await fetch(formActionURL, {
          method: 'POST',
          body: formDataToSend,
        });

        if (response.ok) {
          setIsSuccess(true);
          alert('Your message has been sent successfully!');
          setFormData({
            name: '',
            email: '',
            message: ''
          });
        } else {
          alert('There was an error. Please try again.');
        }
      } catch (error) {
        alert('There was an error. Please try again.');
        console.error('Error in form submission:', error);
      } finally {
        setIsLoading(false);  // Set loading to false after the process is done
        setIsSuccess(false)
      }
    }
  }


  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const options = {
      threshold: 0.5, // Trigger when 30% of the section is visible
      rootMargin: '-80px 0px 0px 0px' // Offset for the fixed header
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, options);

    // Observe all sections
    const sections = ['home', 'services', 'portfolio', 'testimonials', 'blog', 'contact'];
    sections.forEach(section => {
      const element = document.getElementById(section);
      if (element) observer.observe(element);
    });

    return () => {
      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) observer.unobserve(element);
      });
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  }

  const NavLink = ({ section, label }: { section: string; label: string }) => (
    <span
      onClick={() => scrollToSection(section)}
      className={`cursor-pointer transition-colors duration-300 ${activeSection === section ? "text-indigo-400" : "text-gray-400 hover:text-indigo-400"
        }`}
      style={{ padding: '0 8px', fontWeight: 500 }}
    >
      {label}
    </span>
  )

  return (
    <div className="min-h-screen bg-gray-950 w-full max-w-full overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-2000"></div>

        {/* Pulsating Grid Beam Effect */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 animate-beam"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950 backdrop-blur-lg border-b border-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Image
              src="/logo.gif"
              alt="LaunchPixel Logo"
              width={90}
              height={90}
              className="rounded-full"
            />
            <div className="hidden lg:flex items-center gap-2 justify-end">
              <NavLink section="home" label="Home" />
              <NavLink section="services" label="Services" />
              <NavLink section="portfolio" label="Portfolio" />
              <NavLink section="testimonials" label="Testimonials" />
              <a
                href="/blogs"
                className="cursor-pointer transition-colors duration-300 text-gray-400 hover:text-indigo-400"
                style={{ padding: '0 8px', fontWeight: 500 }}
              >
                Blog
              </a>
              <button
                onClick={() => scrollToSection("contact")}
                className="ml-4 px-6 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-full hover:from-indigo-500 hover:to-indigo-400 transition-all duration-300"
              >
                Contact Us
              </button>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-gray-400 hover:text-white z-[101] relative"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {isMenuOpen && (
          <motion.div
            className="fixed top-16 left-0 w-full h-[calc(100vh-64px)] bg-gray-950/95 z-[60] flex items-center justify-center overflow-y-auto shadow-lg backdrop-blur-xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >            <div className="flex flex-col items-center w-full justify-center min-h-full px-6 py-8">
              <nav className="container mx-auto flex flex-col items-center space-y-6">
                {["home", "services", "portfolio", "testimonials"].map((section) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className={`text-2xl font-semibold ${activeSection === section ? "text-indigo-400" : "text-gray-400 hover:text-indigo-400"
                      } transition-colors duration-300`}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                ))}
                <a
                  href="/blogs"
                  className="text-2xl font-semibold text-gray-400 hover:text-indigo-400 transition-colors duration-300"
                >
                  Blog
                </a>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="mt-8 px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-full hover:from-indigo-500 hover:to-indigo-400 transition-all duration-300 text-xl font-semibold"
                >
                  Contact Us
                </button>
              </nav>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <div id="home" className="relative min-h-screen flex items-center overflow-hidden pt-20 sm:pt-24 md:pt-16">
        <div className="container mx-auto w-full max-w-full px-4 sm:px-6 py-12 sm:py-16 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.2, delayChildren: 0.1 }
                }
              }}
              className="space-y-6 sm:space-y-8 text-center md:text-left"
            >
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                }}
                className="inline-block"
              >
                <div className="flex items-center gap-2 text-indigo-300 bg-indigo-500/10 rounded-full px-4 sm:px-5 py-2 mb-6 sm:mb-8 backdrop-blur-md border border-indigo-500/20 text-xs sm:text-sm font-medium tracking-wide shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-indigo-500"></span>
                  </span>
                  Innovating the Future of Software
                </div>
              </motion.div>
              <motion.h1 
                variants={{
                  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: "easeOut" } }
                }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight"
              >
                Innovating{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">
                  Software
                </span>{" "}
                <br className="hidden md:block" />Solutions
              </motion.h1>
              <motion.p 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                }}
                className="text-base sm:text-lg md:text-xl text-gray-400 font-light leading-relaxed max-w-xl mx-auto md:mx-0"
              >
                Transform Your Ideas Into Digital Reality. We help businesses transform their ideas into powerful
                digital solutions through innovative software development and strategic consulting.
              </motion.p>
              <motion.div 
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 15 } }
                }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-center justify-center md:justify-start pt-4"
              >
                <button
                  onClick={() => scrollToSection("contact")}
                  className="group px-8 sm:px-9 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] text-white rounded-full hover:bg-right font-semibold transition-all duration-500 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center shadow-lg shadow-indigo-500/25 relative overflow-hidden cursor-none hover:scale-105"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
                  <span className="relative z-10 flex items-center gap-2">
                    Contact us
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-2xl"></div>
                <video
                  src="/launch_hero.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  width={800}
                  height={450}
                  className="rounded-2xl shadow-2xl relative z-10 border border-gray-800"
                >
                </video>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 sm:py-20 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-4 sm:gap-8 text-center">
            <div className="p-6 sm:p-10 rounded-2xl bg-gray-900/40 backdrop-blur-xl border border-gray-800/60 relative group hover:border-indigo-500/40 transition-all duration-500 overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">
                  {clientCount}+
                </div>
                <div className="text-gray-400 mt-2 sm:mt-3 text-sm sm:text-base font-medium tracking-wide uppercase">Happy Clients</div>
              </div>
            </div>
            <div className="p-6 sm:p-10 rounded-2xl bg-gray-900/40 backdrop-blur-xl border border-gray-800/60 relative group hover:border-indigo-500/40 transition-all duration-500 overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">
                  {projectCount}+
                </div>
                <div className="text-gray-400 mt-2 sm:mt-3 text-sm sm:text-base font-medium tracking-wide uppercase">Projects Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="py-12 sm:py-20 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-16 sm:mb-20 text-white tracking-tight">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Services</span>
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="p-6 sm:p-8 md:p-10 bg-gray-900/40 backdrop-blur-2xl rounded-3xl border border-gray-800/50 hover:border-indigo-500/40 transition-all duration-500 relative group overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-indigo-500/10 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 sm:mb-8 border border-indigo-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Code2 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-indigo-300 transition-colors">Web & App Development</h3>
                <p className="text-sm sm:text-base leading-relaxed text-gray-400">
                  Custom applications built with modern technologies, scalable architectures, and best practices.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 md:p-10 bg-gray-900/40 backdrop-blur-2xl rounded-3xl border border-gray-800/50 hover:border-indigo-500/40 transition-all duration-500 relative group overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-indigo-500/10 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 sm:mb-8 border border-purple-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-purple-300 transition-colors">Brand Strategy</h3>
                <p className="text-sm sm:text-base leading-relaxed text-gray-400">Cultivate a powerful identity. We craft strategies that define your brand voice and market positioning.</p>
              </div>
            </div>

            <div className="p-6 sm:p-8 md:p-10 bg-gray-900/40 backdrop-blur-2xl rounded-3xl border border-gray-800/50 hover:border-indigo-500/40 transition-all duration-500 relative group overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-indigo-500/10 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 sm:mb-8 border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-blue-300 transition-colors">AI & Automations</h3>
                <p className="text-sm sm:text-base leading-relaxed text-gray-400">
                  Intelligent applications powered by cutting-edge AI, machine learning, and automated workflows.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 md:p-10 bg-gray-900/40 backdrop-blur-2xl rounded-3xl border border-gray-800/50 hover:border-indigo-500/40 transition-all duration-500 relative group overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-indigo-500/10 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 sm:mb-8 border border-indigo-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Book className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-indigo-300 transition-colors">Design Systems</h3>
                <p className="text-sm sm:text-base leading-relaxed text-gray-400">
                  Comprehensive guidelines and modular systems for perfectly consistent visual language.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 md:p-10 bg-gray-900/40 backdrop-blur-2xl rounded-3xl border border-gray-800/50 hover:border-indigo-500/40 transition-all duration-500 relative group overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-indigo-500/10 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-6 sm:mb-8 border border-pink-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <IdCard className="w-6 h-6 sm:w-8 sm:h-8 text-pink-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-pink-300 transition-colors">Identity Design</h3>
                <p className="text-sm sm:text-base leading-relaxed text-gray-400">
                  Memorable logos, typography, and assets that uniquely capture your entire brand essence.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 md:p-10 bg-gray-900/40 backdrop-blur-2xl rounded-3xl border border-gray-800/50 hover:border-indigo-500/40 transition-all duration-500 relative group overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-indigo-500/10 hover:-translate-y-1">

              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 sm:mb-8 border border-orange-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <LayoutDashboard className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-orange-300 transition-colors">UI & UX Strategy</h3>
                <p className="text-sm sm:text-base leading-relaxed text-gray-400">
                  Intuitive user interfaces driven by deep research and human-centric design thinking.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 md:p-10 bg-gray-900/40 backdrop-blur-2xl rounded-3xl border border-gray-800/50 hover:border-indigo-500/40 transition-all duration-500 relative group overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-indigo-500/10 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 sm:mb-8 border border-teal-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <PenTool className="w-6 h-6 sm:w-8 sm:h-8 text-teal-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-teal-300 transition-colors">Prototyping</h3>
                <p className="text-sm sm:text-base leading-relaxed text-gray-400">
                  High-fidelity interactive prototypes that bring concepts to life fast before building code.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 md:p-10 bg-gray-900/40 backdrop-blur-2xl rounded-3xl border border-gray-800/50 hover:border-indigo-500/40 transition-all duration-500 relative group overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-indigo-500/10 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 sm:mb-8 border border-indigo-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <BarChart2 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-indigo-300 transition-colors">SEO Mastery</h3>
                <p className="text-sm sm:text-base text-gray-400">
                  Intelligent applications powered by cutting-edge AI and machine learning.
                </p>
              </div>
            </div>
            <div className="p-4 sm:p-6 md:p-8 bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800 hover:border-indigo-500/50 transition-colors relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-950 flex items-center justify-center mb-3 sm:mb-4">
                  <IdCard className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-white">Identity & Branding</h3>
                <p className="text-sm sm:text-base text-gray-400">
                  Intelligent applications powered by cutting-edge AI and machine learning.
                </p>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      <div id="portfolio" className="py-12 sm:py-20 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 sm:mb-16 text-white">Our Top Projects</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Portfolio Cards with Popups */}
            {(() => {
              const portfolioItems = [

                {
                  title: "MadhavFabrication.in",
                  displayName: "Madhav Fabrication",
                  type: "Ecommerce",
                  description: "A Clothing Ecommerce platform for Women.",
                  image: "/madhavfabrications.webp",
                  video: "/madhavfabrication.mp4",
                  link: "https://madhavfabrication.in",
                },
                {
                  title: "VibeCast.in",
                  displayName: "VibeCast Innovations",
                  type: "Startup",
                  description: "VibeCast Innovations PVT LTD Deals in Digital Signages.",
                  image: "/vibecast.webp",
                  video: "/vibecast.mp4",
                  link: "https://vibecast.in",
                },
                {
                  title: "VaranasionWheels.com",
                  displayName: "Varanasi on Wheels",
                  type: "Tours & Travels Agency",
                  description: "A Comprehensive Tours & Travel Agency based in Varanasi.",
                  image: "/varanasionwheels.webp",
                  video: "/varanasionwheels.mp4",
                  link: "https://varanasionwheels.com",
                },
                {
                  title: "SunilBookStore.store",
                  displayName: "Sunil Book Store",
                  type: "Portfolio",
                  description: "Portfolio for Sunil Book Store making their presence on the internet and making them reach wider audience.",
                  image: "/sunilbookstore.webp",
                  link: "https://sunilbookstore.store",
                },

                {
                  title: "VivekSharma.space",
                  displayName: "Vivek Sharma",
                  type: "Interactive Resume",
                  description: "An interactive resume with a retro pixel-art gaming aesthetic, featuring animated characters, parallax scrolling, and a unique exploratory experience to showcase skills and experience.",
                  image: "/viveksharma.webp",
                  link: "https://viveksharma.space",
                },
                {
                  title: "Vielorine.com",
                  displayName: "Vielorine",
                  type: "Spiritual & Tarot Platform",
                  description: "Built a mystical tarot readings and spiritual guidance platform for Vielorine, featuring blog system, e-commerce shop, appointment booking, and a stunning Tree of Life animation.",
                  image: "/vielorine.webp",
                  link: "https://vielorine.com",
                  imageStyle: { objectPosition: 'left center' },
                },
                {
                  title: "sharansmusicacademy.com",
                  displayName: "Sharans Music Academy",
                  type: "Music Academy",
                  description: "Built a Music Academy Management System for Sharans Music Academy to manage their Students and staff efficiently, Proper call to action buttons for ease of booking.",
                  image: "/sharansmusicacademy.webp",
                  link: "https://sharansmusicacademy.com",
                },
              ];
              const [openIndex, setOpenIndex] = useState(-1);
              return (
                <>
                  {portfolioItems.map((item, idx) => (
                    <div
                      key={item.title}
                      className="group relative overflow-hidden rounded-xl cursor-pointer"
                      onClick={() => setOpenIndex(idx)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={800}
                        height={600}
                        // @ts-ignore
                        style={item.imageStyle || {}}
                        className="w-full h-64 object-cover rounded-xl transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          <span className="hover:text-indigo-400 transition-colors">
                            {item.title}
                          </span>
                        </h3>
                        <p className="text-gray-300 text-sm">{item.type}</p>
                      </div>
                    </div>
                  ))}
                  {/* Modal Popup */}
                  {openIndex !== -1 && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
                      <div className="portfolio-modal relative bg-gray-950 rounded-2xl shadow-2xl flex flex-col md:flex-row w-full overflow-hidden animate-fade-in border border-indigo-900/40 max-w-[95vw] sm:max-w-[90vw] md:max-w-[900px] max-h-[90vh] overflow-y-auto">
                        <style>{`
                          @media (max-width: 768px) {
                            .portfolio-modal {
                              flex-direction: column !important;
                            }
                            .portfolio-modal > div:first-of-type {
                              width: 100% !important;
                              min-height: 200px !important;
                            }
                            .portfolio-modal > div:last-of-type {
                              width: 100% !important;
                            }
                          }
                        `}</style>
                        {/* Close Button */}
                        <button
                          className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 text-white bg-gray-900/80 rounded-full p-2 sm:p-3 hover:bg-indigo-500 transition-colors z-10 shadow-lg"
                          onClick={() => setOpenIndex(-1)}
                          aria-label="Close"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        {/* Left: Expanded Media (70%) */}
                        <div className="w-full md:w-[70%] flex items-center justify-center bg-gradient-to-br from-indigo-900/60 to-purple-900/60 p-4 sm:p-6 md:p-12">
                          <div className="w-full aspect-video flex items-center justify-center">
                            {portfolioItems[openIndex].video ? (
                              <video
                                src={portfolioItems[openIndex].video}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="rounded-xl sm:rounded-2xl shadow-2xl border border-indigo-800/30 w-full h-full object-cover"
                                style={{ pointerEvents: 'none' }}
                              />
                            ) : (
                              <Image
                                src={portfolioItems[openIndex].image}
                                alt={portfolioItems[openIndex].title}
                                width={900}
                                height={900}
                                className="rounded-xl sm:rounded-2xl shadow-2xl border border-indigo-800/30 w-full h-full object-cover"
                                // @ts-ignore
                                style={portfolioItems[openIndex].imageStyle || {}}
                              />
                            )}
                          </div>
                        </div>
                        {/* Right: Details (30%) */}
                        <div className="w-full md:w-[30%] flex flex-col justify-center bg-gradient-to-br from-indigo-500/40 to-purple-500/40 p-4 sm:p-6 md:p-10">
                          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-3 sm:mb-4 md:mb-6 leading-tight">{portfolioItems[openIndex].displayName}</h2>
                          <h4 className="text-base sm:text-lg md:text-xl font-semibold text-indigo-400 mb-2 sm:mb-3 md:mb-4">{portfolioItems[openIndex].type}</h4>
                          <p className="text-gray-300 mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base md:text-lg">{portfolioItems[openIndex].description}</p>
                          <a
                            href={portfolioItems[openIndex].link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-full font-bold text-sm sm:text-base md:text-lg hover:from-indigo-500 hover:to-indigo-400 transition-all duration-300 shadow-xl text-center"
                          >
                            Visit Website
                          </a>
                        </div>
                      </div>
                    </div >
                  )}
                  <style jsx>{`
                    .animate-fade-in {
                      animation: fadeInModal 0.3s ease;
                    }
                    @keyframes fadeInModal {
                      from { opacity: 0; transform: scale(0.98); }
                      to { opacity: 1; transform: scale(1); }
                    }
                  `}</style>
                </>
              );
            })()}


          </div>
        </div>


      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="py-12 sm:py-20 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 sm:mb-16 text-white">What Our Clients Say</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                name: "Akansh Gupta",
                role: "CEO, Varanasi on Wheels",
                text: "Working with LaunchPixel has been an incredible experience. They delivered our project on time and exceeded our expectations. we are working closely for marketing and SEO strategies.",
                image: "/Akansh.webp",
              },

              {
                name: "Shivanshu Tripathi",
                role: "Owner, VibeCast Innovations",
                text: "Outstanding service and support. They truly understand modern software development. I recommend LaunchPixel and am definately coming back to them for more projects.",
                image: "/Shivanshu.webp",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="p-4 sm:p-6 md:p-8 bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800 hover:border-indigo-500/50 transition-colors relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-md opacity-50"></div>
                      <Image
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        width={64}
                        height={64}
                        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover relative z-10 border-2 border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm sm:text-base">{testimonial.name}</div>
                      <div className="text-indigo-400 text-xs sm:text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm sm:text-base">{testimonial.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="py-12 sm:py-20 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white">Let's Talk</h2>
              <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">Ready to start your next project? Get in touch with us today.</p>
              <form className="space-y-4 sm:space-y-6">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full px-4 py-2.5 sm:py-3 rounded-full bg-gray-900/50 backdrop-blur-lg border border-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  className="w-full px-4 py-2.5 sm:py-3 rounded-full bg-gray-900/50 backdrop-blur-lg border border-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
                />
                <input
                  type="text"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your Message"
                  className="w-full px-4 py-2.5 sm:py-3 rounded-full bg-gray-900/50 backdrop-blur-lg border border-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
                />
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="group px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-full hover:from-indigo-500 hover:to-indigo-400 transition-all duration-300 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
                >
                  {isLoading ? (
                    <div className="spinner-border animate-spin border-t-2 border-b-2 border-white w-5 h-5 sm:w-6 sm:h-6 border-solid rounded-full"></div>
                  ) : (
                    <>Send Message
                      <MessageSquare size={18} className="sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" /></>
                  )}

                </button>
              </form>
            </div>
            <div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-2xl"></div>
                <video
                  src="/contact2.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  width={800}
                  height={400}
                  className="rounded-2xl shadow-2xl relative z-10 border border-gray-800 w-full"
                  aria-label="Contact illustration"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-gray-950/80 backdrop-blur-lg text-white py-8 sm:py-12 border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                LaunchPixel
              </h3>
              <p className="text-gray-400 text-sm sm:text-base">Transforming ideas into powerful digital solutions.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-white text-sm sm:text-base"> </h4>
              <ul className="space-y-1.5 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                <li className="hover:text-indigo-400 transition-colors cursor-pointer"></li>
                <li className="hover:text-indigo-400 transition-colors cursor-pointer">  </li>
                <li className="hover:text-indigo-400 transition-colors cursor-pointer"></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-white text-sm sm:text-base">Quick Links</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                <li>
                  <a href="/careers" className="hover:text-indigo-400 transition-colors cursor-pointer">Careers</a>
                </li>
                <li>
                  <a href="#services" className="hover:text-indigo-400 transition-colors cursor-pointer">Our Services</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-white text-sm sm:text-base">Connect</h4>
              <div className="flex gap-3 sm:gap-4">
                <Twitter className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-indigo-400 transition-colors cursor-pointer" />
                <Linkedin className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-indigo-400 transition-colors cursor-pointer" />
                <Github className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-indigo-400 transition-colors cursor-pointer" />
                <Discord className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-indigo-400 transition-colors cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm">
            © 2026 LaunchPixel. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Structured Data for SEO and LLM Optimization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "LaunchPixel",
            "alternateName": "Launch Pixel",
            "url": "https://launchpixel.com",
            "logo": "https://launchpixel.com/logo.gif",
            "description": "Leading AI automation and digital solutions company specializing in web development, AI applications, and business transformation",
            "foundingDate": "2019",
            "slogan": "Innovating Software Solutions",
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Customer Service",
              "email": "contact@launchpixel.in",
              "availableLanguage": ["English"]
            },
            "sameAs": [
              "https://twitter.com/launchpixel",
              "https://linkedin.com/company/launchpixel",
              "https://github.com/launchpixel"
            ],
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "IN"
            },
            "areaServed": "Worldwide",
            "knowsAbout": [
              "AI Automation",
              "Web Development",
              "Mobile App Development",
              "Machine Learning",
              "Digital Transformation",
              "Brand Strategy",
              "UI/UX Design",
              "SEO Optimization",
              "Business Automation",
              "Software Development"
            ],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Digital Solutions",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "AI Automation",
                    "description": "Intelligent automation solutions using AI and machine learning"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Web Development",
                    "description": "Custom web applications, responsive websites, and progressive web apps built with modern frameworks like React and Next.js."
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Mobile App Development",
                    "description": "Native and cross-platform mobile applications"
                  }
                }
              ]
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5",
              "reviewCount": "50",
              "bestRating": "5"
            }
          })
        }}
      />
    </div >
  )
}

export default LandingPage

