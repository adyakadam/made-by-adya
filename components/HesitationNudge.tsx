'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface Props {
  children: React.ReactNode
  customOrderPath?: string
}

export default function HesitationNudge({ children, customOrderPath = '/custom-order' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const desktopTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mobileTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dismissed = useRef(false)

  const clearDesktopTimer = () => {
    if (desktopTimer.current) { clearTimeout(desktopTimer.current); desktopTimer.current = null }
  }

  const dismiss = useCallback(() => {
    dismissed.current = true
    setVisible(false)
    clearDesktopTimer()
    if (mobileTimer.current) clearTimeout(mobileTimer.current)
  }, [])

  useEffect(() => {
    const isTouchOnly = window.matchMedia('(hover: none) and (pointer: coarse)').matches

    if (isTouchOnly) {
      // Mobile: show after 12s of continuous page visibility without add-to-cart tap
      const start = () => {
        if (dismissed.current) return
        mobileTimer.current = setTimeout(() => {
          if (!dismissed.current) setVisible(true)
        }, 12_000)
      }
      const pause = () => { if (mobileTimer.current) clearTimeout(mobileTimer.current) }

      start()
      document.addEventListener('visibilitychange', () => {
        document.hidden ? pause() : start()
      })
      return () => { if (mobileTimer.current) clearTimeout(mobileTimer.current) }
    }

    // Desktop: show after 8s of cursor staying within 80px of the button area
    const handleMouseMove = (e: MouseEvent) => {
      if (dismissed.current || visible) return
      const el = containerRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right)
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom)
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 80) {
        if (!desktopTimer.current) {
          desktopTimer.current = setTimeout(() => {
            if (!dismissed.current) setVisible(true)
          }, 8_000)
        }
      } else {
        clearDesktopTimer()
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      clearDesktopTimer()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={containerRef}>
      {/* Clicks on the button dismiss the nudge */}
      <div onClick={dismiss}>
        {children}
      </div>

      <p
        aria-hidden={!visible}
        className={[
          'text-sm text-gray-400 italic mt-2 leading-relaxed',
          'transition-opacity duration-[400ms]',
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none select-none',
        ].join(' ')}
      >
        Not finding exactly what you want?{' '}
        <Link
          href={customOrderPath}
          className="text-amber-600/70 hover:text-amber-600 hover:underline transition-colors duration-200"
        >
          ✦ Request a custom piece instead
        </Link>
      </p>
    </div>
  )
}
