/**
 * Animation Utilities Library
 * Comprehensive animation presets for GSAP, Framer Motion, and Three.js
 * Optimized for performance and minimal latency
 */

import gsap from "gsap"
import { MotionValue } from "framer-motion"

// ============================================================================
// GSAP ANIMATION PRESETS
// ============================================================================

export const gsapPresets = {
  // Fade animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 0.4,
    ease: "power2.out"
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: 0.3,
    ease: "power2.in"
  },
  fadeInUp: {
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0 },
    duration: 0.6,
    ease: "power3.out"
  },
  fadeInDown: {
    from: { opacity: 0, y: -30 },
    to: { opacity: 1, y: 0 },
    duration: 0.6,
    ease: "power3.out"
  },
  fadeInLeft: {
    from: { opacity: 0, x: -30 },
    to: { opacity: 1, x: 0 },
    duration: 0.6,
    ease: "power3.out"
  },
  fadeInRight: {
    from: { opacity: 0, x: 30 },
    to: { opacity: 1, x: 0 },
    duration: 0.6,
    ease: "power3.out"
  },

  // Scale animations
  scaleIn: {
    from: { scale: 0.8, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: 0.4,
    ease: "back.out(1.7)"
  },
  scaleOut: {
    from: { scale: 1, opacity: 1 },
    to: { scale: 0.8, opacity: 0 },
    duration: 0.3,
    ease: "power2.in"
  },
  scaleUp: {
    from: { scale: 1 },
    to: { scale: 1.05 },
    duration: 0.2,
    ease: "power2.out"
  },
  scaleDown: {
    from: { scale: 1.05 },
    to: { scale: 1 },
    duration: 0.2,
    ease: "power2.out"
  },

  // Slide animations
  slideInUp: {
    from: { y: "100%" },
    to: { y: "0%" },
    duration: 0.5,
    ease: "power3.out"
  },
  slideInDown: {
    from: { y: "-100%" },
    to: { y: "0%" },
    duration: 0.5,
    ease: "power3.out"
  },
  slideInLeft: {
    from: { x: "-100%" },
    to: { x: "0%" },
    duration: 0.5,
    ease: "power3.out"
  },
  slideInRight: {
    from: { x: "100%" },
    to: { x: "0%" },
    duration: 0.5,
    ease: "power3.out"
  },

  // Stagger animations
  staggerIn: {
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    duration: 0.4,
    stagger: 0.1,
    ease: "power2.out"
  },
  staggerScale: {
    from: { scale: 0.8, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: 0.4,
    stagger: 0.1,
    ease: "back.out(1.7)"
  },

  // Special effects
  bounce: {
    from: { y: 0 },
    to: { y: -10, yoyo: true, repeat: 1 },
    duration: 0.3,
    ease: "power2.out"
  },
  shake: {
    x: [-5, 5, -5, 5, 0],
    duration: 0.4,
    ease: "power2.out"
  },
  pulse: {
    scale: [1, 1.05, 1],
    duration: 0.6,
    ease: "power2.out"
  },
  glow: {
    boxShadow: [
      "0 0 0px rgba(254, 237, 1, 0)",
      "0 0 20px rgba(254, 237, 1, 0.5)",
      "0 0 0px rgba(254, 237, 1, 0)"
    ],
    duration: 1,
    ease: "power2.out"
  }
}

// ============================================================================
// FRAMER MOTION VARIANTS
// ============================================================================

export const motionVariants = {
  // Container variants
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },

  // Item variants
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  },

  // Fade variants
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 }
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 }
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 }
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 }
  },

  // Scale variants
  scaleIn: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 }
  },
  scaleUp: {
    hidden: { scale: 1 },
    visible: { scale: 1.05 },
    exit: { scale: 1 }
  },

  // Slide variants
  slideInUp: {
    hidden: { y: "100%" },
    visible: { y: "0%" },
    exit: { y: "100%" }
  },
  slideInDown: {
    hidden: { y: "-100%" },
    visible: { y: "0%" },
    exit: { y: "-100%" }
  },
  slideInLeft: {
    hidden: { x: "-100%" },
    visible: { x: "0%" },
    exit: { x: "-100%" }
  },
  slideInRight: {
    hidden: { x: "100%" },
    visible: { x: "0%" },
    exit: { x: "100%" }
  },

  // Modal variants
  modal: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  },
  modalOverlay: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  },

  // Drawer variants
  drawer: {
    hidden: { x: "100%" },
    visible: { x: "0%" },
    exit: { x: "100%" }
  },
  drawerOverlay: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  },

  // List variants
  list: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  },
  listItem: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  },

  // Card variants
  card: {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  },

  // Button variants
  button: {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  },

  // Text variants
  text: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  },
  textReveal: {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    })
  },

  // Page transitions
  page: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  },

  // Loading variants
  loading: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  },
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.7, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Progress variants
  progress: {
    hidden: { width: "0%" },
    visible: (width: string) => ({
      width,
      transition: { duration: 1, ease: "easeOut" }
    })
  }
}

// ============================================================================
// THREE.JS BACKGROUND EFFECTS
// ============================================================================

export const threeEffects = {
  // Particle field
  particleField: {
    count: 1000,
    size: 0.02,
    speed: 0.001,
    color: 0xFEED01,
    opacity: 0.6
  },

  // Gradient mesh
  gradientMesh: {
    colors: [0x0c0c10, 0x1a1a20, 0x252530],
    speed: 0.0005,
    intensity: 0.3
  },

  // Wave effect
  wave: {
    amplitude: 0.5,
    frequency: 0.01,
    speed: 0.001,
    color: 0xFEED01
  },

  // Grid effect
  grid: {
    size: 50,
    divisions: 50,
    color: 0xFEED01,
    opacity: 0.1
  },

  // Floating particles
  floatingParticles: {
    count: 200,
    size: 0.05,
    speed: 0.002,
    color: 0xFEED01,
    opacity: 0.8
  }
}

// ============================================================================
// MICRO-INTERACTIONS
// ============================================================================

export const microInteractions = {
  // Hover effects
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  hoverGlow: {
    boxShadow: "0 0 20px rgba(254, 237, 1, 0.3)",
    transition: { duration: 0.2 }
  },
  hoverLift: {
    y: -2,
    transition: { duration: 0.2 }
  },

  // Click effects
  click: {
    scale: 0.95,
    transition: { duration: 0.1 }
  },
  clickRipple: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.5, 0],
    transition: { duration: 0.3 }
  },

  // Focus effects
  focus: {
    outline: "2px solid #FEED01",
    outlineOffset: "2px",
    transition: { duration: 0.2 }
  },

  // Loading states
  skeleton: {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Success states
  success: {
    scale: [1, 1.1, 1],
    transition: { duration: 0.3 }
  },

  // Error states
  error: {
    x: [-5, 5, -5, 5, 0],
    transition: { duration: 0.4 }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a GSAP timeline with optimized performance
 */
export function createTimeline(options?: gsap.TimelineVars): gsap.core.Timeline {
  return gsap.timeline({
    defaults: {
      ease: "power2.out",
      duration: 0.4
    },
    ...options
  })
}

/**
 * Animate elements with stagger
 */
export function staggerAnimate(
  elements: HTMLElement[],
  animation: gsap.TweenVars,
  stagger: number = 0.1
): gsap.core.Timeline {
  const tl = createTimeline()
  tl.to(elements, {
    ...animation,
    stagger
  })
  return tl
}

/**
 * Create a scroll-triggered animation
 */
export function scrollTrigger(
  element: HTMLElement,
  animation: gsap.TweenVars,
  trigger?: HTMLElement
): gsap.core.Tween {
  return gsap.fromTo(
    element,
    animation.from || { opacity: 0, y: 30 },
    {
      ...animation.to || { opacity: 1, y: 0 },
      scrollTrigger: {
        trigger: trigger || element,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    }
  )
}

/**
 * Optimize animation performance
 */
export function optimizeAnimation(callback: () => void): void {
  requestAnimationFrame(() => {
    callback()
  })
}

/**
 * Debounce animation
 */
export function debounceAnimation(
  callback: () => void,
  delay: number = 100
): () => void {
  let timeoutId: NodeJS.Timeout
  return () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(callback, delay)
  }
}

/**
 * Throttle animation
 */
export function throttleAnimation(
  callback: () => void,
  limit: number = 100
): () => void {
  let inThrottle: boolean
  return () => {
    if (!inThrottle) {
      callback()
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Create a spring animation
 */
export function springAnimation(
  value: MotionValue<number>,
  to: number,
  stiffness: number = 300,
  damping: number = 24
): void {
  value.set(to, {
    type: "spring",
    stiffness,
    damping
  })
}

/**
 * Create a smooth scroll animation
 */
export function smoothScroll(
  target: HTMLElement,
  duration: number = 0.5,
  offset: number = 0
): void {
  const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset
  window.scrollTo({
    top: targetPosition,
    behavior: "smooth"
  })
}

/**
 * Create a parallax effect
 */
export function parallax(
  element: HTMLElement,
  speed: number = 0.5
): void {
  const scrollY = window.pageYOffset
  element.style.transform = `translateY(${scrollY * speed}px)`
}

/**
 * Create a magnetic effect
 */
export function magneticEffect(
  element: HTMLElement,
  strength: number = 0.3
): void {
  const rect = element.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  const distanceX = (window.innerWidth / 2 - centerX) * strength
  const distanceY = (window.innerHeight / 2 - centerY) * strength

  element.style.transform = `translate(${distanceX}px, ${distanceY}px)`
}

/**
 * Create a ripple effect
 */
export function rippleEffect(
  element: HTMLElement,
  x: number,
  y: number,
  color: string = "rgba(254, 237, 1, 0.3)"
): void {
  const ripple = document.createElement("div")
  ripple.style.cssText = `
    position: absolute;
    width: 100px;
    height: 100px;
    background: ${color};
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    pointer-events: none;
    animation: ripple 0.6s ease-out;
  `

  element.style.position = "relative"
  element.style.overflow = "hidden"
  element.appendChild(ripple)

  const rect = element.getBoundingClientRect()
  ripple.style.left = `${x - rect.left}px`
  ripple.style.top = `${y - rect.top}px`

  setTimeout(() => {
    ripple.remove()
  }, 600)
}

// Add ripple keyframes to document
if (typeof document !== "undefined") {
  const style = document.createElement("style")
  style.textContent = `
    @keyframes ripple {
      to {
        transform: translate(-50%, -50%) scale(4);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(style)
}

// ============================================================================
// PERFORMANCE OPTIMIZATION
// ============================================================================

/**
 * Reduce motion for accessibility
 */
export function reduceMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Check if device supports hardware acceleration
 */
export function supportsHardwareAcceleration(): boolean {
  return "transform" in document.documentElement.style &&
         "perspective" in document.documentElement.style
}

/**
 * Optimize for low-end devices
 */
export function isLowEndDevice(): boolean {
  return navigator.hardwareConcurrency < 4 ||
         (navigator as any).deviceMemory < 4
}

/**
 * Get optimal animation duration based on device
 */
export function getOptimalDuration(baseDuration: number): number {
  if (reduceMotion()) return 0
  if (isLowEndDevice()) return baseDuration * 1.5
  return baseDuration
}

/**
 * Pause animations when tab is not visible
 */
export function pauseWhenHidden(callback: () => void): () => void {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      gsap.globalTimeline.pause()
    } else {
      gsap.globalTimeline.resume()
      callback()
    }
  }

  document.addEventListener("visibilitychange", handleVisibilityChange)

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange)
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  gsapPresets,
  motionVariants,
  threeEffects,
  microInteractions,
  createTimeline,
  staggerAnimate,
  scrollTrigger,
  optimizeAnimation,
  debounceAnimation,
  throttleAnimation,
  springAnimation,
  smoothScroll,
  parallax,
  magneticEffect,
  rippleEffect,
  reduceMotion,
  supportsHardwareAcceleration,
  isLowEndDevice,
  getOptimalDuration,
  pauseWhenHidden
}
