/**
 * Signup Page
 * User registration page
 */

import { SignupForm } from '@/components/auth/signup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignupPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Create an account</CardTitle>
        <CardDescription>
          Start sharing files securely in seconds
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </Card>
  );
}
