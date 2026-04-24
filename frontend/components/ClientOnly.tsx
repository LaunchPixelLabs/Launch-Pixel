"use client"

import dynamic from "next/dynamic"

const FloatingButtons = dynamic(() => import("./FloatingButtons"), { ssr: false })

export default function ClientOnly() {
  return <FloatingButtons />
}
