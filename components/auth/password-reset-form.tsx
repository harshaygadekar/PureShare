/**
 * Password Reset Request Form
 * Request password reset link via email
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/shared/spinner';

export function PasswordResetForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Implement password reset API endpoint
      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success message
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <Alert className="border-success bg-success-bg">
          <AlertDescription className="text-success">
            Password reset link sent! Please check your email for instructions.
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-accent hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={isLoading}
          autoComplete="email"
        />
        <p className="text-sm text-tertiary">
          We'll send you a link to reset your password
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isLoading || !email}
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2" />
            Sending...
          </>
        ) : (
          'Send reset link'
        )}
      </Button>

      <div className="text-center">
        <Link
          href="/login"
          className="text-sm font-medium text-accent hover:underline"
        >
          Back to login
        </Link>
      </div>
    </form>
  );
}
