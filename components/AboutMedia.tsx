'use client'

import { useEffect, useRef, useState } from 'react'

const VIDEO_EXTS = /\.(mp4|webm|mov|m4v|ogg)/i

export default function AboutMedia({ url, style }: { url: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [videoFailed, setVideoFailed] = useState(false)

  const isVideo = VIDEO_EXTS.test(url.split('?')[0])

  useEffect(() => {
    if (!ref.current) return
    ref.current.muted = true
    ref.current.load()
    ref.current.play().catch(() => null)
  }, [url])

  if (!url) return null

  if (isVideo && !videoFailed) {
    return (
      <video
        ref={ref}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onError={() => setVideoFailed(true)}
        style={style ?? { width: '100%', height: '100%', objectFit: 'cover' }}
      >
        <source src={url} type="video/mp4" />
        <source src={url} type="video/webm" />
        <source src={url} type="video/quicktime" />
      </video>
    )
  }

  return (
    <img
      src={url}
      alt="Adya"
      style={style ?? { width: '100%', height: '100%', objectFit: 'cover' }}
    />
  )
}
