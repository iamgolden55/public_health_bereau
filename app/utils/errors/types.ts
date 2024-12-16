// app/utils/errors/types.ts

export class ApiError extends Error {
    constructor(
      message: string,
      public userMessage: string,
      public statusCode?: number
    ) {
      super(message);
      this.name = 'ApiError';
    }
  }
  
  export class NetworkError extends Error {
    constructor(message = 'Network connection error') {
      super(message);
      this.name = 'NetworkError';
    }
  }
  
  export interface ErrorFallbackProps {
    error: Error;
    resetError: () => void;
  }