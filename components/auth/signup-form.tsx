/**
 * Signup Form Component
 * User registration form with password strength validation
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/shared/spinner';
import { PasswordInput } from '@/components/features/password-input';
import { meetsMinimumRequirements } from '@/lib/auth/password-requirements';

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (!meetsMinimumRequirements(password)) {
      setError('Password does not meet requirements');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Show success message
      setSuccess(true);

      // Redirect after short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Alert className="border-success bg-success-bg">
        <AlertDescription className="text-success">
          Account created successfully! Please check your email to verify your account.
          Redirecting to login...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            disabled={isLoading}
            autoComplete="name"
          />
        </div>

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
        </div>

        <PasswordInput
          id="password"
          name="password"
          value={password}
          onChange={setPassword}
          label="Password"
          placeholder="Create a strong password"
          showStrengthMeter
          showRequirements
          disabled={isLoading}
        />

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            disabled={isLoading}
            autoComplete="new-password"
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-sm text-error">Passwords do not match</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={
          isLoading ||
          !name ||
          !email ||
          !password ||
          !confirmPassword ||
          password !== confirmPassword ||
          !meetsMinimumRequirements(password)
        }
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2" />
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </Button>

      <p className="text-center text-sm text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs text-tertiary">
        By creating an account, you agree to our{' '}
        <Link href="/terms" className="text-accent hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-accent hover:underline">
          Privacy Policy
        </Link>
      </p>
    </form>
  );
}
