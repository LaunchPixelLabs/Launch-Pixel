'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function ParticleField() {
  const ref = useRef<any>()
  
  // Generate random positions for particles
  const [positions] = useMemo(() => {
    const pos = new Float32Array(2000 * 3)
    for (let i = 0; i < 2000; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return [pos]
  }, [])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.05
      ref.current.rotation.y += delta * 0.075
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#FEED01"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  )
}

function Grid() {
  return (
    <gridHelper 
      args={[20, 20, 0xFEED01, 0x333333]} 
      position={[0, -2, 0]} 
      rotation={[0, 0, 0]} 
      opacity={0.1}
      transparent
    />
  )
}

export default function PremiumBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#0c0c10]">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <ParticleField />
        <Grid />
        <fog attach="fog" args={['#0c0c10', 5, 15]} />
      </Canvas>
      {/* Overlay gradient for better content readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c10] via-transparent to-[#0c0c10] opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(254,237,1,0.05),transparent_70%)]" />
    </div>
  )
}
