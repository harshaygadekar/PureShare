/**
 * New Password Form
 * Set new password after reset token validation
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/shared/spinner';
import { PasswordInput } from '@/components/features/password-input';
import { meetsMinimumRequirements } from '@/lib/auth/password-requirements';

interface NewPasswordFormProps {
  token: string;
}

export function NewPasswordForm({ token }: NewPasswordFormProps) {
  const router = useRouter();
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
      // TODO: Implement password reset completion API endpoint
      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

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
          Password reset successfully! Redirecting to login...
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
        <PasswordInput
          id="password"
          name="password"
          value={password}
          onChange={setPassword}
          label="New Password"
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
          !password ||
          !confirmPassword ||
          password !== confirmPassword ||
          !meetsMinimumRequirements(password)
        }
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2" />
            Resetting password...
          </>
        ) : (
          'Reset password'
        )}
      </Button>
    </form>
  );
}
