// app/utils/errors/errorHandlers.ts

import { ApiError, NetworkError } from './types'

export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.userMessage
  }
  if (error instanceof NetworkError) {
    return 'Connection error. Please check your internet connection.'
  }
  return 'An unexpected error occurred. Please try again.'
}

export const createApiError = (
  message: string,
  userMessage: string,
  statusCode?: number
) => {
  return new ApiError(message, userMessage, statusCode)
}