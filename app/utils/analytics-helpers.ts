//app/utils/analytics-helpers.ts
export const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  export const calculateChange = (current: number, previous: number): string => {
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };
  
  export const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
  };
  
  export const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };
  
  export const calculateTrend = (current: number, previous: number): { trend: 'up' | 'down', percentage: number } => {
    const percentage = ((current - previous) / previous) * 100;
    return {
      trend: percentage >= 0 ? 'up' : 'down',
      percentage: Math.abs(percentage)
    };
  };
  
  export const processPatientMetrics = (data: any) => {
    return data.map((metric: any) => ({
      month: format(new Date(metric.month), 'MMM'),
      newPatients: metric.newPatients,
      followUps: metric.followUps,
      referrals: metric.referrals,
      retention: metric.retention
    }));
  };
  
  export const calculateUtilization = (used: number, total: number): number => {
    return (used / total) * 100;
  };
  
  export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  export const generateChartColors = (count: number): string[] => {
    const baseColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
    return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
  };