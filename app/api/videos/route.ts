import { NextResponse } from 'next/server'

export async function GET() {
  // This data would typically come from a database
  const videos = [
    { id: 1, title: "CPR Basics", duration: "5:30", rating: 4.8, match: "97", thumbnail: "/placeholder.svg?height=240&width=160&text=CPR+Basics", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "First Aid Essentials", year: "2023", parts: "4" },
    { id: 2, title: "Natural Headache Relief", duration: "7:15", rating: 4.5, match: "95", thumbnail: "/placeholder.svg?height=240&width=160&text=Headache+Relief", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "Home Remedies", year: "2023", parts: "6" },
    { id: 3, title: "Recognizing Heart Attack Signs", duration: "6:45", rating: 4.9, match: "98", thumbnail: "/placeholder.svg?height=240&width=160&text=Heart+Attack+Signs", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "Understanding Symptoms", year: "2023", parts: "3" },
    { id: 4, title: "Mindfulness Meditation", duration: "10:00", rating: 4.7, match: "94", thumbnail: "/placeholder.svg?height=240&width=160&text=Mindfulness", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "Wellness Tips", year: "2023", parts: "8" },
    { id: 5, title: "Healthy Eating Habits", duration: "8:20", rating: 4.6, match: "96", thumbnail: "/placeholder.svg?height=240&width=160&text=Healthy+Eating", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "Nutrition", year: "2023", parts: "5" },
  ]

  return NextResponse.json(videos)
}