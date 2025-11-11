/**
 * Email Verification Page
 * Verify user email address with token
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/shared/spinner';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface VerifyEmailPageProps {
  params: {
    token: string;
  };
}

export default function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: params.token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Email verified successfully!');

          // Redirect to login after short delay
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification');
      }
    };

    verifyEmail();
  }, [params.token, router]);

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Email Verification</CardTitle>
        <CardDescription>
          {status === 'loading' && 'Verifying your email address...'}
          {status === 'success' && 'Your email has been verified'}
          {status === 'error' && 'Verification failed'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Spinner className="h-12 w-12" />
            <p className="mt-4 text-sm text-secondary">Please wait...</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <Alert className="border-success bg-success-bg">
              <FiCheckCircle className="h-5 w-5 text-success" />
              <AlertDescription className="ml-2 text-success">
                {message}
              </AlertDescription>
            </Alert>
            <div className="text-center">
              <p className="mb-4 text-sm text-secondary">
                Redirecting to login in 3 seconds...
              </p>
              <Button asChild>
                <Link href="/login">Go to Login</Link>
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <Alert variant="destructive">
              <FiXCircle className="h-5 w-5" />
              <AlertDescription className="ml-2">
                {message}
              </AlertDescription>
            </Alert>
            <div className="space-y-4 text-center">
              <p className="text-sm text-secondary">
                The verification link may have expired or is invalid.
              </p>
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link href="/signup">Create New Account</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/login">Back to Login</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
