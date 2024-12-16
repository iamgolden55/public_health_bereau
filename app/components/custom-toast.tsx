"use client";

import { Button } from "@/components/ui/button";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { CircleCheck, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Types for toast management
interface ToastItem {
  id: string;
  title: string;
  description: string;
  duration: number;
  type?: 'success' | 'error' | 'warning' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastOptions {
  duration?: number;
  type?: ToastItem['type'];
  action?: ToastItem['action'];
}

interface ProgressTimerProps {
  duration: number;
  interval?: number;
  onComplete?: () => void;
}

// Progress timer hook for toast animations
function useProgressTimer({ duration, interval = 100, onComplete }: ProgressTimerProps) {
  const [progress, setProgress] = useState(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setProgress(duration);
  }, [duration, cleanup]);

  const start = useCallback(() => {
    cleanup();
    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsedTime);

      setProgress(remaining);

      if (remaining <= 0) {
        cleanup();
        onComplete?.();
      }
    }, interval);
  }, [duration, interval, cleanup, onComplete]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { progress, start, reset };
}

// Main toast hook
export function useCustomToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastQueue = useRef<ToastItem[]>([]);
  const activeToastCount = useRef(0);
  const MAX_TOASTS = 3;

  // Process the toast queue
  const processQueue = useCallback(() => {
    if (toastQueue.current.length > 0 && activeToastCount.current < MAX_TOASTS) {
      const nextToast = toastQueue.current.shift();
      if (nextToast) {
        setToasts(current => [...current, nextToast]);
        activeToastCount.current++;

        // Auto-remove toast after duration
        setTimeout(() => {
          removeToast(nextToast.id);
        }, nextToast.duration);
      }
    }
  }, []);

  // Remove a toast and process queue
  const removeToast = useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id));
    activeToastCount.current = Math.max(0, activeToastCount.current - 1);
    setTimeout(processQueue, 300); // Allow for animation
  }, [processQueue]);

  // Show a new toast
  const showToast = useCallback((
    title: string,
    description: string,
    options: ToastOptions = {}
  ) => {
    const id = Math.random().toString(36).slice(2);
    const newToast: ToastItem = {
      id,
      title,
      description,
      duration: options.duration || 5000,
      type: options.type || 'success',
      action: options.action
    };

    if (activeToastCount.current < MAX_TOASTS) {
      setToasts(current => [...current, newToast]);
      activeToastCount.current++;

      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    } else {
      toastQueue.current.push(newToast);
    }

    return id;
  }, [removeToast]);

  // Toast component with animations
  const ToastComponent = useCallback(() => (
    <ToastProvider swipeDirection="left">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          duration={toast.duration}
          onOpenChange={(open) => {
            if (!open) removeToast(toast.id);
          }}
        >
          <div className="flex w-full justify-between gap-3">
            <CircleCheck
              className={`mt-0.5 shrink-0 ${
                toast.type === 'error' ? 'text-red-500' :
                toast.type === 'warning' ? 'text-yellow-500' :
                'text-emerald-500'
              }`}
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
            <div className="flex grow flex-col gap-3">
              <div className="space-y-1">
                <ToastTitle>{toast.title}</ToastTitle>
                <ToastDescription>{toast.description}</ToastDescription>
              </div>
              {toast.action && (
                <ToastAction altText="Toast action" asChild>
                  <Button
                    size="sm"
                    onClick={toast.action.onClick}
                  >
                    {toast.action.label}
                  </Button>
                </ToastAction>
              )}
            </div>
            <ToastClose asChild>
              <Button
                variant="ghost"
                className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
                aria-label="Close notification"
              >
                <X
                  size={16}
                  strokeWidth={2}
                  className="opacity-60 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
              </Button>
            </ToastClose>
          </div>
          <div className="contents" aria-hidden="true">
            <div
              className="pointer-events-none absolute bottom-0 left-0 h-1 bg-emerald-500"
              style={{
                animation: `shrink ${toast.duration}ms linear forwards`
              }}
            />
          </div>
        </Toast>
      ))}
      <ToastViewport className="sm:left-0 sm:right-auto" />
    </ToastProvider>
  ), [toasts, removeToast]);

  return { showToast, ToastComponent };
}