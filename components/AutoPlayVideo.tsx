'use client'

import { useEffect, useRef } from 'react'

interface Props {
  src: string
  style?: React.CSSProperties
}

export default function AutoPlayVideo({ src, style }: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    video.muted = true
    video.load()
    video.play().catch(() => null)
  }, [src])

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      style={style}
    >
      <source src={src} type="video/mp4" />
      <source src={src} type="video/webm" />
      <source src={src} type="video/quicktime" />
    </video>
  )
}
