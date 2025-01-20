//app/professional/components/analytics/QuickStatCard.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuickStatCardProps } from './types'

export const QuickStatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon,
  trend = 'up' 
}: QuickStatCardProps) => {
  const trendColor = trend === 'up' ? 'text-green-500' : 'text-red-500'
  const trendIcon = trend === 'up' ? '↑' : '↓'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${trendColor} flex items-center gap-1`}>
          <span>{trendIcon}</span>
          {change} from last periodssss
        </p>
      </CardContent>
    </Card>
  )
}