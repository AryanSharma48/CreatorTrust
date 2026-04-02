// GridBeam.tsx

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from "@/lib/utils"

export const GridBeam: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <div className={cn('relative w-full min-h-screen overflow-hidden')}>
    <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
    <Beam />
    <div className={cn("relative z-10", className)}>{children}</div>
  </div>
)

export const Beam = () => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 400 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-60"
      preserveAspectRatio="xMidYMid slice"
    >
      <path
        d="M0 0h100M100 0v100M100 100h100M200 100v100M200 200h100M300 100h100M300 0v100"
        stroke="url(#grad1)"
        strokeWidth={1}
      />
      <path
        d="M50 0v200M150 0v200M250 0v200M350 0v200"
        stroke="url(#grad2)"
        strokeWidth={0.5}
      />
      <defs>
        <motion.linearGradient
          id="grad1"
          variants={{
            initial: {
              x1: '40%',
              x2: '50%',
              y1: '160%',
              y2: '180%'
            },
            animate: {
              x1: '0%',
              x2: '10%',
              y1: '-40%',
              y2: '-20%'
            }
          }}
          animate="animate"
          initial="initial"
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
            repeatDelay: 1.5
          }}
        >
          <stop stopColor="#18CCFC" stopOpacity="0" />
          <stop stopColor="#18CCFC" />
          <stop offset="0.325" stopColor="#6344F5" />
          <stop offset="1" stopColor="#AE48FF" stopOpacity="0" />
        </motion.linearGradient>
        <motion.linearGradient
          id="grad2"
          variants={{
            initial: {
              x1: '0%',
              x2: '0%',
              y1: '100%',
              y2: '120%'
            },
            animate: {
              x1: '0%',
              x2: '0%',
              y1: '-20%',
              y2: '0%'
            }
          }}
          animate="animate"
          initial="initial"
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
            repeatDelay: 2
          }}
        >
          <stop stopColor="#6344F5" stopOpacity="0" />
          <stop stopColor="#6344F5" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#AE48FF" stopOpacity="0.3" />
          <stop offset="1" stopColor="#18CCFC" stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  )
}
