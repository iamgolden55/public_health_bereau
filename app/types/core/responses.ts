// app/types/core/responses.ts
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
    status: number;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// Base response type for API calls
