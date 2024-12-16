'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { getYouTubeVideoId } from '@/utils/youtube'

interface YouTubeEmbedProps {
  videoUrl: string
  autoplay?: boolean
  muted?: boolean
  controls?: boolean
  className?: string
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export function YouTubeEmbed({ videoUrl, autoplay = false, muted = false, controls = true, className = "" }: YouTubeEmbedProps) {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [isMuted, setIsMuted] = useState(muted)
  const [isReady, setIsReady] = useState(false)
  const videoId = getYouTubeVideoId(videoUrl)

  useEffect(() => {
    if (!videoId) return;

    const tag = document.createElement('script')
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = initializePlayer

    return () => {
      window.onYouTubeIframeAPIReady = () => {}
    }
  }, [videoId])

  const initializePlayer = () => {
    if (!videoId) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        mute: muted ? 1 : 0,
        controls: controls ? 1 : 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: () => setIsReady(true),
      },
    })
  }

  const togglePlay = () => {
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (isMuted) {
      playerRef.current.unMute()
    } else {
      playerRef.current.mute()
    }
    setIsMuted(!isMuted)
  }

  if (!videoId) {
    return <div className={`bg-gray-900 flex items-center justify-center ${className}`}>Invalid YouTube URL</div>
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
      {!controls && isReady && (
        <div className="absolute bottom-4 left-4 flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white">
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white">
            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </Button>
        </div>
      )}
    </div>
  )
}