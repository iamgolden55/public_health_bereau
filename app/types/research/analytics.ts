// app/types/research/analytics.ts

export interface AnalyticsReport {
    id: number;
    project: number;
    title: string;
    report_type: ReportType;
    parameters: any; // Analysis parameters
    results: any; // Analysis results
    visualizations?: any; // Visualization configs
    confidence_score: number;
    generated_at: string;
    updated_at: string;
  }
  
  export interface DataPoint {
    id: number;
    cohort: number;
    patient: number;
    category: string;
    value: any; // Flexible storage for different types of data
    timestamp: string;
    created_at: string;
  }
  
  export interface ResearchPublication {
    id: number;
    project: number;
    title: string;
    authors: Author[];
    abstract: string;
    publication_date: string;
    journal?: string;
    doi?: string;
    url?: string;
    citation_count: number;
    keywords: string[];
    created_at: string;
  }
  
  export interface Author {
    name: string;
    affiliation: string;
    email?: string;
    is_corresponding: boolean;
  }
  
  export type ReportType = 
    | 'TREND'
    | 'CORRELATION'
    | 'PREDICTION'
    | 'COMPARATIVE'
    | 'OUTCOME';