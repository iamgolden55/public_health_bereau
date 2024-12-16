'use client'

import React, { useState, useEffect } from 'react'
import { Search, Play, Info, ChevronRight, Pause, Volume2, VolumeX, Plus, ThumbsUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import HealthVideoLibrarySkeleton from './health-video-library-skeleton'
import { YouTubeEmbed } from '@/app/components/YouTubeEmbed'

// This could be fetched from your backend
const videos = [
  { id: 1, title: "CPR Basics", duration: "5:30", rating: 4.8, match: "97", thumbnail: "/placeholder.svg?height=240&width=160&text=CPR+Basics", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "First Aid Essentials", year: "2023", parts: "4" },
  { id: 2, title: "Natural Headache Relief", duration: "7:15", rating: 4.5, match: "95", thumbnail: "/placeholder.svg?height=240&width=160&text=Headache+Relief", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "Home Remedies", year: "2023", parts: "6" },
  { id: 3, title: "Recognizing Heart Attack Signs", duration: "6:45", rating: 4.9, match: "98", thumbnail: "/placeholder.svg?height=240&width=160&text=Heart+Attack+Signs", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "Understanding Symptoms", year: "2023", parts: "3" },
  { id: 4, title: "Mindfulness Meditation", duration: "10:00", rating: 4.7, match: "94", thumbnail: "/placeholder.svg?height=240&width=160&text=Mindfulness", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "Wellness Tips", year: "2023", parts: "8" },
  { id: 5, title: "Healthy Eating Habits", duration: "8:20", rating: 4.6, match: "96", thumbnail: "/placeholder.svg?height=240&width=160&text=Healthy+Eating", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "Nutrition", year: "2023", parts: "5" },
]

function VideoPreviewDialog({ video, isOpen, onClose }) {
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const toggleMute = () => setIsMuted(!isMuted)
  const togglePlay = () => setIsPlaying(!isPlaying)

  const handlePlay = () => {
    setIsMuted(false)
    setIsPlaying(true)
    setIsFullScreen(true)
  }

  const exitFullScreen = () => {
    setIsFullScreen(false)
    setIsPlaying(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] sm:w-[80vw] p-0 h-[80vh] sm:h-[65vh] overflow-y-auto bg-black text-white border-0 rounded-none sm:rounded-md mx-auto my-auto">
        <div className="relative h-full">
          {isFullScreen ? (
            <div className="absolute inset-0 z-50 bg-black">
              <YouTubeEmbed
                videoUrl={video.videoUrl}
                autoplay={true}
                muted={false}
                controls={true}
                className="w-full h-full"
              />
              <button 
                onClick={exitFullScreen}
                className="absolute top-4 right-4 z-60 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          ) : (
            <>
              {/* Video Preview Section */}
              <div className="relative h-[40vh] sm:h-[250px] w-full sticky top-0 z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black z-10" />
                <YouTubeEmbed
                  videoUrl={video.videoUrl}
                  autoplay={true}
                  muted={isMuted}
                  controls={false}
                  className="w-full h-full"
                />
                <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-4 z-20 flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white">
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white">
                    {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                  </Button>
                </div>
              </div>

              {/* Content Details Section */}
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="w-full sm:w-2/3 space-y-3 sm:space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-bold">{video.title}</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                      <Badge className="bg-red-600 hover:bg-red-700">{video.category}</Badge>
                      <span className="text-green-500 font-semibold">{video.match}% Match</span>
                      <span>{video.year}</span>
                      <span>{video.parts} Parts</span>
                      <span>{video.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <Button 
                        className="bg-white text-black hover:bg-white/90 px-4 sm:px-6 py-1 sm:py-2 text-sm sm:text-base"
                        onClick={handlePlay}
                      >
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> Play
                      </Button>
                      <Button variant="secondary" size="icon" className="rounded-full bg-white/20 hover:bg-white/30 p-1 sm:p-2">
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      <Button variant="secondary" size="icon" className="rounded-full bg-white/20 hover:bg-white/30 p-1 sm:p-2">
                        <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </div>
                    <p className="text-sm sm:text-base">
                      {video.title === "CPR Basics" ? "Learn essential CPR techniques and life-saving procedures in this comprehensive guide. Perfect for healthcare professionals and anyone interested in emergency response." : 
                       video.title === "Natural Headache Relief" ? "Discover natural remedies and techniques to alleviate headaches without medication. This guide offers practical tips for managing various types of headaches." :
                       video.title === "Recognizing Heart Attack Signs" ? "Learn to identify the early warning signs of a heart attack. This crucial information could help save lives in emergency situations." :
                       video.title === "Mindfulness Meditation" ? "Explore the practice of mindfulness meditation and its benefits for mental health. Learn techniques to reduce stress and improve overall well-being." :
                       "Discover the fundamentals of a balanced diet and healthy eating habits. This guide provides practical tips for nutrition and meal planning."}
                    </p>
                    <div>
                      <span className="text-gray-400">Presented by:</span>
                      <span className="ml-2">
                        {video.title === "CPR Basics" ? "Dr. Sarah Chen, Emergency Medicine Specialist" :
                         video.title === "Natural Headache Relief" ? "Dr. Michael Roberts, Neurologist" :
                         video.title === "Recognizing Heart Attack Signs" ? "Dr. Emily Johnson, Cardiologist" :
                         video.title === "Mindfulness Meditation" ? "Lisa Thompson, Certified Mindfulness Instructor" :
                         "Nutritionist Mark Davis, RD"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Topics:</span>
                      <span className="ml-2">
                        {video.title === "CPR Basics" ? "Emergency Response, First Aid, Life-Saving Techniques" :
                         video.title === "Natural Headache Relief" ? "Pain Management, Natural Remedies, Wellness" :
                         video.title === "Recognizing Heart Attack Signs" ? "Cardiovascular Health, Emergency Symptoms, Preventive Care" :
                         video.title === "Mindfulness Meditation" ? "Mental Health, Stress Reduction, Mindfulness Practices" :
                         "Nutrition, Meal Planning, Healthy Lifestyle"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">This video is:</span>
                      <span className="ml-2">Informative, Educational, Practical</span>
                    </div>
                  </div>
                  <div className="w-full sm:w-1/3">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">More Like This</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3">
                      {videos.filter(v => v.id !== video.id).slice(0, 3).map((relatedVideo) => (
                        <div key={relatedVideo.id} className="relative aspect-video rounded-md overflow-hidden">
                          <img
                            src={relatedVideo.thumbnail}
                            alt={relatedVideo.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Play className="h-8 w-8 sm:h-10 sm:w-10" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const VideoThumbnail = ({ video, onClick }) => {
  return (
    <div
      onClick={() => onClick(video)}
      className="relative flex-none w-[160px] h-[240px] rounded-md overflow-hidden transition-all duration-300 transform hover:scale-105 hover:z-10 bg-gray-900 shadow-lg group cursor-pointer"
    >
      <img
        src={video.thumbnail}
        alt={video.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300"></div>
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-green-500 font-semibold">{video.match}% Match</span>
          <span className="text-sm text-gray-300">{video.year}</span>
          <span className="text-sm text-gray-300">{video.parts} Parts</span>
        </div>
        <h3 className="text-white text-base font-semibold">{video.title}</h3>
      </div>
    </div>
  )
}

export default function HealthVideoLibrary() {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [featuredVideos, setFeaturedVideos] = useState([])
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0)
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchVideos() {
      setIsLoading(true)
      try {
        // Simulating API call with sample data
        await new Promise(resolve => setTimeout(resolve, 1000))
        setFeaturedVideos(videos.slice(0, 3))
      } catch (error) {
        console.error('Error fetching videos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVideos()
  }, [])

  const handleVideoSelect = (video) => {
    setSelectedVideo(video)
  }

  const handleSearch = (e) => {
    const query = e.target.value
    setSearch(query)
    if (query.length > 0) {
      const filtered = videos.filter(video => 
        video.title.toLowerCase().includes(query.toLowerCase())
      )
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  if (isLoading) {
    return <HealthVideoLibrarySkeleton />
  }

  return (
    <div className="w-full bg-black text-white relative z-0">
      <header className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black to-transparent">
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-red-600">MyFlix</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input
                placeholder="Search"
                value={search}
                onChange={handleSearch}
                className="bg-black/50 text-white border-none rounded w-40 focus:w-60 transition-all duration-300"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              {showSuggestions && (
                <div className="absolute top-full left-0 w-full mt-1 bg-black/90 rounded-md shadow-lg">
                  <ScrollArea className="h-48">
                    {suggestions.map((video) => (
                      <Button
                        key={video.id}
                        variant="ghost"
                        className="w-full justify-start text-left px-3 py-2 hover:bg-white/10"
                        onClick={() => handleVideoSelect(video)}
                      >
                        {video.title}
                      </Button>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="relative h-[70vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/0 to-black z-10"></div>
        {featuredVideos.map((video, index) => (
          <div
            key={video.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentFeaturedIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <YouTubeEmbed
              videoUrl={video.videoUrl}
              autoplay={index === currentFeaturedIndex}
              muted={true}
              controls={false}
              className="w-full h-full"
            />
          </div>
        ))}
        <div className="absolute bottom-[20%] left-[5%] z-20 max-w-xl">
          <h2 className="text-5xl font-bold mb-4">{featuredVideos[currentFeaturedIndex]?.title}</h2>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-green-500 font-semibold">{featuredVideos[currentFeaturedIndex]?.match}% Match</span>
            <span>{featuredVideos[currentFeaturedIndex]?.year}</span>
            <span>{featuredVideos[currentFeaturedIndex]?.parts} Parts</span>
          </div>
          <p className="text-lg mb-6">Featured health video content</p>
          <div className="flex gap-4">
            <Button className="bg-white text-black hover:bg-white/90 px-8" onClick={() => handleVideoSelect(featuredVideos[currentFeaturedIndex])}>
              <Play className="w-5 h-5 mr-2" /> Play
            </Button>
            <Button variant="secondary" className="bg-gray-500/50 hover:bg-gray-500/70 px-8" onClick={() => handleVideoSelect(featuredVideos[currentFeaturedIndex])}>
              <Info className="w-5 h-5 mr-2" /> More Info
            </Button>
          </div>
        </div>
      </div>

      <div className="relative z-20 -mt-16 pb-10 bg-black">
        <section className="px-4 py-4">
          <h2 className="text-xl font-semibold mb-4">Popular on MyFlix</h2>
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-4">
              {videos.map((video) => (
                <VideoThumbnail key={video.id} video={video} onClick={handleVideoSelect} />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>

        <section className="px-4 py-4">
          <h2 className="text-xl font-semibold mb-4">Trending Now</h2>
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-4">
              {videos.map((video) => (
                <VideoThumbnail key={video.id} video={video} onClick={handleVideoSelect} />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>

        <section className="px-4 py-4">
          <h2 className="text-xl font-semibold mb-4">Watch Again</h2>
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-4">
              {videos.map((video) => (
                <VideoThumbnail key={video.id} video={video} onClick={handleVideoSelect} />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>
      </div>

      {selectedVideo && (
        <VideoPreviewDialog
          video={selectedVideo}
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  )
}