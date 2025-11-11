/**
 * Forgot Password Page
 * Request password reset link
 */

import { PasswordResetForm } from '@/components/auth/password-reset-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Reset password</CardTitle>
        <CardDescription>
          Enter your email to receive a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PasswordResetForm />
      </CardContent>
    </Card>
  );
}
