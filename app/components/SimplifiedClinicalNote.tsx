'use client'

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Brain, Loader2, Calendar, User, Printer, Share2, ChevronDown, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface SimplifiedNoteProps {
    clinicalNote: string;
    recordDate?: string;
    doctorName?: string;
}

interface CacheItem {
    simplified: string;
    timestamp: number;
}

const CACHE_KEY = 'simplified_notes_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Medical terms dictionary
const MEDICAL_TERMS = {
    "COPD": "Chronic Obstructive Pulmonary Disease - A chronic inflammatory lung disease that causes blocked airflow from the lungs",
    "dyspnea": "Difficulty or labored breathing",
    "auscultation": "The action of listening to sounds from the heart, lungs, or other organs",
    "rhonchi": "Continuous, low-pitched breathing sounds",
    "SpO2": "Blood oxygen saturation level - Measures how much oxygen your blood is carrying",
    "bronchodilators": "Medications that help open up the airways in the lungs",
    "corticosteroids": "Anti-inflammatory medications that help reduce swelling in the airways"
    // Add more terms as needed
};

export default function SimplifiedClinicalNote({ clinicalNote, recordDate, doctorName }: SimplifiedNoteProps) {
    const [simplified, setSimplified] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check cache on component mount
    useEffect(() => {
        const checkCache = () => {
            try {
                const cache = localStorage.getItem(CACHE_KEY);
                if (cache) {
                    const cacheData = JSON.parse(cache);
                    const noteCache = cacheData[clinicalNote] as CacheItem;
                    
                    if (noteCache && Date.now() - noteCache.timestamp < CACHE_DURATION) {
                        setSimplified(noteCache.simplified);
                        return true;
                    }
                }
                return false;
            } catch (error) {
                console.error('Cache read error:', error);
                return false;
            }
        };

        checkCache();
    }, [clinicalNote]);

    const getSimplifiedNote = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/clinical-notes/simplify/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ clinical_note: clinicalNote })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to simplify note');
            }

            const data = await response.json();
            setSimplified(data.simplified);
            
            // Optional: Show cache status
            if (data.cached) {
                console.log('Retrieved from cache');
            }

        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        const printContent = `
            Clinical Note:
            ${clinicalNote}
            
            Simplified Explanation:
            ${simplified}
            
            Date: ${recordDate ? new Date(recordDate).toLocaleDateString() : 'N/A'}
            Doctor: ${doctorName ? `Dr. ${doctorName}` : 'N/A'}
        `;
        
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow?.document.write(`
            <html>
                <head><title>Clinical Note</title></head>
                <body style="font-family: Arial; padding: 20px; white-space: pre-wrap;">
                    ${printContent}
                </body>
            </html>
        `);
        printWindow?.document.close();
        printWindow?.print();
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Clinical Note',
                    text: `${simplified}\n\nDate: ${recordDate ? new Date(recordDate).toLocaleDateString() : 'N/A'}`
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        }
    };

    // Function to highlight medical terms
    const highlightMedicalTerms = (text: string) => {
        let highlightedText = text;
        Object.keys(MEDICAL_TERMS).forEach(term => {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            highlightedText = highlightedText.replace(regex, match => `<mark data-term="${term}">${match}</mark>`);
        });
        return highlightedText;
    };

    if (error) {
        return (
            <Alert>
                <AlertTitle className="text-xl">Error</AlertTitle>
                <AlertDescription className="text-lg">{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-4">
            {!simplified && (
                <div className="flex justify-center">
                    <Button 
                        onClick={getSimplifiedNote}
                        disabled={loading}
                        className="text-lg py-6 px-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Simplifying...
                            </>
                        ) : (
                            <>
                                <Brain className="mr-2 h-5 w-5" />
                                Get Patient-Friendly Explanation
                            </>
                        )}
                    </Button>
                </div>
            )}
            
            {simplified && (
                <Collapsible>
                    <Alert className="bg-white dark:bg-gray-800 border-2 shadow-lg">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                                <Brain className="h-6 w-6 text-green-600 dark:text-green-400"/>
                            </div>
                            <div className="space-y-4 flex-1">
                                <div className="flex justify-between items-start">
                                    <AlertTitle className="text-2xl font-semibold mb-2">
                                        Patient-Friendly Explanation
                                    </AlertTitle>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={handlePrint}>
                                            <Printer className="h-4 w-4 mr-1" />
                                            Print
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handleShare}>
                                            <Share2 className="h-4 w-4 mr-1" />
                                            Share
                                        </Button>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <ChevronDown className="h-4 w-4" />
                                            </Button>
                                        </CollapsibleTrigger>
                                    </div>
                                </div>

                                <AlertDescription 
                                    className="text-lg leading-relaxed tracking-wide"
                                    dangerouslySetInnerHTML={{ 
                                        __html: highlightMedicalTerms(simplified) 
                                    }}
                                    onClick={(e) => {
                                        const mark = (e.target as HTMLElement).closest('mark');
                                        if (mark) {
                                            const term = mark.dataset.term;
                                            if (term && MEDICAL_TERMS[term]) {
                                                // Show tooltip or dialog with definition
                                            }
                                        }
                                    }}
                                />

                                <CollapsibleContent>
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Medical Terms</h4>
                                        <div className="grid gap-2">
                                            {Object.entries(MEDICAL_TERMS).map(([term, definition]) => (
                                                <TooltipProvider key={term}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                                                                <Info className="h-4 w-4 mt-1 text-blue-500" />
                                                                <div>
                                                                    <span className="font-medium">{term}</span>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {definition}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Click for more details
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ))}
                                        </div>
                                    </div>
                                </CollapsibleContent>

                                {(recordDate || doctorName) && (
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            {recordDate && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(recordDate).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            {doctorName && (
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    <span>Dr. {doctorName}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Alert>
                </Collapsible>
            )}
        </div>
    );
} 