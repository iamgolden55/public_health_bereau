// verify-email/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // verify-email/page.tsx
useEffect(() => {
  const handleVerification = async () => {
    const token = searchParams.get('token');
    const userDataParam = searchParams.get('userData');
    const error = searchParams.get('error');
    const status = searchParams.get('status');

    if (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setErrorMessage(error === 'invalid_token' 
        ? 'Invalid verification token' 
        : 'Verification failed. Please try again or contact support.');
      return;
    }

    if (status === 'success' && token && userDataParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataParam));
        
        // Store auth data
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(userData));

        setStatus('success');
        setTimeout(() => router.push('/[role]/patient'), 2000);
      } catch (error) {
        console.error('Error processing verification data:', error);
        setStatus('error');
        setErrorMessage('Error processing verification data');
      }
    } else {
      setStatus('error');
      setErrorMessage('Missing verification data');
    }
  };

  handleVerification();
}, [searchParams, router]);

  // ... rest of your existing JSX return

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        {status === 'verifying' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Verifying Your Email</h2>
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Please wait while we verify your email address...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-600">Email Verified Successfully!</h2>
            <p className="text-gray-600">Your email has been verified.</p>
            <p className="mt-2 text-gray-600">Redirecting to dashboard...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Verification Failed</h2>
            <p className="text-gray-600">We couldn't verify your email address.</p>
            <p className="mt-2 text-gray-600">Please try again or contact support.</p>
            <button 
              onClick={() => router.push('/auth/login')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}