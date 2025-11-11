/**
 * Reset Password Page
 * Set new password with token
 */

import { NewPasswordForm } from '@/components/auth/new-password-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ResetPasswordPageProps {
  params: {
    token: string;
  };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Set new password</CardTitle>
        <CardDescription>
          Choose a strong password for your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NewPasswordForm token={params.token} />
      </CardContent>
    </Card>
  );
}
