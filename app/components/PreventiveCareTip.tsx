'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Terminal } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

interface HealthTip {
    topic: string;
    title: string;
    content: string;
    category: string;
    readingTime: string;
    tags: string[];
}

const CACHE_KEY = 'health_tip_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export default function PreventiveCareTip() {
    const [tip, setTip] = useState<HealthTip | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDailyTip = async () => {
            try {
                // Check cache first
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    const age = Date.now() - timestamp;
                    
                    if (age < CACHE_DURATION) {
                        setTip(data);
                        setLoading(false);
                        return;
                    }
                }

                const token = localStorage.getItem('token');
                if (!token) throw new Error('No authentication token found');

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/health-tips/daily/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to fetch health tip');
                }

                const data = await response.json();
                
                // Cache the new tip
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }));
                
                setTip(data);
            } catch (error: any) {
                console.error('Error fetching health tip:', error);
                setError(error.message || 'Failed to load health tip');
            } finally {
                setLoading(false);
            }
        };

        fetchDailyTip();
    }, []);

    if (loading) {
        return <div className="animate-pulse h-20 bg-gray-100 dark:bg-gray-700 rounded-lg" />;
    }

    if (error) {
        return (
            <Alert>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!tip) return null;

    return (
        <Alert>
            <div className="flex items-start">
            <Terminal className="h-20 w-20"/>
                <div className="font-['Apple_SD_Gothic_Neo']">
                    <AlertTitle className="text-lg font-semibold">
                        {tip.title}
                    </AlertTitle>
                    <AlertDescription className="mt-1">
                        {tip.content}
                    </AlertDescription>
                </div>
            </div>
        </Alert>
    );
} 