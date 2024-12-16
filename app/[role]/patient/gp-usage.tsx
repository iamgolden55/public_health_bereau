'use client'

import { Battery, Settings, Heart } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import Link from 'next/link'

const weeklyData = [
  { day: 'M', usage: 60 },
  { day: 'T', usage: 80 },
  { day: 'W', usage: 55 },
  { day: 'T', usage: 30 },
  { day: 'F', usage: 35 },
  { day: 'S', usage: 20 },
  { day: 'S', usage: 75 },
]

const apps = [
  { name: 'Routine Checkups', icon: '/icons/background-apps.svg', usage: 60 },
  { name: 'Blood Tests', icon: '/icons/screen.svg', usage: 26 },
  { name: 'Exercise', icon: '/icons/apps.svg', usage: 54 },
  { name: 'Diet Compliance', icon: '/icons/ios-functions.svg', usage: 50 },
  { name: 'Medication Adherence', icon: '/icons/camera.svg', usage: 76 },
]

const socialApps = [
  { name: 'Google', icon: '/icons/google.svg' },
  { name: 'Reddit', icon: '/icons/reddit.svg' },
  { name: 'Spotify', icon: '/icons/spotify.svg' },
  { name: 'Twitch', icon: '/icons/twitch.svg' },
]

export default function HeartRate() {
  return (
    <Card className="w-full max-w-sm bg-white shadow-lg rounded-3xl">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-4 w-4 text-green-500" />
            <h2 className="text-sm font-semibold">GP Usage</h2>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold">42%</span>
            <span className="text-xs text-gray-500">75 minutes left estimated</span>
          </div>
          <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="absolute left-0 top-0 h-full bg-orange-500 transition-all duration-300" style={{ width: '42%' }} />
          </div>
        </div>

        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fill: '#94a3b8' }} 
              />
              <YAxis hide />
              <Bar 
                dataKey="usage" 
                fill="url(#colorUsage)" 
                radius={[3, 3, 0, 0]}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-1 text-center text-xs">
          <div>
            <div className="text-xs font-semibold">76.2%</div>
            <div className="text-gray-500 text-[10px]">Avg Monthly GP visits</div>
          </div>
          <div>
            <div className="text-xs font-semibold">96m</div>
            <div className="text-gray-500 text-[10px]">Avg GP session</div>
          </div>
          <div>
            <div className="text-xs font-semibold">1M 5 days</div>
            <div className="text-gray-500 text-[10px]">Time since last visit</div>
          </div>
        </div>

        <div className="space-y-2">
          {apps.map((app) => (
            <div key={app.name} className="flex items-center space-x-2">
              <img src={app.icon} alt={app.name} className="w-4 h-4" />
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[10px] font-medium">{app.name}</span>
                  <span className="text-[10px] text-gray-500">{app.usage}%</span>
                </div>
                <div className="relative w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-300" 
                    style={{ width: `${app.usage}%` }} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-100 rounded-lg p-3 space-y-1">
          <h3 className="text-sm font-medium">Set alerts for apps</h3>
          <p className="text-xs text-gray-500">Control how you want your apps to be used</p>
          <div className="flex space-x-2 mt-2">
            {socialApps.map((app) => (
              <img key={app.name} src={app.icon} alt={app.name} className="w-6 h-6" />
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className="bg-gray-100 p-1.5 rounded-full">
            <Settings className="w-3 h-3" />
          </div>
          <span>Public Data</span>
          <span className="flex-grow" />
          <span className="text-[10px]">The data used in this connection is public data only</span>
        </div>

        <p className="text-[10px] text-gray-400">
          By clicking "Next," you confirm your intention to connect your app to Tradie API. This
          action signifies you accept of the <Link href="#" className="text-blue-500">Terms and conditions</Link> outlined.
        </p>
      </CardContent>
    </Card>
  )
}