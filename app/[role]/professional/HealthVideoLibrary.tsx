// app/[role]/patient/HealthVideoLibrary.tsx

"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  PlayCircle,
  Clock,
  User,
  ThumbsUp,
  Share2,
  BookmarkPlus,
  Filter
} from "lucide-react";

// Define video interface
interface HealthVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  views: number;
  likes: number;
  author: {
    name: string;
    credentials: string;
    verified: boolean;
  };
  tags: string[];
  category: string;
  publishedDate: string;
}

// Sample video data
const SAMPLE_VIDEOS: HealthVideo[] = [
  {
    id: "1",
    title: "Understanding Modern Diabetes Management Techniques",
    description: "Comprehensive overview of current diabetes management strategies and latest research findings",
    thumbnail: "/api/placeholder/640/360",
    duration: "18:24",
    views: 15420,
    likes: 1242,
    author: {
      name: "Dr. Sarah Chen",
      credentials: "MD, Endocrinology",
      verified: true
    },
    tags: ["diabetes", "patient care", "treatment"],
    category: "Endocrinology",
    publishedDate: "2024-02-15"
  },
  // ... other video data
];

// Video Card Component
const VideoCard = ({ video }: { video: HealthVideo }) => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
    <div className="relative">
      <img 
        src={video.thumbnail} 
        alt={video.title} 
        className="w-full h-48 object-cover"
      />
      <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-sm">
        {video.duration}
      </div>
    </div>
    <CardContent className="p-4">
      {/* ... rest of the video card content ... */}
    </CardContent>
  </Card>
);

const HealthVideoLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState(SAMPLE_VIDEOS);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Medical Training Videos</CardTitle>
          <CardDescription>
            Access peer-reviewed educational content from verified medical professionals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative col-span-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button>
              Latest Videos
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default HealthVideoLibrary;